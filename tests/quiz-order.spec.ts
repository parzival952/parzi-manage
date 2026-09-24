import { expect, test } from "@playwright/test";
import { COURSE } from "../src/lib/academy-course";
import {
  lessonQuizOrders,
  questionOrder,
  quizAnswersToOriginal,
  quizForDisplay,
} from "../src/lib/academy-quiz-order";

const LESSONS = COURSE.chapters.flatMap((c) => c.lessons);

test.describe("Quiz de leçon — réponses mélangées", () => {
  test("aucune leçon ne se valide en cochant toujours la même position", () => {
    for (const lesson of LESSONS) {
      const shown = quizForDisplay(lesson);
      const maxOptions = Math.max(...shown.map((q) => q.options.length));
      for (let position = 0; position < maxOptions; position++) {
        const allAtPosition = shown.every((q) => q.answer === position);
        expect(allAtPosition, `${lesson.id}, toujours la réponse n°${position + 1}`).toBe(false);
      }
    }
  });

  test("les bonnes réponses sont réparties entre les positions", () => {
    for (const lesson of LESSONS) {
      const shown = quizForDisplay(lesson);
      const maxOptions = Math.max(...shown.map((q) => q.options.length));
      const perPosition = new Map<number, number>();
      shown.forEach((q) => perPosition.set(q.answer, (perPosition.get(q.answer) ?? 0) + 1));
      const limit = Math.ceil(shown.length / maxOptions);
      for (const [position, count] of perPosition) {
        expect(count, `${lesson.id}, position ${position + 1}`).toBeLessThanOrEqual(limit);
      }
    }
  });

  test("la bonne réponse affichée est bien le bon texte, et se corrige en indice d'origine", () => {
    for (const lesson of LESSONS) {
      const shown = quizForDisplay(lesson);
      shown.forEach((q, i) => {
        const original = lesson.quiz[i];
        expect(q.options[q.answer]).toBe(original.options[original.answer]);
        expect([...q.options].sort()).toEqual([...original.options].sort());
      });
      const displayedCorrect = shown.map((q) => q.answer);
      expect(quizAnswersToOriginal(lesson, displayedCorrect)).toEqual(lesson.quiz.map((q) => q.answer));
    }
  });

  test("ordre stable, et identique entre la leçon et « rejouer mes erreurs »", () => {
    for (const lesson of LESSONS) {
      const orders = lessonQuizOrders(lesson);
      expect(lessonQuizOrders(lesson)).toEqual(orders);
      orders.forEach((order, i) => expect(questionOrder(lesson, i)).toEqual(order));
    }
  });

  test("les réponses invalides comptent comme non répondues", () => {
    const lesson = LESSONS[0];
    expect(quizAnswersToOriginal(lesson, ["0", 7, -1])).toEqual(lesson.quiz.map(() => -1));
    expect(quizAnswersToOriginal(lesson, null)).toEqual(lesson.quiz.map(() => -1));
  });
});
