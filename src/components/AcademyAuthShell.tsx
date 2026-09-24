import Link from "next/link";
import type { ReactNode } from "react";

import ThemeToggle from "@/components/ThemeToggle";

/** Cadre des pages de compte PARZI Academy hors connexion (mot de passe oublié…). */
export default function AcademyAuthShell({
  theme,
  title,
  subtitle,
  children,
  backLink = true,
  wide = false,
}: {
  theme: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Lien « Retour à la connexion » (inutile une fois connecté). */
  backLink?: boolean;
  /** Carte plus large (formulaires à plusieurs colonnes). */
  wide?: boolean;
}) {
  return (
    <div className="parzi" data-theme={theme}>
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="min-h-full flex items-center justify-center px-5 py-10">
        <div className={`w-full ${wide ? "max-w-[560px]" : "max-w-[440px]"}`}>
          <Link href="/academy/connexion" className="flex items-center gap-3 mb-6 pz-rise">
            <div
              className="w-10 h-10 rounded-[11px] grid place-items-center font-black text-white pz-sur-rouge text-[17px]"
              style={{ background: "linear-gradient(135deg, var(--rouge), var(--rouge-profond))" }}
            >
              P
            </div>
            <div className="font-extrabold text-[18px] tracking-tight">
              PARZI <span className="pz-red">Academy</span>
            </div>
          </Link>
          <section className="pz-card p-6 sm:p-8 pz-rise pz-d1">
            <h1 className="text-[22px] font-black tracking-tight">{title}</h1>
            <p className="text-[13px] pz-muted mt-1 mb-6">{subtitle}</p>
            {children}
          </section>
          {backLink ? (
            <p className="text-[13px] pz-muted mt-5 text-center">
              <Link href="/academy/connexion" className="font-bold pz-red hover:underline">
                ← Retour à la connexion
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl px-4 py-3 text-[14.5px] text-white placeholder:text-[color:var(--gris)] focus:outline-none transition-shadow";
export const authInputStyle = { background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)" };

export function AuthMessage({ tone, children }: { tone: "ok" | "erreur"; children: ReactNode }) {
  return (
    <div
      role={tone === "erreur" ? "alert" : "status"}
      className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
      style={
        tone === "ok"
          ? { color: "var(--vert)", background: "rgba(29,185,84,.10)", border: "1px solid rgba(29,185,84,.3)" }
          : { color: "var(--rouge-clair)", background: "rgba(194,24,51,.10)", border: "1px solid rgba(194,24,51,.3)" }
      }
    >
      {children}
    </div>
  );
}
