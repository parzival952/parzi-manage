"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import ConfidenceGauge from "@/components/ConfidenceGauge";
import {
  confidenceToEngine,
  type ConfidenceValue,
} from "@/lib/academy-confidence";

export type ReplayItem = {
  lessonId: string;
  lessonTitle: string;
  questionIndex: number;
  question: string;
  options: string[];
  recurrenceCount: number;
  competencyTitle: string | null;
};

type Confidence = "certain" | "rather_certain" | "hesitant" | "guess";

export type ReplayOutcome =
  | {
      ok: true;
      correct: boolean;
      correctAnswer: number;
      remainingErrors: number;
      explain: string | null;
    }
  | { ok: false; error: string };

export default function ErrorReplay({
  items,
  submit,
}: {
  items: ReplayItem[];
  submit: (
    lessonId: string,
    questionIndex: number,
    answer: number,
    confidence: Confidence,
  ) => Promise<ReplayOutcome>;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [level, setLevel] = useState<ConfidenceValue | 0>(0);
  const [outcome, setOutcome] = useState<ReplayOutcome | null>(null);
  const [fixedCount, setFixedCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();

  const total = items.length;
  const item = items[index];

  function validate() {
    if (selected === null || level === 0 || pending) return;
    const engine = confidenceToEngine(level);
    startTransition(async () => {
      const res = await submit(item.lessonId, item.questionIndex, selected, engine);
      setOutcome(res);
      if (res.ok && res.correct) setFixedCount((n) => n + 1);
    });
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setLevel(0);
    setOutcome(null);
  }

  if (finished) {
    const perfect = fixedCount === total;
    return (
      <section className="pz-card p-6 text-center pz-rise">
        <div className="text-[34px]">{perfect ? "🏆" : "💪"}</div>
        <h2 className="text-[20px] font-black mt-2">
          {fixedCount} erreur{fixedCount > 1 ? "s" : ""} corrigée
          {fixedCount > 1 ? "s" : ""} sur {total}
        </h2>
        <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[480px] mx-auto">
          {perfect
            ? "Carnet nettoyé : chaque erreur rejouée juste en sort définitivement."
            : "Celles qui résistent restent dans ton carnet et reviendront demain. C'est la répétition qui ancre."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <Link href="/academy/revision" className="pz-btn" style={{ padding: "10px 16px" }}>
            Retour à la révision
          </Link>
          <Link href="/academy" className="pz-btn ghost" style={{ padding: "10px 16px" }}>
            Parcours
          </Link>
        </div>
      </section>
    );
  }

  const answered = outcome !== null && outcome.ok;
  const correctAnswer = answered ? outcome.correctAnswer : null;

  return (
    <section className="pz-card p-5 pz-rise">
      <div className="flex gap-1.5">
        {items.map((it, i) => (
          <div
            key={it.lessonId + it.questionIndex}
            className="flex-1 rounded-full"
            style={{
              height: 5,
              background:
                i < index || (i === index && answered)
                  ? "var(--rouge)"
                  : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mt-4">
        <div className="text-[11px] pz-muted">
          Erreur {index + 1} / {total} · {item.lessonTitle}
        </div>
        {item.recurrenceCount > 1 ? (
          <span
            className="text-[9px] font-bold rounded-full px-3 py-1 shrink-0"
            style={{ color: "#f0b35c", background: "rgba(240,179,92,.12)", border: "1px solid var(--ligne)" }}
          >
            RATÉE {item.recurrenceCount}×
          </span>
        ) : null}
      </div>

      <h2 className="text-[17px] font-extrabold mt-2">{item.question}</h2>
      {item.competencyTitle ? (
        <div className="text-[11px] pz-muted mt-1">{item.competencyTitle}</div>
      ) : null}

      <div className="flex flex-col gap-2.5 mt-4">
        {item.options.map((opt, i) => {
          let cls = "pz-opt";
          if (answered) {
            if (i === correctAnswer) cls += " correct";
            else if (i === selected) cls += " wrong";
          } else if (i === selected) {
            cls += " correct";
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={answered || pending}
              onClick={() => setSelected(i)}
              style={
                !answered && i === selected
                  ? { borderColor: "var(--rouge)", background: "rgba(228,0,43,0.10)" }
                  : undefined
              }
            >
              {opt}
            </button>
          );
        })}
      </div>

      <ConfidenceGauge
        value={level}
        onChange={setLevel}
        disabled={answered || pending}
      />

      {!answered ? (
        <button
          type="button"
          onClick={validate}
          disabled={selected === null || level === 0 || pending}
          className="pz-btn w-full mt-4"
          style={{ padding: "12px 16px" }}
        >
          {pending
            ? "Correction…"
            : selected === null
              ? "Choisis une réponse"
              : level === 0
                ? "Indique ton niveau d’assurance"
                : "Valider ma réponse"}
        </button>
      ) : null}

      {outcome && !outcome.ok ? (
        <div
          className="rounded-2xl p-4 mt-4 text-[12.5px]"
          style={{ color: "#f0b35c", background: "rgba(240,179,92,.08)", border: "1px solid rgba(240,179,92,.3)" }}
        >
          ⚠️ {outcome.error}
        </div>
      ) : null}

      {answered ? (
        <div
          className="rounded-2xl p-4 mt-4"
          style={{
            background: outcome.correct ? "rgba(29,185,84,0.08)" : "rgba(228,0,43,0.08)",
            border: `1px solid ${outcome.correct ? "rgba(29,185,84,0.35)" : "rgba(228,0,43,0.3)"}`,
          }}
        >
          <div className="text-[14px] font-extrabold" style={{ color: outcome.correct ? "#8CF3AD" : "#ff6b78" }}>
            {outcome.correct
              ? "✓ Erreur corrigée — elle sort de ton carnet."
              : "✗ Pas encore. Elle reste dans ton carnet : tu la reverras demain."}
          </div>
          {!outcome.correct ? (
            <p className="text-[12.5px] leading-6 mt-2" style={{ color: "#D8DADF" }}>
              {"La bonne réponse : " + item.options[outcome.correctAnswer]}
            </p>
          ) : null}
          {!outcome.correct && level === 5 ? (
            <p className="text-[12.5px] leading-6 mt-2" style={{ color: "#f0b35c" }}>
              {"⚠️ Fausse certitude : tu étais certain (5/5). C'est l'erreur la plus coûteuse sur le terrain — relis la leçon avant de réessayer."}
            </p>
          ) : null}
          {outcome.explain ? (
            <p className="text-[12.5px] leading-6 pz-muted mt-2">{outcome.explain}</p>
          ) : null}
          {!outcome.correct ? (
            <Link
              href={"/academy/lecon/" + item.lessonId}
              className="inline-flex mt-3 text-[11px] font-bold pz-red"
            >
              Revoir la leçon →
            </Link>
          ) : null}
        </div>
      ) : null}

      {answered ? (
        <button type="button" onClick={next} className="pz-btn w-full mt-4" style={{ padding: "12px 16px" }}>
          {index + 1 >= total ? "Voir mon bilan" : "Erreur suivante →"}
        </button>
      ) : null}
    </section>
  );
}
