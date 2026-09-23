export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import Link from "next/link";

import ErrorReplay, {
  type ReplayItem,
  type ReplayOutcome,
} from "@/components/ErrorReplay";
import { findLesson } from "@/lib/academy";
import { loadAcademyLearningState } from "@/lib/academy-learning";
import {
  RETRY_CONFIDENCES,
  retryAcademyError,
  retryAvailable,
  type RetryConfidence,
} from "@/lib/academy-retry";
import { requireUser } from "@/lib/auth";
import { IconTile } from "@/components/AcademyIcon";

export const metadata = { title: "Rejouer mes erreurs" };

export default async function RejouerErreursPage() {
  await requireUser();

  const state = retryAvailable() ? await loadAcademyLearningState() : null;

  // Seuls l'énoncé et les options partent au navigateur — jamais la bonne réponse.
  const items: ReplayItem[] = (state?.errors ?? [])
    .filter((e) => e.status !== "resolved")
    .flatMap((e) => {
      const found = findLesson(e.lessonId);
      const q = found?.lesson.quiz[e.questionIndex];
      if (!found || !q) return [];
      return [
        {
          lessonId: e.lessonId,
          lessonTitle: found.lesson.title,
          questionIndex: e.questionIndex,
          question: q.q,
          options: q.options,
          recurrenceCount: e.recurrenceCount,
          competencyTitle: e.competencyTitle,
        },
      ];
    });

  async function submit(
    lessonId: string,
    questionIndex: number,
    answer: number,
    confidence: RetryConfidence,
  ): Promise<ReplayOutcome> {
    "use server";

    await requireUser();

    if (!RETRY_CONFIDENCES.includes(confidence)) {
      return { ok: false, error: "Niveau de certitude invalide." };
    }

    try {
      const r = await retryAcademyError(lessonId, questionIndex, answer, confidence);
      const explain =
        findLesson(lessonId)?.lesson.quiz[questionIndex]?.explain ?? null;

      revalidatePath("/academy");
      revalidatePath("/academy/revision");

      return {
        ok: true,
        correct: r.correct,
        correctAnswer: r.correctAnswer,
        remainingErrors: r.remainingErrors,
        explain,
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "La correction a échoué.",
      };
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <header className="pz-rise">
        <Link href="/academy/revision" className="text-[12px] pz-muted hover:text-white">
          ← Révision intelligente
        </Link>
        <div
          className="pz-eyebrow mt-5"
          style={{ color: "var(--rouge-vif)" }}
        >
          CARNET D&apos;ERREURS
        </div>
        <h1 className="text-[26px] font-black tracking-tight mt-2">
          Rejouer mes erreurs
        </h1>
        <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[620px]">
          Chaque question ratée revient. Réponds juste et elle sort de ton
          carnet ; rate-la et elle revient demain. Indique ton niveau
          d&apos;assurance : une erreur à 5/5 est une fausse certitude, traitée
          en priorité par le moteur de révision.
        </p>
      </header>

      {!state ? (
        <section className="pz-card p-6 text-center pz-rise pz-d1">
          <IconTile name="lock" size={48} />
          <p className="text-[13px] leading-6 pz-muted mt-2">
            Le rejeu des erreurs est disponible avec un compte connecté : ton
            carnet est enregistré et corrigé côté serveur.
          </p>
        </section>
      ) : items.length === 0 ? (
        <section className="pz-card p-6 text-center pz-rise pz-d1">
          <IconTile name="check" size={48} tone="var(--vert)" />
          <h2 className="text-[18px] font-black mt-2">Carnet vide</h2>
          <p className="text-[13px] leading-6 pz-muted mt-2">
            Aucune erreur à rejouer. Continue ton parcours : chaque question
            ratée atterrira ici automatiquement.
          </p>
          <Link href="/academy" className="pz-btn inline-flex mt-4" style={{ padding: "10px 16px" }}>
            Continuer le parcours
          </Link>
        </section>
      ) : (
        <ErrorReplay items={items} submit={submit} />
      )}
    </main>
  );
}
