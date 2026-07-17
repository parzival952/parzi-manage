"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print bg-[#2a78d6] hover:bg-[#2266bb] text-white font-semibold text-[13.5px] rounded-lg px-4 py-2"
    >
      🖨 Imprimer / Enregistrer en PDF
    </button>
  );
}
