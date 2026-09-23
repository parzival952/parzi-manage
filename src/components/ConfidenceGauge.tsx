"use client";

import {
  CONFIDENCE_LEVELS,
  type ConfidenceValue,
} from "@/lib/academy-confidence";

/**
 * Jauge d'assurance 1 → 5, même rendu que dans le diagnostic.
 * `value` à 0 = pas encore choisie.
 */
export default function ConfidenceGauge({
  value,
  onChange,
  disabled = false,
}: {
  value: ConfidenceValue | 0;
  onChange: (v: ConfidenceValue) => void;
  disabled?: boolean;
}) {
  const current = CONFIDENCE_LEVELS.find((l) => l.value === value);

  return (
    <div
      className="rounded-2xl p-4 mt-4"
      style={{ background: "rgba(255,255,255,.03)", border: "1px solid var(--ligne)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider pz-red">
            NIVEAU D&apos;ASSURANCE
          </div>
          <div className="text-[14px] font-extrabold mt-1">
            À quel point es-tu sûr ?
          </div>
        </div>
        <span className="pz-muted text-[10px] shrink-0">
          {current ? current.label : "Obligatoire"}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-4" role="radiogroup" aria-label="Niveau d'assurance">
        {CONFIDENCE_LEVELS.map((level) => {
          const selected = value === level.value;
          return (
            <button
              key={level.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(level.value)}
              className="rounded-xl py-3 text-center"
              style={{
                color: selected ? "#0A0A0C" : "var(--blanc)",
                background: selected ? "var(--argent)" : "rgba(255,255,255,.04)",
                border: selected ? "1px solid var(--argent)" : "1px solid var(--ligne)",
                cursor: disabled ? "default" : "pointer",
              }}
              title={level.label}
            >
              <strong className="block text-[14px]">{level.value}</strong>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 mt-2 text-[9px] pz-muted">
        <span>Au hasard</span>
        <span className="text-center">Moyen</span>
        <span className="text-right">Certain</span>
      </div>
    </div>
  );
}
