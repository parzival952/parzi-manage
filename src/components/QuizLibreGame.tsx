"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import AcademyIcon from "@/components/AcademyIcon";
import {
  CHRONO_MAX,
  CHRONO_SECONDS,
  LEVELS,
  MODES,
  bestKey,
  chronoPoints,
  serieXpMax,
  type DrawnQuestion,
  type QuizAnswer,
  type QuizBests,
  type QuizLevel,
  type QuizMode,
  type QuizRecord,
} from "@/lib/quiz-libre/types";

export type DrawFn = (
  level: QuizLevel,
  chapter: string | null,
  mode: QuizMode,
  exclude: string[],
) => Promise<DrawnQuestion[]>;
export type RecordFn = (
  level: QuizLevel,
  mode: QuizMode,
  answers: QuizAnswer[],
) => Promise<QuizRecord | { error: string }>;

type Played = { question: DrawnQuestion; choice: number; ms: number };
type Phase = "choix" | "jeu" | "bilan";
type Saved = { status: "idle" } | { status: "saving" } | { status: "error" } | { status: "ok"; record: QuizRecord };

/** Horloge (hors rendu : appelée seulement dans les gestionnaires et minuteries). */
const nowMs = () => Date.now();

export default function QuizLibreGame({
  chapters,
  counts,
  lessonTitles,
  initialBests,
  draw,
  record,
}: {
  chapters: { id: string; title: string }[];
  counts: Record<string, Record<number, number>>;
  lessonTitles: Record<string, string>;
  initialBests: QuizBests;
  draw: DrawFn;
  record: RecordFn;
}) {
  const [level, setLevel] = useState<QuizLevel>(1);
  const [mode, setMode] = useState<QuizMode>("serie");
  const [chapter, setChapter] = useState<string>("all");
  const [phase, setPhase] = useState<Phase>("choix");
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<DrawnQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState<Played[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [bests, setBests] = useState<QuizBests>(initialBests);
  const [saved, setSaved] = useState<Saved>({ status: "idle" });
  const fetchingMore = useRef(false);
  const locked = useRef(false); // une seule réponse par question, même en double clic

  const chapterArg = chapter === "all" ? null : chapter;
  const available = counts[chapter]?.[level] ?? 0;

  async function start() {
    setLoading(true);
    try {
      const qs = await draw(level, chapterArg, mode, []);
      setQueue(qs);
      setIndex(0);
      setPlayed([]);
      setPicked(null);
      locked.current = false;
      setSaved({ status: "idle" });
      setPhase(qs.length ? "jeu" : "choix");
    } finally {
      setLoading(false);
    }
  }

  const finish = useCallback(
    (all: Played[]) => {
      setPhase("bilan");
      if (all.length === 0) return;
      setSaved({ status: "saving" });
      record(
        level,
        mode,
        all.map((p) => ({
          id: p.question.id,
          choice: p.choice >= 0 ? p.question.options[p.choice] : "",
          ms: p.ms,
        })),
      )
        .then((res) => {
          if ("error" in res) return setSaved({ status: "error" });
          setSaved({ status: "ok", record: res });
          setBests((b) => ({
            ...b,
            [bestKey(level, mode)]: {
              bestScore: res.bestScore,
              xpAwarded: res.xpAwarded,
              plays: (b[bestKey(level, mode)]?.plays ?? 0) + 1,
            },
          }));
        })
        .catch(() => setSaved({ status: "error" }));
    },
    [level, mode, record],
  );

  // Réponse (ou temps écoulé : choice = -1).
  const answer = useCallback(
    (choice: number, ms: number) => {
      if (locked.current) return;
      const question = queue[index];
      if (!question) return;
      locked.current = true;
      setPicked(choice);
      setPlayed((p) => [...p, { question, choice, ms }]);
    },
    [queue, index],
  );

  function next() {
    const isLast = mode !== "libre" && index >= queue.length - 1;
    if (isLast) return finish(played);
    setIndex((i) => i + 1);
    setPicked(null);
    locked.current = false;
  }

  // Sans fin : on recharge un lot avant d'arriver au bout.
  useEffect(() => {
    if (phase !== "jeu" || mode !== "libre" || fetchingMore.current) return;
    if (queue.length - index > 3) return;
    fetchingMore.current = true;
    const seen = queue.map((q) => q.id);
    draw(level, chapterArg, mode, seen)
      .then((more) => setQueue((q) => [...q, ...more]))
      .finally(() => {
        fetchingMore.current = false;
      });
  }, [phase, mode, index, queue, draw, level, chapterArg]);

  if (phase === "choix") {
    return (
      <Choix
        level={level}
        mode={mode}
        chapter={chapter}
        chapters={chapters}
        counts={counts}
        bests={bests}
        available={available}
        loading={loading}
        onLevel={setLevel}
        onMode={setMode}
        onChapter={setChapter}
        onStart={start}
      />
    );
  }

  if (phase === "bilan") {
    return (
      <Bilan
        level={level}
        mode={mode}
        played={played}
        saved={saved}
        best={bests[bestKey(level, mode)]?.bestScore ?? null}
        lessonTitles={lessonTitles}
        onReplay={start}
        onChange={() => setPhase("choix")}
      />
    );
  }

  const question = queue[index];
  if (!question) {
    return (
      <section className="pz-card p-6 text-[13.5px] pz-muted" role="status">
        Chargement des questions…
      </section>
    );
  }

  return (
    <Jeu
      key={`${question.id}-${index}`}
      question={question}
      index={index}
      total={mode === "libre" ? null : queue.length}
      mode={mode}
      level={level}
      picked={picked}
      played={played}
      lessonTitles={lessonTitles}
      onAnswer={answer}
      onNext={next}
      onStop={() => finish(played)}
    />
  );
}

/* ------------------------------------------------------------------ */

function Choix({
  level,
  mode,
  chapter,
  chapters,
  counts,
  bests,
  available,
  loading,
  onLevel,
  onMode,
  onChapter,
  onStart,
}: {
  level: QuizLevel;
  mode: QuizMode;
  chapter: string;
  chapters: { id: string; title: string }[];
  counts: Record<string, Record<number, number>>;
  bests: QuizBests;
  available: number;
  loading: boolean;
  onLevel: (l: QuizLevel) => void;
  onMode: (m: QuizMode) => void;
  onChapter: (c: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 pz-rise">
      <section aria-labelledby="quiz-niveau">
        <div id="quiz-niveau" role="heading" aria-level={2} className="pz-eyebrow pz-red">
          1 · Ton niveau
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {LEVELS.map((l) => {
            const on = l.level === level;
            const serie = bests[bestKey(l.level, "serie")];
            return (
              <button
                key={l.level}
                type="button"
                aria-pressed={on}
                onClick={() => onLevel(l.level)}
                className="pz-opt text-left"
                style={on ? { borderColor: "var(--rouge)", background: "rgba(194,24,51,.08)" } : undefined}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-extrabold text-[15px]">
                    Niveau {l.level} · {l.label}
                  </span>
                  <span className="flex gap-0.5" aria-hidden>
                    {[1, 2, 3, 4].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-3 rounded-sm"
                        style={{ background: d <= l.level ? "var(--rouge-vif)" : "rgba(var(--ink-rgb),.14)" }}
                      />
                    ))}
                  </span>
                </span>
                <span className="block text-[12.5px] pz-muted mt-1">{l.detail}</span>
                <span className="block text-[11.5px] pz-muted pz-mono mt-2">
                  {counts.all[l.level]} questions
                  {serie ? ` · meilleure série ${serie.bestScore}/10 · ${serie.xpAwarded}/${serieXpMax(l.level)} XP` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="quiz-mode">
        <div id="quiz-mode" role="heading" aria-level={2} className="pz-eyebrow pz-red">
          2 · Ta façon de jouer
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {MODES.map((m) => {
            const on = m.mode === mode;
            const best = bests[bestKey(level, m.mode)];
            return (
              <button
                key={m.mode}
                type="button"
                aria-pressed={on}
                onClick={() => onMode(m.mode)}
                className="pz-opt text-left"
                style={on ? { borderColor: "var(--rouge)", background: "rgba(194,24,51,.08)" } : undefined}
              >
                <span className="font-extrabold text-[14.5px] flex items-center gap-2">
                  <AcademyIcon name={m.mode === "chrono" ? "clock" : m.mode === "libre" ? "flame" : "target"} size={15} />
                  {m.label}
                </span>
                <span className="block text-[12.5px] pz-muted mt-1">{m.detail}</span>
                {best ? (
                  <span className="block text-[11.5px] pz-mono pz-muted mt-2">
                    Record (niveau {level}) : {formatBest(m.mode, best.bestScore)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="quiz-module">
        <div id="quiz-module" role="heading" aria-level={2} className="pz-eyebrow pz-red">
          3 · Le programme
        </div>
        <select
          value={chapter}
          onChange={(e) => onChapter(e.target.value)}
          aria-label="Module"
          className="mt-3 w-full rounded-xl px-4 py-3 text-[14px]"
          style={{ background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)", color: "var(--blanc)" }}
        >
          <option value="all">Tout le programme ({counts.all[level]} questions)</option>
          {chapters.map((c, i) => (
            <option key={c.id} value={c.id}>
              Module {i + 1} · {c.title} ({counts[c.id]?.[level] ?? 0})
            </option>
          ))}
        </select>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="pz-btn" onClick={onStart} disabled={loading || available === 0}>
          {loading ? "Préparation…" : "Lancer le quiz →"}
        </button>
        <span className="text-[12.5px] pz-muted">
          Niveau {level} · {MODES.find((m) => m.mode === mode)?.label}
        </span>
      </div>
    </div>
  );
}

function formatBest(mode: QuizMode, score: number): string {
  if (mode === "serie") return `${score}/10`;
  if (mode === "chrono") return `${score} pts`;
  return `${score} d'affilée`;
}

/* ------------------------------------------------------------------ */

function Jeu({
  question,
  index,
  total,
  mode,
  level,
  picked,
  played,
  lessonTitles,
  onAnswer,
  onNext,
  onStop,
}: {
  question: DrawnQuestion;
  index: number;
  total: number | null;
  mode: QuizMode;
  level: QuizLevel;
  picked: number | null;
  played: Played[];
  lessonTitles: Record<string, string>;
  onAnswer: (choice: number, ms: number) => void;
  onNext: () => void;
  onStop: () => void;
}) {
  const startedAt = useRef(0);
  const [left, setLeft] = useState(CHRONO_SECONDS);
  const answered = picked !== null;
  // Dernières versions des rappels, lues par les minuteries.
  const answerRef = useRef(onAnswer);
  const nextRef = useRef(onNext);
  const answeredRef = useRef(answered);
  useEffect(() => {
    answerRef.current = onAnswer;
    nextRef.current = onNext;
    answeredRef.current = answered;
  });

  // Chrono : 20 secondes par question ; à zéro, la question est comptée fausse.
  // Le composant est recréé à chaque question (clé), la minuterie part de zéro.
  useEffect(() => {
    startedAt.current = Date.now();
    if (mode !== "chrono") return;
    const t = window.setInterval(() => {
      if (answeredRef.current) return window.clearInterval(t);
      const rest = Math.max(0, CHRONO_SECONDS - (Date.now() - startedAt.current) / 1000);
      setLeft(rest);
      if (rest <= 0) {
        window.clearInterval(t);
        answerRef.current(-1, CHRONO_SECONDS * 1000);
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [mode]);

  // Chrono : passage automatique à la question suivante après la correction.
  useEffect(() => {
    if (!answered || mode !== "chrono") return;
    const t = window.setTimeout(() => nextRef.current(), 1600);
    return () => window.clearTimeout(t);
  }, [answered, mode]);

  function pick(i: number) {
    onAnswer(i, nowMs() - startedAt.current);
  }

  const correctSoFar = played.filter((p) => p.choice === p.question.answer).length;
  let streak = 0;
  for (let i = played.length - 1; i >= 0 && played[i].choice === played[i].question.answer; i--) streak++;
  const points = played.reduce((s, p) => s + chronoPoints(p.choice === p.question.answer, p.ms), 0);
  const isRight = answered && picked === question.answer;

  return (
    <section className="pz-card p-5 md:p-6 pz-rise" aria-labelledby="quiz-question">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] pz-mono pz-muted">
        <span>
          Niveau {level} · {total ? `Question ${index + 1}/${total}` : `Question ${index + 1}`}
        </span>
        <span>
          {mode === "chrono"
            ? `${points} pts`
            : mode === "libre"
              ? `Série : ${streak} · Bonnes : ${correctSoFar}/${played.length}`
              : `Bonnes : ${correctSoFar}/${played.length}`}
        </span>
      </div>

      {mode === "chrono" ? (
        <div className="pz-xpbar mt-3" aria-label={`${Math.ceil(left)} secondes restantes`}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(left / CHRONO_SECONDS) * 100}%`,
              background: left < 6 ? "var(--rouge)" : "var(--argent)",
              transition: "width 200ms linear",
            }}
          />
        </div>
      ) : total ? (
        <div className="pz-xpbar mt-3" aria-hidden>
          <div className="pz-xpfill" style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }} />
        </div>
      ) : null}

      <h2 id="quiz-question" className="text-[18px] md:text-[19px] font-extrabold leading-7 mt-5" style={{ fontFamily: "inherit" }}>
        {question.q}
      </h2>

      <div className="flex flex-col gap-2.5 mt-5">
        {question.options.map((o, i) => {
          const cls = answered ? (i === question.answer ? " correct" : i === picked ? " wrong" : "") : "";
          return (
            <button
              key={i}
              type="button"
              className={`pz-opt${cls}`}
              disabled={answered}
              onClick={() => pick(i)}
              style={answered && cls === "" ? { opacity: 0.55 } : undefined}
            >
              {o}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div
          className="rounded-2xl p-4 mt-4"
          role="status"
          style={{
            background: isRight ? "rgba(59,175,114,.10)" : "rgba(194,24,51,.08)",
            border: `1px solid ${isRight ? "rgba(59,175,114,.35)" : "rgba(194,24,51,.35)"}`,
          }}
        >
          <div className="font-bold text-[13.5px]" style={{ color: isRight ? "var(--vert)" : "var(--rouge-vif)" }}>
            {isRight ? "Bonne réponse." : picked === -1 ? "Temps écoulé." : "Pas tout à fait."}
          </div>
          <p className="text-[13px] leading-6 mt-1">{question.explain}</p>
          {lessonTitles[question.lesson] ? (
            <p className="text-[12px] pz-muted mt-1.5">Leçon : {lessonTitles[question.lesson]}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 mt-5">
        {answered && mode !== "chrono" ? (
          <button type="button" className="pz-btn" onClick={onNext}>
            {total && index >= total - 1 ? "Voir mon résultat →" : "Question suivante →"}
          </button>
        ) : null}
        {mode === "libre" ? (
          <button type="button" className="pz-btn ghost" onClick={onStop} disabled={played.length === 0}>
            Arrêter et voir mon bilan
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Bilan({
  level,
  mode,
  played,
  saved,
  best,
  lessonTitles,
  onReplay,
  onChange,
}: {
  level: QuizLevel;
  mode: QuizMode;
  played: Played[];
  saved: Saved;
  best: number | null;
  lessonTitles: Record<string, string>;
  onReplay: () => void;
  onChange: () => void;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), []);

  const correct = played.filter((p) => p.choice === p.question.answer).length;
  const misses = played.filter((p) => p.choice !== p.question.answer);
  let run = 0;
  let longest = 0;
  for (const p of played) {
    run = p.choice === p.question.answer ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const points = played.reduce((s, p) => s + chronoPoints(p.choice === p.question.answer, p.ms), 0);

  const headline =
    mode === "serie"
      ? `${correct}/${played.length}`
      : mode === "chrono"
        ? `${points} pts`
        : `${longest} d'affilée`;
  const sub =
    mode === "serie"
      ? correct === played.length
        ? "Sans faute."
        : correct >= 8
          ? "Très solide."
          : correct >= 6
            ? "Bonne base, encore quelques points à revoir."
            : "À retravailler : relis les leçons ci-dessous."
      : mode === "chrono"
        ? `${correct} bonnes réponses sur ${played.length}, sur ${CHRONO_MAX} points possibles.`
        : `${correct} bonnes réponses sur ${played.length} questions.`;

  return (
    <div ref={topRef} className="flex flex-col gap-5 scroll-mt-24">
      <section className="pz-card p-5 md:p-6 pz-rise" aria-labelledby="quiz-bilan">
        <div className="pz-eyebrow pz-red">
          Bilan · Niveau {level} · {MODES.find((m) => m.mode === mode)?.label}
        </div>
        <div className="flex items-end justify-between gap-4 mt-2">
          <h2 id="quiz-bilan" className="text-[34px] font-black pz-mono leading-none">
            {headline}
          </h2>
          {best !== null ? (
            <span className="text-[12px] pz-muted pz-mono">Record : {formatBest(mode, best)}</span>
          ) : null}
        </div>
        <p className="text-[13.5px] mt-2">{sub}</p>

        <SaveLine saved={saved} mode={mode} level={level} />

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button type="button" className="pz-btn" onClick={onReplay}>
            Rejouer
          </button>
          <button type="button" className="pz-btn ghost" onClick={onChange}>
            Changer de niveau ou de mode
          </button>
        </div>
      </section>

      {misses.length ? (
        <section className="flex flex-col gap-3 pz-rise pz-d1" aria-label="Tes erreurs">
          <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
            À revoir ({misses.length})
          </div>
          {misses.map((p, i) => (
            <article key={`${p.question.id}-${i}`} className="pz-card p-4">
              <p className="text-[13.5px] font-bold leading-6">{p.question.q}</p>
              <p className="text-[12.5px] mt-2" style={{ color: "var(--vert)" }}>
                Bonne réponse : {p.question.options[p.question.answer]}
              </p>
              {p.choice >= 0 ? (
                <p className="text-[12.5px] pz-muted mt-1">Ta réponse : {p.question.options[p.choice]}</p>
              ) : (
                <p className="text-[12.5px] pz-muted mt-1">Pas de réponse à temps.</p>
              )}
              <p className="text-[13px] leading-6 mt-2">{p.question.explain}</p>
              {lessonTitles[p.question.lesson] ? (
                <Link
                  href={`/academy/lecon/${p.question.lesson}`}
                  className="inline-flex mt-2 text-[12px] font-bold"
                  style={{ color: "var(--argent)" }}
                >
                  Relire : {lessonTitles[p.question.lesson]} →
                </Link>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function SaveLine({ saved, mode, level }: { saved: Saved; mode: QuizMode; level: QuizLevel }) {
  const box = "rounded-2xl px-4 py-3 mt-4 text-[13px] leading-6 flex items-center gap-3";
  if (saved.status === "idle") return null;
  if (saved.status === "saving") {
    return (
      <div className={`${box} pz-muted`} style={{ border: "1px solid var(--ligne)" }} role="status">
        Enregistrement…
      </div>
    );
  }
  if (saved.status === "error") {
    return (
      <div className={`${box} pz-muted`} style={{ border: "1px solid var(--ligne)" }} role="status">
        Le résultat n&apos;a pas pu être enregistré cette fois.
      </div>
    );
  }
  const { record } = saved;
  const newRecord = record.score >= record.bestScore && record.score > 0;
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
          <strong style={{ color: "var(--vert)" }}>+{record.xpGained} XP ajoutés à ton compte. </strong>
        ) : null}
        <span className="pz-muted">
          {mode === "serie"
            ? `XP de ce niveau : ${record.xpAwarded}/${serieXpMax(level)} (paliers à 6, 8 et 10 bonnes réponses).`
            : newRecord
              ? "Nouveau record pour ce niveau."
              : "Résultat enregistré."}
        </span>
      </span>
    </div>
  );
}
