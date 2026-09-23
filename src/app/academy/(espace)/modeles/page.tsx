export const dynamic = "force-dynamic";

import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { MODELES } from "@/lib/academy-modeles";
import AcademyIcon from "@/components/AcademyIcon";

export const metadata = { title: "Fiches & modèles" };

export default async function AcademyModelesPage() {
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
            RESSOURCES
          </div>
          <h1 className="text-[26px] font-black tracking-tight mt-2">
            Fiches &amp; modèles commentés
          </h1>
          <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
            La structure d&apos;un mandat et les points clés d&apos;un contrat,
            avec pour chaque élément « pourquoi ça compte » et « ce qu&apos;il
            faut vérifier ».
          </p>
        </div>
      </header>

      <section
        className="lg:col-span-2 pz-card p-4 pz-rise pz-d1"
        style={{ borderColor: "rgba(240,179,92,.30)" }}
      >
        <p className="text-[12px] leading-6 pz-muted">
          <b className="text-white inline-flex items-center gap-1"><AcademyIcon name="alert" size={13} style={{ color: "var(--or)" }} /> Cadre :</b> ces fiches sont{" "}
          <b className="text-white">pédagogiques</b> — elles expliquent la logique,
          ce ne sont pas des documents juridiques prêts à l&apos;emploi. Adapte-les
          au droit applicable et aux règlements en vigueur, et fais valider un
          document réel par un juriste.
        </p>
      </section>

      {MODELES.map((m, i) => (
        <section
          key={m.id}
          className={"pz-card p-5 pz-rise pz-d" + Math.min(5, i + 2)}
        >
          <h2 className="text-[18px] font-black">{m.titre}</h2>
          <div className="text-[12px] pz-muted mt-1">{m.sousTitre}</div>
          <p className="text-[12.5px] leading-6 pz-muted mt-3">{m.intro}</p>

          <div className="flex flex-col gap-3 mt-4">
            {m.sections.map((s, idx) => (
              <div
                key={s.clause}
                className="rounded-2xl p-3"
                style={{
                  background: "rgba(var(--ink-rgb),.03)",
                  border: "1px solid var(--ligne)",
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[10px] font-bold tabular-nums pz-muted shrink-0"
                    style={{ minWidth: 18 }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13.5px] font-extrabold">
                    {s.clause}
                  </span>
                </div>
                <p className="text-[12.5px] leading-6 pz-muted mt-1 pl-[26px]">
                  {s.commentaire}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="lg:col-span-2 pz-rise pz-d5 text-center">
        <Link
          href="/academy/glossaire"
          className="text-[12px] font-bold pz-red hover:underline"
        >
          Voir aussi : le glossaire du métier →
        </Link>
      </div>
    </main>
  );
}
