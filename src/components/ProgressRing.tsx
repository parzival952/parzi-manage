/** Anneau de progression (SVG, composant serveur pur). */
export default function ProgressRing({
  value,
  size = 52,
  stroke = 4,
  label,
  tone = "var(--rouge)",
  complete = false,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  tone?: string;
  complete?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span className="relative inline-grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(var(--ink-rgb),.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={complete ? "var(--vert)" : tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
        />
      </svg>
      {label ? (
        <span className="absolute pz-mono text-[11px]" style={{ color: complete ? "var(--vert)" : "var(--blanc)" }}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
