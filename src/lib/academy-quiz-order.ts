// Mélange des réponses des quiz de leçon (voir answer-order.ts).
// Le navigateur voit les réponses dans l'ordre mélangé ; avant toute correction
// (RPC Supabase ou démo SQLite), le serveur remet les réponses dans l'ordre
// d'origine, celui des clés de correction.
import { balancedOrders, displayedToOriginal, reorderQuestion } from "./answer-order";
import type { Lesson, QuizQuestion } from "./academy-course";

/** Ordre d'affichage de chaque question du quiz d'une leçon. */
export function lessonQuizOrders(lesson: Lesson): number[][] {
  return balancedOrders(`lecon:${lesson.id}`, lesson.quiz);
}

/** Quiz tel qu'affiché : réponses mélangées, bonne réponse recalculée pour le retour immédiat. */
export function quizForDisplay(lesson: Lesson): QuizQuestion[] {
  const orders = lessonQuizOrders(lesson);
  return lesson.quiz.map((q, i) => reorderQuestion(q, orders[i]));
}

/** Réponses cochées (ordre affiché) → indices d'origine, pour la correction. */
export function quizAnswersToOriginal(lesson: Lesson, displayed: unknown): number[] {
  const orders = lessonQuizOrders(lesson);
  const list = Array.isArray(displayed) ? displayed : [];
  return lesson.quiz.map((_, i) => displayedToOriginal(orders[i], list[i]));
}

/** Ordre d'affichage d'une seule question (rejouer une erreur). */
export function questionOrder(lesson: Lesson, questionIndex: number): number[] | null {
  return lessonQuizOrders(lesson)[questionIndex] ?? null;
}
