export const dynamic = "force-dynamic";

import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { GLOSSAIRE, GLOSSAIRE_COUNT } from "@/lib/academy-glossaire";
import { slugify } from "@/lib/academy-search";

export const metadata = { title: "Glossaire du métier" };

export default async function AcademyGlossairePage() {
  await requireUser();

  return (
    <main className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <header className="lg:col-span-2 pz-rise">
        <Link href="/academy" className="text-[12px] pz-muted hover:text-white">
          ← Retour à PARZI Academy
        </Link>

        <div className="mt-5">
          <div
            className="pz-eyebrow"
            style={{ color: "var(--argent)" }}
          >
            RÉFÉRENCE
          </div>
          <h1 className="text-[26px] font-black tracking-tight mt-2">
            Glossaire du métier
          </h1>
          <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
            {GLOSSAIRE_COUNT} termes essentiels pour parler le langage des
            agents, des clubs et des instances. Définitions pédagogiques : les
            règles et montants précis évoluent — vérifie toujours le texte en
            vigueur (FFF / FIFA) avant d&apos;agir.
          </p>
        </div>
      </header>

      {GLOSSAIRE.map((cat, i) => (
        <section
          key={cat.titre}
          className={"pz-card p-5 pz-rise pz-d" + Math.min(5, i + 1)}
        >
          <h2 className="text-[16px] font-black">{cat.titre}</h2>
          <dl className="mt-4 flex flex-col gap-3.5">
            {cat.termes.map((t) => (
              <div key={t.terme} id={slugify(t.terme)} className="pz-cible rounded-lg">
                <dt className="text-[13.5px] font-extrabold">{t.terme}</dt>
                <dd className="text-[12.5px] leading-6 pz-muted mt-0.5">
                  {t.def}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <p className="lg:col-span-2 text-[11px] pz-muted text-center pz-rise pz-d5">
        Un terme manque ? Le glossaire s&apos;enrichit avec le programme.
      </p>
    </main>
  );
}
