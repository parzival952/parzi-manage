"use client";

import Link from "next/link";
import { IconTile } from "@/components/AcademyIcon";

// Erreur inattendue dans l'Academy — aux couleurs de l'Academy (et non de Manage).
export default function AcademyError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="parzi">
      <div className="min-h-full grid place-items-center px-5 py-24">
        <div className="pz-card px-8 py-8 text-center max-w-md">
          <div className="mb-3 flex justify-center"><IconTile name="alert" size={52} /></div>
          <h1 className="font-black text-[18px] mb-1.5">Oups, hors-jeu.</h1>
          <p className="text-[13.5px] pz-muted mb-5">
            Une erreur inattendue s&apos;est produite. Réessaie — si ça persiste, préviens-nous.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={reset} className="pz-btn" style={{ padding: "10px 16px" }}>
              Réessayer
            </button>
            <Link href="/academy" className="pz-btn ghost" style={{ padding: "10px 16px" }}>
              Parcours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
