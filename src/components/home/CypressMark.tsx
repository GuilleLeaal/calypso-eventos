// Los cuatro cipreses del logo de Calypso, simplificados para usar como marca chica.
const CYPRESS_X = [6, 18, 30, 42];

export function CypressMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 46"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {CYPRESS_X.map((x) => (
        <path
          key={x}
          d={`M ${x} 1 C ${x + 4.6} 9 ${x + 4.8} 26 ${x + 1.1} 38 L ${x + 1.1} 42 L ${x - 1.1} 42 L ${x - 1.1} 38 C ${x - 4.8} 26 ${x - 4.6} 9 ${x} 1 Z`}
        />
      ))}
      <rect x="0" y="43.5" width="48" height="1.2" />
    </svg>
  );
}
