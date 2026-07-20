"use client";
import { useState } from "react";
import Link from "next/link";

type Q = { q: string; options: string[]; answer: number; explain?: string };
type Result = { already: boolean; xpGained: number; leveledUp: boolean; newLevel: number; streak: number };

export default function LessonQuiz({ questions, onComplete }: { questions: Q[]; onComplete: (score: number) => Promise<Result> }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);

  const q = questions[step];
  const isLast = step === questions.length - 1;

  function choose(i: number) {
    if (locked) return;
    setPicked(i);
    setLocked(true);
    if (i === q.answer) setCorrect((c) => c + 1);
  }

  async function next() {
    if (!isLast) {
      setStep((s) => s + 1);
      setPicked(null);
      setLocked(false);
      return;
    }
    setSaving(true);
    const score = Math.round((correct / questions.length) * 100);
    const r = await onComplete(score);
    setResult(r);
    setSaving(false);
  }

  if (result) {
    return (
      <div className="pz-card p-6 text-center pz-rise">
        <div className="text-[40px] mb-1">{result.leveledUp ? "🏅" : result.already ? "📘" : "✦"}</div>
        <h2 className="text-[20px] font-extrabold mb-1">
          {result.already ? "Leçon révisée" : result.leveledUp ? `Niveau ${result.newLevel} atteint !` : "Leçon validée"}
        </h2>
        <p className="text-[13.5px] pz-muted mb-4">
          {result.already
            ? "Tu avais déjà validé cette leçon — révision utile, mais pas de nouvelle XP."
            : `Score ${Math.round((correct / questions.length) * 100)} %.`}
        </p>
        {!result.already && (
          <div className="flex items-center justify-center gap-6 mb-5">
            <div><div className="text-[24px] font-black pz-red">+{result.xpGained}</div><div className="text-[11px] pz-muted">XP gagnée</div></div>
            <div><div className="text-[24px] font-black">🔥 {result.streak}</div><div className="text-[11px] pz-muted">jours de série</div></div>
          </div>
        )}
        <Link href="/academy" className="pz-btn w-full">Continuer le parcours</Link>
      </div>
    );
  }

  return (
    <div className="pz-card p-6 pz-rise">
      <div className="flex items-center gap-2 mb-4">
        {questions.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? "var(--rouge)" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div className="text-[11px] pz-muted mb-2">Question {step + 1} / {questions.length}</div>
      <h3 className="text-[16.5px] font-bold mb-4">{q.q}</h3>

      <div className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => {
          let cls = "pz-opt";
          if (locked && i === q.answer) cls += " correct";
          else if (locked && i === picked) cls += " wrong";
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={locked}>{opt}</button>
          );
        })}
      </div>

      {locked && q.explain && (
        <p className="text-[13px] pz-muted mt-4 pz-rise" style={{ borderLeft: "2px solid var(--rouge)", paddingLeft: 12 }}>{q.explain}</p>
      )}

      <button className="pz-btn w-full mt-5" onClick={next} disabled={!locked || saving}>
        {saving ? "Enregistrement…" : isLast ? "Terminer la leçon" : "Question suivante"}
      </button>
    </div>
  );
}
