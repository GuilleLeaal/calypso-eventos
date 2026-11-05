const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Exercise the real TypeScript functions without a browser or a live database.
function loadSource(relativePath, mocks = {}, window = {}, expose = "") {
  const filename = path.resolve(__dirname, "..", relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith(".")) return require(name);
    const target = path.resolve(path.dirname(filename), name + ".ts");
    return loadSource(path.relative(path.resolve(__dirname, ".."), target), mocks, window);
  };
  new Function("require", "module", "exports", "window", "console", source + expose)(localRequire, module, module.exports, window, { error() {} });
  return module.exports;
}

function hookState() {
  const values = [];
  let cursor = 0;
  return {
    react: {
      useEffect() {},
      useState(initial) {
        const index = cursor++;
        if (!(index in values)) values[index] = typeof initial === "function" ? initial() : initial;
        return [values[index], (next) => { values[index] = typeof next === "function" ? next(values[index]) : next; }];
      },
      useRef(initial) {
        const index = cursor++;
        if (!(index in values)) values[index] = { current: initial };
        return values[index];
      },
    },
    render(fn) { cursor = 0; return fn(); },
  };
}

function database(responses) {
  const calls = [];
  return {
    calls,
    from(table) {
      assert.ok(responses.length, "Unexpected database call");
      const response = responses.shift();
      const call = { table, steps: [] };
      calls.push(call);
      const resolve = () => response instanceof Error ? Promise.reject(response) : Promise.resolve(response);
      const builder = new Proxy({}, { get(_, method) {
        if (method === "then") return (yes, no) => resolve().then(yes, no);
        if (method === "single") return resolve;
        return (...args) => { call.steps.push([method, ...args]); return builder; };
      } });
      return builder;
    },
  };
}

const { validateReview } = loadSource("src/lib/reviewValidation.ts");
const { validateDisabledRange } = loadSource("src/pages/admin/utils/disabledRangeValidation.ts");

test("reviews validate optional/public names, required/admin names and length limits", () => {
  assert.equal(validateReview("", "Opinión pública"), "");
  assert.notEqual(validateReview("  ", "Opinión", true), "");
  assert.notEqual(validateReview("Cliente", "   ", true), "");
  assert.equal(validateReview("N".repeat(60), "A".repeat(300), true), "");
  assert.notEqual(validateReview("N".repeat(61), "Opinión", true), "");
  assert.notEqual(validateReview("Cliente", "A".repeat(301), true), "");
});

test("disabled ranges reject invalid/reversed/past dates and retain ongoing starts", () => {
  const values = { start_date: "2026-11-04", end_date: "2026-11-05", reason: "" };
  const validate = (changes, original) => validateDisabledRange({ ...values, ...changes }, "2026-11-04", original);
  assert.equal(validate({}), "");
  assert.notEqual(validate({ start_date: "2026-02-30" }), "");
  assert.notEqual(validate({ end_date: "" }), "");
  assert.notEqual(validate({ end_date: "2026-11-03" }), "");
  assert.notEqual(validate({ start_date: "2026-11-01" }), "");
  assert.equal(validate({ start_date: "2026-11-01" }, "2026-11-01"), "");
  assert.notEqual(validate({ start_date: "2026-11-02" }, "2026-11-01"), "");
});

function reviewHook(responses) {
  const state = hookState();
  const db = database(responses);
  const { useReviews } = loadSource("src/pages/admin/hooks/useReviews.ts", {
    react: state.react, "../../../lib/supabase": { supabase: db },
  });
  return { db, render: () => state.render(() => useReviews({ isLoggedIn: true, activeSection: "reviews", setGlobalError() {} })) };
}

test("creating an approved review trims text, publishes it and selects published reviews", async () => {
  const row = { id: "review-1", name: "Cliente", message: "Excelente", approved: true, rating: 5 };
  const context = reviewHook([{ data: row, error: null }]);
  assert.equal(await context.render().createApprovedReview({ name: " Cliente ", message: " Excelente " }), null);
  assert.deepEqual(context.db.calls[0].steps.find(([name]) => name === "insert")[1], { name: "Cliente", message: "Excelente", rating: 5, approved: true });
  assert.deepEqual(context.render().reviews, [row]);
  assert.equal(context.render().reviewFilter, "approved");
  assert.equal(context.render().creatingReview, false);
});

test("invalid reviews never reach the database", async () => {
  const context = reviewHook([]);
  assert.ok(await context.render().createApprovedReview({ name: "", message: "Opinión" }));
  assert.equal(context.db.calls.length, 0);
});

test("denied or interrupted review writes keep existing reviews and release loading", async () => {
  for (const response of [{ data: null, error: { message: "permission denied" } }, new Error("network")]) {
    const context = reviewHook([response]);
    assert.ok(await context.render().createApprovedReview({ name: "Cliente", message: "Opinión" }));
    assert.deepEqual(context.render().reviews, []);
    assert.equal(context.render().creatingReview, false);
  }
});

test("double submissions create one review", async () => {
  let resolve;
  const context = reviewHook([new Promise((done) => { resolve = done; })]);
  const hook = context.render();
  const first = hook.createApprovedReview({ name: "Cliente", message: "Opinión" });
  assert.ok(await hook.createApprovedReview({ name: "Cliente", message: "Opinión" }));
  resolve({ data: { id: "one" }, error: null });
  assert.equal(await first, null);
  assert.equal(context.db.calls.length, 1);
});

function disabledHook(responses, confirmed = true, failRefresh = false) {
  const state = hookState();
  const db = database(responses);
  const refreshes = [];
  const loading = [];
  const confirmations = [];
  const errors = [];
  let form = { start_date: "2026-11-05", end_date: "2026-11-06", reason: " Mantenimiento " };
  const { useDisabledRangeActions } = loadSource("src/pages/admin/hooks/useDisabledRangeActions.ts", {
    react: state.react,
    "../../../lib/supabase": { supabase: db },
    "../../../lib/reservations": { formatDateForDisplay: (value) => value },
    "../utils/dateHelpers": { getMinDisabledDate: () => "2026-11-04", getMinReservationDate: () => "2026-11-14" },
    "../utils/timeHelpers": { formatReservationTimeRange: (start, end) => start + "–" + end },
  }, { confirm: (message) => { confirmations.push(message); return confirmed; } });
  const props = {
    get disabledForm() { return form; },
    setDisabledForm(next) { form = next; },
    setDisabledActionLoadingId(value) { loading.push(value); },
    setGlobalError(message) { errors.push(message); }, setManualForm() {},
    async fetchDisabledRanges() { refreshes.push("ranges"); if (failRefresh) throw new Error("refresh failed"); },
    async fetchManualBlocks() { refreshes.push("day"); },
    async fetchManualMonthBlocks() { refreshes.push("month"); },
  };
  return { db, refreshes, loading, confirmations, errors, get form() { return form; }, setForm(next) { form = next; }, render: () => state.render(() => useDisabledRangeActions(props)) };
}

const event = { preventDefault() {} };
const existing = { id: "range-1", start_date: "2026-11-01", end_date: "2026-11-06", reason: "Original", created_at: "2026-11-01" };
const reservation = { id: "booking", customer_name: "Cliente", event_date: "2026-11-05", start_time: "17:00", end_time: "20:00", status: "approved" };

test("new disabled ranges preserve the reservation check and refresh all availability", async () => {
  const context = disabledHook([{ data: [], error: null }, { data: { id: "new" }, error: null }]);
  await context.render().handleSaveDisabledRange(event);
  assert.equal(context.db.calls[0].table, "reservations");
  assert.deepEqual(context.db.calls[1].steps.find(([name]) => name === "insert")[1], { start_date: "2026-11-05", end_date: "2026-11-06", reason: "Mantenimiento" });
  assert.equal(context.refreshes.length, 3);
  assert.equal(context.loading.at(-1), null);
});

test("editing text of an ongoing range updates the same record without rechecking unchanged dates", async () => {
  const context = disabledHook([{ data: { id: existing.id }, error: null }]);
  context.render().startEditingRange(existing);
  context.setForm({ ...existing, reason: " Nuevo motivo " });
  await context.render().handleSaveDisabledRange(event);
  assert.equal(context.db.calls.length, 1);
  assert.equal(context.db.calls[0].table, "disabled_reservation_dates");
  assert.deepEqual(context.db.calls[0].steps.find(([name]) => name === "update")[1], { start_date: existing.start_date, end_date: existing.end_date, reason: "Nuevo motivo" });
  assert.ok(context.db.calls[0].steps.some(([name, key, value]) => name === "eq" && key === "id" && value === existing.id));
  assert.equal(context.render().editingRange, null);
  assert.equal(context.refreshes.length, 3);
});

test("editing dates checks and warns about reservations without changing them", async () => {
  const context = disabledHook([{ data: [reservation], error: null }, { data: { id: existing.id }, error: null }]);
  context.render().startEditingRange(existing);
  context.setForm({ start_date: "2026-11-05", end_date: "2026-11-07", reason: "Nuevo" });
  await context.render().handleSaveDisabledRange(event);
  assert.equal(context.confirmations.length, 1);
  assert.match(context.confirmations[0], /Cliente/);
  assert.equal(context.db.calls[1].table, "disabled_reservation_dates");
  assert.ok(!context.db.calls[0].steps.some(([name]) => name === "update" || name === "delete"));
});

test("cancelling the reservation warning makes no changes and releases loading", async () => {
  const context = disabledHook([{ data: [reservation], error: null }], false);
  await context.render().handleSaveDisabledRange(event);
  assert.equal(context.db.calls.length, 1);
  assert.equal(context.refreshes.length, 0);
  assert.equal(context.loading.at(-1), null);
});

test("enabling a range being edited also closes its obsolete edit form", async () => {
  const context = disabledHook([{ error: null }]);
  context.render().startEditingRange(existing);
  await context.render().deleteDisabledRange(existing.id);
  assert.equal(context.render().editingRange, null);
  assert.equal(context.form.reason, "");
  assert.equal(context.refreshes.length, 3);
});

test("denied, missing or interrupted updates preserve the edit and report failure", async () => {
  for (const response of [{ data: null, error: { message: "permission denied" } }, { data: null, error: null }, new Error("network")]) {
    const context = disabledHook([response]);
    context.render().startEditingRange(existing);
    context.setForm({ ...existing, reason: "No perder este texto" });
    await context.render().handleSaveDisabledRange(event);
    assert.equal(context.render().editingRange.id, existing.id);
    assert.ok(context.render().saveError);
    assert.equal(context.form.reason, "No perder este texto");
    assert.equal(context.refreshes.length, 0);
    assert.equal(context.loading.at(-1), null);
  }
});

test("a refresh failure after saving reports that the write succeeded", async () => {
  const context = disabledHook([{ data: { id: existing.id }, error: null }], true, true);
  context.render().startEditingRange(existing);
  await context.render().handleSaveDisabledRange(event);
  assert.equal(context.render().editingRange, null);
  assert.equal(context.render().saveError, "");
  assert.match(context.errors.at(-1), /se guardaron/);
});

test("the four services contain the requested inclusions and distinct extras", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../src/components/Services.tsx"), "utf8");
  const ast = ts.createSourceFile("Services.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = ast.statements.filter((node) => ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => ["INCLUDED", "EXTRAS", "services"].includes(declaration.name.getText(ast))));
  const code = ts.transpileModule(declarations.map((node) => node.getText(ast)).join("\n"), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const services = new Function("cumpleImg", "reunionesImg", "corporativosImg", "especialesImg", code + "; return services;")(null, null, null, null);
  const included = ["Uso de las instalaciones", "Pool, futbolito y cama elástica", "Menú infantil", "Mozos y Animadores", "Uso del Proyector", "Cobertura médica de emergencia"];
  const extras = ["Menú para adultos", "Horas extras", "Animador o Mozo extra", "Uso del parrillero", "Leña y Hielo"];
  for (const index of [0, 1, 3]) {
    assert.deepEqual(services[index].included, included);
    assert.deepEqual(services[index].extras, extras);
  }
  assert.deepEqual(services[2].included, ["Uso de las instalaciones.", "Juegos recreativos para adultos.", "Cama elástica olímpica y pool.", "Servicio de mozos.", "Estacionamiento cómodo.", "Cobertura médica de emergencia."]);
  assert.deepEqual(services[2].extras, ["Menú para adultos", "Horas extras", "Mozo extra", "Uso del parrillero", "Leña y Hielo"]);
});

test("public reviews fetch only approved opinions and can request the next batch", async () => {
  const rows = Array.from({ length: 9 }, (_, index) => ({ id: String(index), message: "Opinión" }));
  const db = database([{ data: rows.slice(0, 5), error: null }, { data: rows.slice(4, 9), error: null }, { data: rows.slice(8), error: null }]);
  const { fetchPage } = loadSource("src/components/ReviewsPreview.tsx", { "../lib/supabase": { supabase: db } }, {}, "\nexports.fetchPage = fetchReviewPage;");
  const first = await fetchPage(0);
  const second = await fetchPage(4);
  const third = await fetchPage(8);
  assert.deepEqual([...first.reviews, ...second.reviews, ...third.reviews], rows);
  assert.equal(first.hasMore, true);
  assert.equal(second.hasMore, true);
  assert.equal(third.hasMore, false);
  for (const call of db.calls) assert.ok(call.steps.some(([name, key, value]) => name === "eq" && key === "approved" && value === true));
  assert.deepEqual(db.calls.map((call) => call.steps.find(([name]) => name === "range").slice(1)), [[0, 4], [4, 8], [8, 12]]);
});
