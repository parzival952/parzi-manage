"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Q = { q: string; options: string[] };
type Domain = { key: string; label: string; correct: number; total: number; pct: number };
type Result = { pass: boolean; already: boolean; score: number; code?: string; bonusXp?: number; breakdown?: Domain[] };

function Breakdown({ items }: { items?: Domain[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6 text-left">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] pz-muted mb-3 text-center">Bilan par compétence</div>
      <div className="flex flex-col gap-2.5">
        {items.map((d) => (
          <div key={d.key}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold">{d.label}</span>
              <span className="pz-muted">{d.correct}/{d.total} · {d.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full mt-1" style={{ background: "rgba(255,255,255,.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.pct >= 70 ? "var(--vert)" : d.pct >= 40 ? "var(--or,#E9C36A)" : "var(--rouge)" }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] pz-muted mt-3 text-center">Concentre tes révisions sur les compétences en dessous de 70 %.</p>
    </div>
  );
}

export default function CertExam({ certId, questions, durationMin, onSubmit }: { certId: string; questions: Q[]; durationMin?: number; onSubmit: (answers: number[]) => Promise<Result> }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(durationMin ? durationMin * 60 : null);

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const submittedRef = useRef(false);

  async function doSubmit(final: number[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);
    setResult(await onSubmit(final));
    setSaving(false);
  }

  // Compte à rebours : à 0, l'examen se soumet automatiquement (réponses actuelles).
  useEffect(() => {
    if (remaining === null || result || submittedRef.current) return;
    if (remaining <= 0) { void doSubmit(answersRef.current); return; }
    const t = setTimeout(() => setRemaining((r) => (r === null ? r : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining, result]);

  const q = questions[step];
  const isLast = step === questions.length - 1;
  const answered = answers[step] >= 0;

  function pick(i: number) {
    setAnswers((a) => { const c = [...a]; c[step] = i; return c; });
  }
  function next() {
    if (!isLast) { setStep((s) => s + 1); return; }
    void doSubmit(answersRef.current);
  }

  const mmss = remaining !== null ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}` : null;
  const lowTime = remaining !== null && remaining <= 60;

  if (result) {
    if (result.pass) {
      return (
        <div className="pz-card p-6 text-center pz-rise">
          <div className="text-[44px] mb-1">🎓</div>
          <h2 className="text-[21px] font-extrabold mb-1">{result.already ? "Certification déjà obtenue" : "Certification réussie !"}</h2>
          <p className="text-[13.5px] pz-muted mb-4">Score : {result.score} %{!result.already && result.bonusXp ? ` · +${result.bonusXp} XP` : ""}</p>
          <Breakdown items={result.breakdown} />
          <Link href={`/academy/certifications/${certId}/diplome`} className="pz-btn w-full mt-5">Voir mon diplôme</Link>
          <Link href="/academy/certifications" className="pz-btn ghost w-full mt-2">Retour aux certifications</Link>
        </div>
      );
    }
    return (
      <div className="pz-card p-6 text-center pz-rise">
        <div className="text-[40px] mb-1">📕</div>
        <h2 className="text-[20px] font-extrabold mb-1">Pas encore validé</h2>
        <p className="text-[13.5px] pz-muted mb-4">Score : {result.score} % — il faut atteindre le seuil requis. Révise et retente, c&apos;est en travaillant qu&apos;on décroche sa certif.</p>
        <Breakdown items={result.breakdown} />
        <Link href={`/academy/certifications/${certId}`} className="pz-btn w-full mt-5">Réessayer</Link>
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
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] pz-muted">Question {step + 1} / {questions.length}</div>
        {mmss ? (
          <div className="text-[12px] font-bold tabular-nums" style={{ color: lowTime ? "var(--rouge)" : "var(--gris2,#8A8F98)" }}>⏱ {mmss}</div>
        ) : null}
      </div>
      <h3 className="text-[16.5px] font-bold mb-4">{q.q}</h3>
      <div className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => (
          <button key={i} className="pz-opt" style={answers[step] === i ? { borderColor: "var(--rouge)", background: "rgba(228,0,43,.10)" } : {}} onClick={() => pick(i)}>{opt}</button>
        ))}
      </div>
      <button className="pz-btn w-full mt-5" onClick={next} disabled={!answered || saving}>
        {saving ? "Correction…" : isLast ? "Terminer l'examen" : "Question suivante"}
      </button>
      <p className="text-[11px] pz-muted mt-3 text-center">
        Examen à {questions.length} questions · une seule réponse par question{mmss ? ` · ${durationMin} min` : ""}.
      </p>
    </div>
  );
}
