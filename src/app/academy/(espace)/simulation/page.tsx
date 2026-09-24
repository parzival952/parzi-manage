export const dynamic = "force-dynamic";

import Link from "next/link";

import AcademyIcon from "@/components/AcademyIcon";
import { getSimulationBests } from "@/lib/academy-simulation-xp";
import { requireUser } from "@/lib/auth";
import { SCENARIOS } from "@/lib/simulation";
import { XP_MAX } from "@/lib/simulation/engine";

export const metadata = { title: "Mises en situation" };

export default async function SimulationsPage() {
  const user = await requireUser();
  const bests = await getSimulationBests(user.id);
  const earned = Object.values(bests).reduce((sum, b) => sum + b.xpTotal, 0);

  return (
    <main className="pz-wide flex flex-col gap-6 max-w-[1100px] mx-auto w-full">
      <header className="pz-rise">
        <Link href="/academy" className="text-[12.5px] pz-muted hover:text-white">
          ← Ta route vers la licence
        </Link>
        <div className="pz-eyebrow mt-4" style={{ color: "var(--argent)" }}>
          Mises en situation
        </div>
        <h1 className="text-[26px] font-black tracking-tight mt-2">Simulations</h1>
        <p className="text-[13.5px] leading-6 pz-muted mt-2 max-w-[640px]">
          Mets les leçons en pratique face à des interlocuteurs qui connaissent leur métier. Chaque décision est
          débriefée, et chaque simulation rapporte jusqu&apos;à {XP_MAX} XP à ton compte.
        </p>
        <p className="text-[12px] pz-muted pz-mono mt-2">
          XP gagnée : {earned}/{XP_MAX * SCENARIOS.length}
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2 pz-rise pz-d1">
        {SCENARIOS.map((sc) => {
          const best = bests[sc.id];
          return (
            <li key={sc.id}>
              <Link
                href={`/academy/simulation/${sc.id}`}
                className="pz-card p-5 flex flex-col gap-3 h-full transition-transform hover:-translate-y-0.5"
                aria-label={`Jouer : ${sc.title}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="pz-eyebrow pz-red">{sc.theme}</span>
                  <span
                    className="w-9 h-9 rounded-[12px] grid place-items-center pz-red shrink-0"
                    style={{ background: "rgba(194,24,51,.12)", border: "1px solid rgba(194,24,51,.3)" }}
                  >
                    <AcademyIcon name="bolt" size={17} />
                  </span>
                </div>
                <span className="block font-extrabold text-[18px] tracking-tight">{sc.title}</span>
                <span className="block text-[13px] leading-5 pz-muted">{sc.pitch}</span>
                <span className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] pz-muted pz-mono mt-auto pt-2">
                  <span>{sc.order.length} moments clés</span>
                  {best ? (
                    <>
                      <span>Meilleur score {best.bestScore}/100</span>
                      <span style={{ color: best.xpTotal >= XP_MAX ? "var(--vert)" : undefined }}>
                        XP {best.xpTotal}/{XP_MAX}
                      </span>
                    </>
                  ) : (
                    <span className="pz-red">à jouer</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
