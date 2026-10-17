const SPAN_WIDTH = 200;
const ANCHOR_Y = 4;
const SAG = 26;
const BULB_POSITIONS = [0.22, 0.5, 0.78];

function pointOnSpan(startX: number, t: number) {
  const controlX = startX + SPAN_WIDTH / 2;
  const controlY = ANCHOR_Y + SAG * 2;
  const endX = startX + SPAN_WIDTH;
  const inv = 1 - t;

  return {
    x: inv * inv * startX + 2 * inv * t * controlX + t * t * endX,
    y: inv * inv * ANCHOR_Y + 2 * inv * t * controlY + t * t * ANCHOR_Y,
  };
}

export function Garland({
  lit,
  spans = 6,
  className = "",
}: {
  lit: boolean;
  spans?: number;
  className?: string;
}) {
  const width = spans * SPAN_WIDTH;
  const height = ANCHOR_Y + SAG + 26;

  const wire = Array.from({ length: spans }, (_, i) => {
    const startX = i * SPAN_WIDTH;
    return `M ${startX} ${ANCHOR_Y} Q ${startX + SPAN_WIDTH / 2} ${ANCHOR_Y + SAG * 2} ${startX + SPAN_WIDTH} ${ANCHOR_Y}`;
  }).join(" ");

  const bulbs = Array.from({ length: spans }, (_, i) =>
    BULB_POSITIONS.map((t) => pointOnSpan(i * SPAN_WIDTH, t)),
  ).flat();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={["block w-full", className].join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="garland-glow">
          <stop offset="0%" stopColor="#F2B544" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F2B544" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d={wire}
        fill="none"
        strokeWidth="1.4"
        className={[
          "transition-colors duration-700",
          lit ? "stroke-paper/40" : "stroke-ink/45",
        ].join(" ")}
      />

      {bulbs.map((bulb, index) => (
        <g key={index} transform={`translate(${bulb.x} ${bulb.y})`}>
          <circle
            cy="13"
            r="15"
            fill="url(#garland-glow)"
            className={[
              "transition-opacity duration-700",
              lit ? "bulb-glow opacity-100" : "opacity-0",
            ].join(" ")}
            style={{ animationDelay: `${(index * 0.37) % 2.6}s` }}
          />
          <rect
            x="-2.2"
            y="0"
            width="4.4"
            height="5.5"
            rx="0.8"
            className={lit ? "fill-paper/60" : "fill-ink/55"}
          />
          <circle
            cy="11.5"
            r="5"
            strokeWidth="1"
            className={[
              "transition-colors duration-700",
              lit ? "fill-bulb stroke-bulb" : "fill-paper stroke-ink/40",
            ].join(" ")}
          />
        </g>
      ))}
    </svg>
  );
}
