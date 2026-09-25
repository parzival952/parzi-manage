import Link from "next/link";
import type { ReactNode } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { SIGNUP_HREF } from "@/lib/academy-offer";

/** Cadre des pages publiques de PARZI Academy (accueil, essai sans compte). */
export default function AcademyPublicShell({ theme, children }: { theme: string; children: ReactNode }) {
  return (
    <div className="parzi" data-theme={theme}>
      <div className="min-h-full flex flex-col">
        <header
          className="sticky top-0 z-10 backdrop-blur-xl"
          style={{ background: "var(--entete-bg)", borderBottom: "1px solid var(--ligne)" }}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2.5">
            <Link href="/academy/decouvrir" className="flex items-center gap-2.5 shrink-0 mr-auto">
              <div
                className="w-8 h-8 rounded-[10px] grid place-items-center font-black text-white pz-sur-rouge"
                style={{ background: "linear-gradient(135deg, var(--rouge), var(--rouge-profond))" }}
              >
                P
              </div>
              <div className="font-extrabold text-[15px] tracking-tight">
                PARZI <span className="pz-red">Academy</span>
              </div>
            </Link>
            <ThemeToggle />
            <Link href="/academy/connexion" className="text-[13px] font-bold pz-muted hover:text-white px-2 whitespace-nowrap">
              Se connecter
            </Link>
            <span className="hidden sm:block">
              <Link href={SIGNUP_HREF} className="pz-btn" style={{ padding: "9px 16px", fontSize: "13.5px" }}>
                Commencer gratuitement
              </Link>
            </span>
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        <footer className="px-4 md:px-8 py-8" style={{ borderTop: "1px solid var(--ligne)" }}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] pz-muted">
            <span>© PARZI Academy</span>
            <Link href="/academy/confidentialite" className="hover:underline">
              Confidentialité
            </Link>
            <Link href="/academy/connexion" className="hover:underline">
              Se connecter
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
