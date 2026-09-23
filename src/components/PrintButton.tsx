"use client";

import AcademyIcon from "@/components/AcademyIcon";

/**
 * Bouton d'impression / export PDF (via la boîte d'impression du navigateur).
 * Masqué à l'impression grâce à la classe `no-print`.
 */
export default function PrintButton({ label = "Imprimer / PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="pz-btn ghost no-print shrink-0"
      style={{ padding: "8px 12px", fontSize: 12 }}
    >
      <AcademyIcon name="printer" size={14} />
      {label}
    </button>
  );
}
