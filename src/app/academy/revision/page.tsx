export const dynamic = "force-dynamic";

import Link from "next/link";

import { requireUser } from "@/lib/auth";
import {
  loadAcademyLearningState,
  type LearningError,
} from "@/lib/academy-learning";
import { findLesson, lessonsForAttr, type AttrKey } from "@/lib/academy";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Non commencé",
  fragile: "Fragile",
  developing: "En progrès",
  operational: "Opérationnel",
  mastered: "Maîtrisé",
  review_due: "À réviser",
};

const MISTAKE_LABEL: Record<string, string> = {
  unclassified: "À revoir",
  unknown_rule: "Règle non sue",
  confusion: "Confusion",
  forgotten_exception: "Exception oubliée",
  misreading: "Mauvaise lecture",
  incomplete_reasoning: "Raisonnement incomplet",
  rushed_answer: "Réponse précipitée",
  false_confidence: "Excès de confiance",
};

const DOMAINS: AttrKey[] = ["SCO", "NEG", "JUR", "BUS", "IA", "MGT"];

function attrOf(competencyId: string | null): AttrKey | null {
  if (!competencyId || !competencyId.startsWith("DOM-")) {
    return null;
  }
  const k = competencyId.slice(4);
  return (DOMAINS as string[]).includes(k) ? (k as AttrKey) : null;
}

function toneFor(score: number): string {
  if (score < 25) return "#ff6b78";
  if (score < 55) return "#f0b35c";
  if (score < 80) return "#e9c36a";
  return "var(--vert)";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function lessonTitle(id: string): string {
  return findLesson(id)?.lesson.title ?? id;
}

function reviewLessonHref(competencyId: string): string {
  const attr = attrOf(competencyId);
  const first = attr ? lessonsForAttr(attr)[0] : undefined;
  return first ? `/academy/lecon/${first.id}` : "/academy";
}

export default async function AcademyRevisionPage() {
  await requireUser();

  const state = await loadAcademyLearningState();

  if (!state) {
    return (
      <main className="flex flex-col gap-6">
        <header className="pz-rise">
          <Link href="/academy" className="text-[12px] pz-muted hover:text-white">
            ← Retour à PARZI Academy
          </Link>
          <h1 className="text-[24px] font-black tracking-tight mt-4">
            Révision intelligente
          </h1>
        </header>
        <section className="pz-card p-6 text-center pz-rise pz-d1">
          <div className="text-[40px]">🧠</div>
          <p className="text-[13px] pz-muted mt-3 max-w-[460px] mx-auto">
            La révision se construit à partir de tes réponses. Valide une leçon
            ou un examen : les questions ratées viendront ici, prêtes à être
            retravaillées.
          </p>
          <Link href="/academy" className="pz-btn inline-flex mt-5">
            Commencer une leçon
          </Link>
        </section>
      </main>
    );
  }

  const hasActivity =
    state.competencies.some((c) => c.attemptsCount > 0) ||
    state.errors.length > 0 ||
    state.reviews.length > 0;

  const openErrors = state.errors.filter((e) => e.status !== "resolved");

  return (
    <main className="flex flex-col gap-6">
      <header className="pz-rise">
        <Link href="/academy" className="text-[12px] pz-muted hover:text-white">
          ← Retour à PARZI Academy
        </Link>

        <div className="mt-5">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: "var(--vert)" }}
          >
            RÉVISION INTELLIGENTE
          </div>
          <h1 className="text-[26px] font-black tracking-tight mt-2">
            Ce qu&apos;il te reste à consolider
          </h1>
          <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
            Tes erreurs alimentent un carnet et une file de révision espacée :
            on te ramène chaque notion au bon moment, jusqu&apos;à la maîtrise.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 pz-rise pz-d1">
        <div className="pz-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.13em] pz-muted">
            À réviser aujourd&apos;hui
          </div>
          <strong className="block text-[26px] mt-1 pz-red">
            {state.dueReviewCount}
          </strong>
        </div>
        <div className="pz-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.13em] pz-muted">
            Erreurs à corriger
          </div>
          <strong className="block text-[26px] mt-1">
            {state.openErrorCount}
          </strong>
        </div>
      </section>

      {!hasActivity ? (
        <section className="pz-card p-6 text-center pz-rise pz-d2">
          <div className="text-[36px]">✨</div>
          <p className="text-[13px] pz-muted mt-3 max-w-[460px] mx-auto">
            Rien à réviser pour l&apos;instant — beau travail. Continue le
            parcours : dès qu&apos;une réponse est ratée, elle apparaîtra ici.
          </p>
          <Link href="/academy" className="pz-btn inline-flex mt-5">
            Continuer le parcours
          </Link>
        </section>
      ) : null}

      {state.reviews.length > 0 ? (
        <section className="flex flex-col gap-3 pz-rise pz-d2">
          <h2 className="text-[18px] font-black">À réviser maintenant</h2>
          {state.reviews.map((r) => (
            <article key={r.reviewId} className="pz-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-extrabold">{r.title}</h3>
                  <p className="text-[11px] pz-muted mt-1">
                    Prévu le {formatDate(r.scheduledFor)} · priorité {r.priority}
                    /100
                  </p>
                </div>
                <span
                  className="text-[9px] font-bold rounded-full px-3 py-1 shrink-0"
                  style={{
                    color: "#ff8290",
                    background: "rgba(228,0,43,.10)",
                    border: "1px solid var(--ligne)",
                  }}
                >
                  PRIORITAIRE
                </span>
              </div>
              <Link
                href={reviewLessonHref(r.competencyId)}
                className="inline-flex mt-3 text-[11px] font-bold pz-red"
              >
                Revoir cette compétence →
              </Link>
            </article>
          ))}
        </section>
      ) : null}

      {openErrors.length > 0 ? (
        <section className="flex flex-col gap-3 pz-rise pz-d3">
          <h2 className="text-[18px] font-black">Carnet d&apos;erreurs</h2>
          {openErrors.map((e: LearningError) => (
            <article key={e.errorId} className="pz-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-extrabold">
                    {lessonTitle(e.lessonId)}
                  </h3>
                  <p className="text-[11px] pz-muted mt-1">
                    {e.competencyTitle ?? "Compétence"} · question{" "}
                    {e.questionIndex + 1} ·{" "}
                    {MISTAKE_LABEL[e.mistakeType] ?? "À revoir"}
                    {e.recurrenceCount > 1
                      ? ` · ${e.recurrenceCount}× ratée`
                      : ""}
                  </p>
                </div>
                {e.recurrenceCount > 1 ? (
                  <span
                    className="text-[9px] font-bold rounded-full px-3 py-1 shrink-0"
                    style={{
                      color: "#f0b35c",
                      background: "rgba(240,179,92,.12)",
                      border: "1px solid var(--ligne)",
                    }}
                  >
                    RÉCURRENTE
                  </span>
                ) : null}
              </div>
              <Link
                href={`/academy/lecon/${e.lessonId}`}
                className="inline-flex mt-3 text-[11px] font-bold pz-red"
              >
                Revoir la leçon →
              </Link>
            </article>
          ))}
        </section>
      ) : null}

      {state.competencies.length > 0 ? (
        <section className="pz-card p-5 pz-rise pz-d4">
          <h2 className="text-[16px] font-black">Maîtrise par compétence</h2>
          <div className="flex flex-col gap-3 mt-4">
            {state.competencies.map((c) => (
              <div key={c.competencyId}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold">{c.title}</span>
                  <span className="pz-muted">
                    {STATUS_LABEL[c.status] ?? c.status} ·{" "}
                    {Math.round(c.masteryScore)} %
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full mt-1"
                  style={{ background: "rgba(255,255,255,.08)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(3, Math.round(c.masteryScore))}%`,
                      background: toneFor(c.masteryScore),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] pz-muted mt-4">
            La maîtrise monte quand tu réponds juste, baisse quand tu te trompes,
            et programme automatiquement la prochaine révision.
          </p>
        </section>
      ) : null}
    </main>
  );
}
