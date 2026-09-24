"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import AcademyIcon from "@/components/AcademyIcon";
import {
  choose,
  currentNode,
  DOSSIER,
  initialState,
  monthlyValue,
  nextTier,
  NODE_ORDER,
  PREP_COUNT,
  PREPS,
  result,
  XP_MAX,
  XP_TIERS,
  type PrepId,
  type SimState,
} from "@/lib/academy-simulation";
import type { SimulationRecord } from "@/lib/academy-simulation-xp";

type Phase = "intro" | "prep" | "jeu" | "bilan";

export type Best = { bestScore: number; xpTotal: number } | null;
export type FinishResult = SimulationRecord | { error: string };
type Saved = { status: "saving" } | { status: "ok"; record: SimulationRecord } | { status: "error" };

const eur = (k: number) => `${k.toLocaleString("fr-FR")} 000 €`;

export default function NegotiationSim({
  lessonTitles,
  initialBest,
  onFinish,
}: {
  lessonTitles: Record<string, string>;
  initialBest: Best;
  onFinish: (prep: string[], choices: string[]) => Promise<FinishResult>;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [prep, setPrep] = useState<PrepId[]>([]);
  const [sim, setSim] = useState<SimState | null>(null);
  const [best, setBest] = useState<Best>(initialBest);
  const [saved, setSaved] = useState<Saved>({ status: "saving" });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "jeu") endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [sim, phase]);

  function togglePrep(id: PrepId) {
    setPrep((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : cur.length < PREP_COUNT ? [...cur, id] : cur));
  }

  function start(p: PrepId[] = prep) {
    setSim(initialState(p));
    setPhase("jeu");
  }

  function play(choiceId: string) {
    if (!sim) return;
    const next = choose(sim, choiceId);
    setSim(next);
    if (next.node === "fin") {
      // Le serveur rejoue la partie, recalcule le score et crédite l'XP.
      setSaved({ status: "saving" });
      onFinish(next.prep, next.history.map((t) => t.choiceId))
        .then((res) => {
          if ("error" in res) return setSaved({ status: "error" });
          setSaved({ status: "ok", record: res });
          setBest({ bestScore: res.bestScore, xpTotal: res.xpTotal });
        })
        .catch(() => setSaved({ status: "error" }));
      window.setTimeout(() => setPhase("bilan"), 900);
    }
  }

  if (phase === "intro") return <Intro best={best} onStart={() => setPhase("prep")} />;

  if (phase === "prep") {
    return (
      <section className="pz-card p-5 md:p-6 pz-rise" aria-labelledby="sim-prep">
        <div className="pz-eyebrow pz-red">Avant le rendez-vous</div>
        <h2 id="sim-prep" className="text-[20px] font-extrabold tracking-tight mt-2">
          Tu as le temps de faire {PREP_COUNT} choses sur 3
        </h2>
        <p className="text-[13px] leading-6 pz-muted mt-1.5">
          80 % d&apos;une négociation se joue avant d&apos;entrer dans la pièce. Choisis ta préparation : elle
          débloquera des arguments pendant l&apos;échange.
        </p>
        <div className="grid gap-3 mt-5">
          {PREPS.map((p) => {
            const on = prep.includes(p.id);
            const full = !on && prep.length >= PREP_COUNT;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePrep(p.id)}
                disabled={full}
                aria-pressed={on}
                className="pz-opt text-left flex items-start gap-3 disabled:opacity-45"
                style={on ? { borderColor: "var(--argent)", background: "rgba(var(--ink-rgb),.06)" } : undefined}
              >
                <span
                  className="w-5 h-5 rounded-md grid place-items-center shrink-0 mt-0.5"
                  style={{ border: "1px solid var(--ligne)", background: on ? "var(--argent)" : "transparent", color: "var(--sur-argent)" }}
                >
                  {on ? <AcademyIcon name="check" size={13} /> : null}
                </span>
                <span>
                  <span className="block font-semibold text-[14px]">{p.title}</span>
                  <span className="block text-[12.5px] leading-5 pz-muted mt-0.5">{p.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button type="button" className="pz-btn" disabled={prep.length !== PREP_COUNT} onClick={() => start()}>
            Entrer dans le bureau →
          </button>
          <span className="text-[12px] pz-muted pz-mono">
            {prep.length}/{PREP_COUNT} choisis
          </span>
        </div>
      </section>
    );
  }

  if (!sim) return null;

  if (phase === "bilan") {
    return (
      <Bilan
        sim={sim}
        best={best}
        saved={saved}
        lessonTitles={lessonTitles}
        onReplay={() => start(sim.prep)}
        onNewPrep={() => {
          setPrep([]);
          setSim(null);
          setPhase("prep");
        }}
      />
    );
  }

  const node = currentNode(sim);
  const step = Math.min(sim.history.length + 1, NODE_ORDER.length);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <section className="flex flex-col gap-4 min-w-0" aria-label="Échange avec le directeur sportif">
        <div className="flex items-center justify-between gap-3">
          <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
            Étape {step}/{NODE_ORDER.length}
            {node ? ` · ${node.title}` : ""}
          </div>
          <div className="flex gap-1" aria-hidden>
            {NODE_ORDER.map((n, i) => (
              <span
                key={n}
                className="h-1.5 w-6 rounded-full"
                style={{ background: i < sim.history.length ? "var(--rouge)" : "rgba(var(--ink-rgb),.1)" }}
              />
            ))}
          </div>
        </div>

        {sim.history.map((t, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <Bubble who="club">{t.line}</Bubble>
            <Bubble who="toi">{t.label}</Bubble>
            <Bubble who="club">{t.reply}</Bubble>
          </div>
        ))}

        {node ? (
          <div className="flex flex-col gap-2.5 pz-rise" key={node.id}>
            <Bubble who="club">{node.line}</Bubble>
            <div className="pz-eyebrow pz-muted mt-2">Ta réponse</div>
            <div className="grid gap-2">
              {node.choices.map((c) => (
                <button key={c.id} type="button" className="pz-opt text-left text-[13.5px] leading-6" onClick={() => play(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="pz-card p-4 text-[13px] pz-rise" role="status">
            {sim.outcome === "rupture" ? (
              <>
                <strong className="pz-red">« Je crois qu&apos;on va s&apos;arrêter là. »</strong> Marc Delorme se lève.
                La confiance est rompue.
              </>
            ) : (
              <>
                <strong>Poignée de main.</strong> L&apos;accord est trouvé. Voyons ce qu&apos;il vaut…
              </>
            )}
          </div>
        )}
        <div ref={endRef} />
      </section>

      <Dossier sim={sim} />
    </div>
  );
}

function Intro({ best, onStart }: { best: Best; onStart: () => void }) {
  return (
    <section
      className="pz-card p-5 md:p-7 pz-rise"
      style={{ background: "linear-gradient(145deg, rgba(194,24,51,.10), rgba(var(--ink-rgb),.02))", borderColor: "rgba(194,24,51,.30)" }}
    >
      <div className="pz-eyebrow pz-red">Le dossier Mbaye</div>
      <h2 className="text-[22px] font-extrabold tracking-tight mt-2">Place ton joueur en Ligue 1</h2>
      <p className="text-[14px] leading-6 mt-3 max-w-[640px]">
        Tu es l&apos;agent de <strong>{DOSSIER.joueur}</strong> ({DOSSIER.profil}). L&apos;{DOSSIER.club} le veut. Tu
        as rendez-vous avec {DOSSIER.interlocuteur}, pour négocier le contrat de ton joueur.
      </p>
      <div className="grid sm:grid-cols-3 gap-2.5 mt-5">
        <Stat label="Salaire actuel" value={`${eur(DOSSIER.salaireActuel)}/mois`} />
        <Stat label="Ta cible" value={`${eur(DOSSIER.cible)}/mois`} />
        <Stat label="Ton point de rupture" value={`${eur(DOSSIER.plancher)}/mois`} />
      </div>
      <p className="text-[12.5px] leading-5 pz-muted mt-4">
        5 moments clés, 3 réponses possibles à chaque fois, aucune bonne réponse évidente. À la fin : ta note sur 100
        et le débrief de chaque décision. Personnages et montants fictifs.
      </p>
      <p className="text-[12.5px] leading-5 mt-2">
        <span className="font-semibold">Jusqu&apos;à {XP_MAX} XP</span>
        <span className="pz-muted">
          {" "}
          ajoutés à ton compte :{" "}
          {[...XP_TIERS]
            .reverse()
            .map((t) => `${t.xp} XP dès ${t.min}/100`)
            .join(", ")}
          . Chaque palier ne se gagne qu&apos;une fois.
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-5">
        <button type="button" className="pz-btn" onClick={onStart}>
          Préparer le rendez-vous →
        </button>
        {best ? (
          <span className="text-[12px] pz-muted pz-mono">
            Meilleur score : {best.bestScore}/100 · XP gagnée : {best.xpTotal}/{XP_MAX}
          </span>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl px-3.5 py-3" style={{ background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)" }}>
      <div className="text-[10.5px] uppercase tracking-[0.14em] pz-muted">{label}</div>
      <div className="text-[15px] font-bold pz-mono mt-1">{value}</div>
    </div>
  );
}

function Bubble({ who, children }: { who: "club" | "toi"; children: React.ReactNode }) {
  const club = who === "club";
  return (
    <div className={`flex ${club ? "justify-start" : "justify-end"}`}>
      <div
        className="max-w-[88%] rounded-2xl px-4 py-3 text-[13.5px] leading-6"
        style={
          club
            ? { background: "rgba(var(--ink-rgb),.05)", border: "1px solid var(--ligne)", borderTopLeftRadius: 6 }
            : { background: "rgba(194,24,51,.12)", border: "1px solid rgba(194,24,51,.32)", borderTopRightRadius: 6 }
        }
      >
        <div className="text-[10px] uppercase tracking-[0.16em] pz-muted mb-1">{club ? "Marc Delorme · Valcourt" : "Toi · agent"}</div>
        {children}
      </div>
    </div>
  );
}

function Dossier({ sim }: { sim: SimState }) {
  const intel = PREPS.filter((p) => sim.prep.includes(p.id));
  const trustColor = sim.trust >= 60 ? "var(--vert)" : sim.trust >= 35 ? "var(--ambre)" : "var(--rouge-clair)";
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-24" aria-label="Ton dossier">
      <section className="pz-card p-4">
        <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
          Sur la table
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-[12.5px]">
          <dt className="pz-muted">Fixe mensuel</dt>
          <dd className="pz-mono font-semibold text-right">{sim.salary ? eur(sim.salary) : "—"}</dd>
          <dt className="pz-muted">Prime à la signature</dt>
          <dd className="pz-mono font-semibold text-right">{sim.signing ? eur(sim.signing) : "—"}</dd>
          <dt className="pz-muted">Durée</dt>
          <dd className="pz-mono font-semibold text-right">{sim.years} ans</dd>
          <dt className="pz-muted">Primes d&apos;objectifs</dt>
          <dd className="pz-mono font-semibold text-right">{sim.perfBonus ? "oui" : "non"}</dd>
        </dl>
        {sim.salary ? (
          <div className="mt-3 pt-3 text-[12px] flex justify-between gap-2" style={{ borderTop: "1px solid var(--ligne)" }}>
            <span className="pz-muted">Valeur / mois pour Yanis</span>
            <span className="pz-mono font-bold">{monthlyValue(sim).toLocaleString("fr-FR")} k€</span>
          </div>
        ) : null}
        <div className="mt-2 text-[11px] pz-muted pz-mono">
          Cible {DOSSIER.cible} k€ · rupture {DOSSIER.plancher} k€
        </div>
      </section>

      <section className="pz-card p-4">
        <div className="flex items-center justify-between">
          <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
            Relation avec le club
          </div>
          <span className="pz-mono text-[12px] font-semibold" style={{ color: trustColor }}>
            {sim.trust}/100
          </span>
        </div>
        <div className="pz-xpbar mt-2.5" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={sim.trust} aria-label="Relation avec le club">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sim.trust}%`, background: trustColor }} />
        </div>
        <p className="text-[11px] leading-4 pz-muted mt-2">Sous 20, le club met fin à la discussion.</p>
      </section>

      <section className="pz-card p-4">
        <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
          Ta préparation
        </div>
        <ul className="mt-2.5 flex flex-col gap-2.5">
          {intel.map((p) => (
            <li key={p.id} className="text-[12px] leading-5">
              <span className="font-semibold block">{p.title}</span>
              <span className="pz-muted">{p.intel}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function Bilan({
  sim,
  best,
  saved,
  lessonTitles,
  onReplay,
  onNewPrep,
}: {
  sim: SimState;
  best: Best;
  saved: Saved;
  lessonTitles: Record<string, string>;
  onReplay: () => void;
  onNewPrep: () => void;
}) {
  const r = result(sim);
  const good = r.score >= 70;
  const topRef = useRef<HTMLDivElement>(null);
  // Le bilan remplace la conversation : on remonte à son début.
  useEffect(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), []);
  return (
    <div ref={topRef} className="flex flex-col gap-5 scroll-mt-24">
      <section className="pz-card p-5 md:p-6 pz-rise" aria-labelledby="sim-bilan">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="pz-eyebrow pz-red">{r.outcome === "rupture" ? "Pas d'accord" : "Accord signé"}</div>
            <h2 id="sim-bilan" className="text-[22px] font-extrabold tracking-tight mt-2">
              {r.grade}
            </h2>
            <p className="text-[13.5px] leading-6 mt-2">{r.playerLine}</p>
          </div>
          <div className="text-center shrink-0">
            <div className="text-[40px] font-black leading-none pz-mono" style={{ color: good ? "var(--vert)" : "var(--rouge-vif)" }}>
              {r.score}
            </div>
            <div className="text-[11px] pz-muted mt-1">sur 100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <Stat label="Valeur obtenue" value={`${r.parts.valeur}/40`} />
          <Stat label="Relation club" value={`${r.parts.relation}/25`} />
          <Stat label="Méthode" value={`${r.parts.methode}/35`} />
          <Stat label="Contrat / mois" value={r.outcome === "accord" ? `${r.value.toLocaleString("fr-FR")} k€` : "—"} />
        </div>
        {r.parts.joueur < 0 ? (
          <p className="text-[12px] pz-muted mt-2">Joueur déçu : {r.parts.joueur} points.</p>
        ) : null}
        {r.belowFloor ? <p className="text-[12px] pz-muted mt-1">Accord sous ton point de rupture : -10 points.</p> : null}

        <XpLine saved={saved} />

        {r.missed.length ? (
          <div className="rounded-2xl p-4 mt-4" style={{ background: "rgba(var(--ink-rgb),.035)", border: "1px solid var(--ligne)" }}>
            <div className="pz-eyebrow" style={{ color: "var(--ambre)" }}>
              Ce qui t&apos;a échappé
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {r.missed.map((m) => (
                <li key={m} className="text-[12.5px] leading-5">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button type="button" className="pz-btn" onClick={onReplay}>
            Rejouer avec la même préparation
          </button>
          <button type="button" className="pz-btn ghost" onClick={onNewPrep}>
            Changer de préparation
          </button>
          {best ? <span className="text-[12px] pz-muted pz-mono">Meilleur score : {best.bestScore}/100</span> : null}
        </div>
      </section>

      <section className="flex flex-col gap-3 pz-rise pz-d1" aria-label="Débrief décision par décision">
        <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
          Débrief, décision par décision
        </div>
        {sim.history.map((t, i) => (
          <article key={i} className="pz-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-bold">
                {i + 1}. {t.title}
              </span>
              <span className="flex gap-1" aria-label={`Méthode : ${t.method} sur 7`}>
                {Array.from({ length: 7 }, (_, d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: d < t.method ? "var(--argent)" : "rgba(var(--ink-rgb),.12)" }}
                  />
                ))}
              </span>
            </div>
            <p className="text-[12.5px] leading-5 pz-muted mt-2">Ta réponse : {t.label}</p>
            <p className="text-[13px] leading-6 mt-2">{t.feedback}</p>
            {lessonTitles[t.lesson] ? (
              <Link href={`/academy/lecon/${t.lesson}`} className="inline-flex mt-2 text-[12px] font-bold" style={{ color: "var(--argent)" }}>
                Relire : {lessonTitles[t.lesson]} →
              </Link>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

function XpLine({ saved }: { saved: Saved }) {
  const box = "rounded-2xl px-4 py-3 mt-4 text-[13px] leading-6 flex items-center gap-3";
  if (saved.status === "saving") {
    return (
      <div className={`${box} pz-muted`} style={{ border: "1px solid var(--ligne)" }} role="status">
        Calcul de ton XP…
      </div>
    );
  }
  if (saved.status === "error") {
    return (
      <div className={box} style={{ border: "1px solid var(--ligne)" }} role="status">
        <span className="pz-muted">L&apos;XP n&apos;a pas pu être enregistrée cette fois. Rejoue pour réessayer.</span>
      </div>
    );
  }
  const { record } = saved;
  const next = nextTier(record.bestScore);
  return (
    <div
      className={box}
      style={
        record.xpGained > 0
          ? { background: "rgba(59,175,114,.10)", border: "1px solid rgba(59,175,114,.35)" }
          : { border: "1px solid var(--ligne)" }
      }
      role="status"
    >
      <AcademyIcon name="bolt" size={16} style={{ color: record.xpGained > 0 ? "var(--vert)" : "var(--gris)" }} />
      <span>
        {record.xpGained > 0 ? (
          <strong style={{ color: "var(--vert)" }}>+{record.xpGained} XP ajoutés à ton compte.</strong>
        ) : (
          <span className="pz-muted">Pas de nouvelle XP : ce palier est déjà obtenu.</span>
        )}{" "}
        <span className="pz-muted">
          {next
            ? `Atteins ${next.min}/100 pour gagner ${next.xp} XP de plus.`
            : `Tu as gagné toute l'XP de cette simulation (${XP_MAX} XP).`}
        </span>
      </span>
    </div>
  );
}
