"use client";
import { useState } from "react";
import Link from "next/link";

type Q = { q: string; options: string[] };
type Result = { pass: boolean; already: boolean; score: number; code?: string; bonusXp?: number };

export default function CertExam({ certId, questions, onSubmit }: { certId: string; questions: Q[]; onSubmit: (answers: number[]) => Promise<Result> }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);

  const q = questions[step];
  const isLast = step === questions.length - 1;
  const answered = answers[step] >= 0;

  function pick(i: number) {
    setAnswers((a) => { const c = [...a]; c[step] = i; return c; });
  }
  async function next() {
    if (!isLast) { setStep((s) => s + 1); return; }
    setSaving(true);
    setResult(await onSubmit(answers));
    setSaving(false);
  }

  if (result) {
    if (result.pass) {
      return (
        <div className="pz-card p-6 text-center pz-rise">
          <div className="text-[44px] mb-1">🎓</div>
          <h2 className="text-[21px] font-extrabold mb-1">{result.already ? "Certification déjà obtenue" : "Certification réussie !"}</h2>
          <p className="text-[13.5px] pz-muted mb-4">Score : {result.score} %{!result.already && result.bonusXp ? ` · +${result.bonusXp} XP` : ""}</p>
          <Link href={`/academy/certifications/${certId}/diplome`} className="pz-btn w-full">Voir mon diplôme</Link>
          <Link href="/academy/certifications" className="pz-btn ghost w-full mt-2">Retour aux certifications</Link>
        </div>
      );
    }
    return (
      <div className="pz-card p-6 text-center pz-rise">
        <div className="text-[40px] mb-1">📕</div>
        <h2 className="text-[20px] font-extrabold mb-1">Pas encore validé</h2>
        <p className="text-[13.5px] pz-muted mb-4">Score : {result.score} % — il faut atteindre le seuil requis. Révise et retente, c&apos;est en travaillant qu&apos;on décroche sa certif.</p>
        <Link href={`/academy/certifications/${certId}`} className="pz-btn w-full">Réessayer</Link>
        <Link href="/academy" className="pz-btn ghost w-full mt-2">Réviser le parcours</Link>
      </div>
    );
  }

  return (
    <div className="pz-card p-6 pz-rise">
      <div className="flex items-center gap-2 mb-4">
        {questions.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < step ? "var(--rouge)" : i === step ? "var(--rougeclair)" : "rgba(255,255,255,.1)" }} />
        ))}
      </div>
      <div className="text-[11px] pz-muted mb-2">Question {step + 1} / {questions.length}</div>
      <h3 className="text-[16.5px] font-bold mb-4">{q.q}</h3>
      <div className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => (
          <button key={i} className="pz-opt" style={answers[step] === i ? { borderColor: "var(--rouge)", background: "rgba(228,0,43,.10)" } : {}} onClick={() => pick(i)}>{opt}</button>
        ))}
      </div>
      <button className="pz-btn w-full mt-5" onClick={next} disabled={!answered || saving}>
        {saving ? "Correction…" : isLast ? "Terminer l'examen" : "Question suivante"}
      </button>
      <p className="text-[11px] pz-muted mt-3 text-center">Examen à {questions.length} questions · une seule réponse par question.</p>
    </div>
  );
}
