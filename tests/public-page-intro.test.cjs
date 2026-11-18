const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const flush = () => new Promise(setImmediate);
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function intro({ ready = true } = {}) {
  let visible;
  let effect;
  let now = 0;
  let nextTimer = 0;
  const timers = new Map();
  const listeners = new Map();
  const refs = [];
  const images = deferred();
  const animationDone = deferred();
  const animations = [];
  if (ready) images.resolve();
  const react = {
    useState(initial) { visible = initial(); return [visible, (value) => { visible = value; }]; },
    useRef() { const ref = { current: null }; refs.push(ref); return ref; },
    useLayoutEffect(callback) { effect = callback; },
  };
  const window = {
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    getComputedStyle: () => ({ filter: "none" }),
  };
  const rect = (left, top, width, height) => ({ left, top, width, height });
  function node(bounds) {
    return {
      style: {},
      getBoundingClientRect: () => bounds,
      decode: () => images.promise,
      animate() {
        const animation = { finished: animationDone.promise, cancel() {} };
        animations.push(animation);
        return animation;
      },
    };
  }
  const header = node(rect(80, 20, 101, 32));
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, "../src/components/PublicPageIntro.tsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => {
    if (name === "react") return react;
    if (name === "react-router-dom") return { useLocation: () => ({ pathname: "/" }) };
    if (name.endsWith(".png") || name.endsWith(".css")) return {};
    return require(name);
  };
  new Function("require", "module", "exports", "window", source)(localRequire, module, module.exports, window);
  module.exports.default({ children: null });
  const nodes = [
    { querySelector: (selector) => selector === "[data-intro-logo]" ? header : null },
    node(rect(0, 0, 1265, 720)),
    node(rect(440, 250, 380, 223)),
    node(rect(0, 0, 0, 0)),
  ];
  refs.forEach((ref, index) => { ref.current = nodes[index]; });
  let cleanup = effect();
  return {
    get visible() { return visible; },
    animations,
    images,
    async tick(ms) {
      const until = now + ms;
      await flush();
      while (true) {
        const due = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        now = due[1].at;
        timers.delete(due[0]);
        due[1].callback();
        await flush();
      }
      now = until;
    },
    resize() { listeners.get("resize")?.forEach((callback) => callback()); },
    finish() { animationDone.resolve(); },
    restartEffect() { cleanup(); cleanup = effect(); },
    cleanup() { cleanup(); },
  };
}

test("an initial viewport resize does not skip the intro while resources load", async () => {
  const page = intro({ ready: false });
  page.resize();
  assert.equal(page.visible, true);
  page.cleanup();
});

test("a cold logo download gets a visible interval before the circle closes", async () => {
  const page = intro({ ready: false });
  await page.tick(2100);
  assert.equal(page.animations.length, 0);
  page.images.resolve();
  await page.tick(1049);
  assert.equal(page.animations.length, 0);
  await page.tick(1);
  assert.equal(page.animations.length, 3);
  page.finish();
  await flush();
  assert.equal(page.visible, false);
  page.cleanup();
});

test("StrictMode cleanup leaves only the current intro running", async () => {
  const page = intro();
  page.restartEffect();
  await page.tick(1050);
  assert.equal(page.animations.length, 3);
  page.finish();
  await flush();
  assert.equal(page.visible, false);
  page.cleanup();
});

test("resources that never load cannot block access indefinitely", async () => {
  const page = intro({ ready: false });
  await page.tick(8000);
  assert.equal(page.visible, false);
  page.cleanup();
});
