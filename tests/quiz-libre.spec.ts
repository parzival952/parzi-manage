import { expect, test, type Page } from "@playwright/test";

import { COURSE, findLesson } from "../src/lib/academy-course";
import { QUESTIONS, QUIZ_COUNT, drawQuestions, gradeRun, InvalidQuizError } from "../src/lib/quiz-libre";
import { CHRONO_MAX, serieXp, serieXpMax, type QuizLevel } from "../src/lib/quiz-libre/types";

const byText = new Map(QUESTIONS.map((q) => [q.q, q]));

test.describe("Quiz libre — banque de questions", () => {
  test("plus de 500 questions, 4 niveaux, rattachées à de vraies leçons", () => {
    expect(QUIZ_COUNT).toBeGreaterThan(500);
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(QUIZ_COUNT);
    for (const level of [1, 2, 3, 4]) {
      expect(QUESTIONS.filter((q) => q.level === level).length, `niveau ${level}`).toBeGreaterThanOrEqual(90);
    }
    const chapterIds = new Set(COURSE.chapters.map((c) => c.id));
    for (const q of QUESTIONS) {
      const found = findLesson(q.lesson);
      expect(found, q.id).not.toBeNull();
      expect(found!.chapter.id, q.id).toBe(q.chapter);
      expect(chapterIds.has(q.chapter)).toBe(true);
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.q.length, q.id).toBeLessThanOrEqual(220);
      expect(q.explain.length, q.id).toBeLessThanOrEqual(260);
      q.options.forEach((o) => expect(o.length, q.id).toBeLessThanOrEqual(140));
    }
    // Chaque leçon du programme a ses questions, à chaque niveau.
    for (const c of COURSE.chapters) {
      for (const l of c.lessons) {
        for (const level of [1, 2, 3, 4]) {
          expect(QUESTIONS.some((q) => q.lesson === l.id && q.level === level), `${l.id} niv.${level}`).toBe(true);
        }
      }
    }
    // Énoncés tous différents.
    expect(new Set(QUESTIONS.map((q) => q.q)).size).toBe(QUIZ_COUNT);
  });

  test("tirage : bon niveau, bon module, pas de doublon, bonne réponse mélangée", () => {
    const qs = drawQuestions(3, null, 10);
    expect(qs).toHaveLength(10);
    expect(new Set(qs.map((q) => q.id)).size).toBe(10);
    const positions = new Set<number>();
    for (const q of qs) {
      expect(q.level).toBe(3);
      const bank = QUESTIONS.find((b) => b.id === q.id)!;
      expect(q.options[q.answer]).toBe(bank.options[0]);
      expect([...q.options].sort()).toEqual([...bank.options].sort());
      positions.add(q.answer);
    }
    // Sur 200 tirages, la bonne réponse occupe toutes les positions.
    for (let i = 0; i < 20; i++) drawQuestions(1, null, 10).forEach((q) => positions.add(q.answer));
    expect(positions.size).toBe(4);

    const fiscal = drawQuestions(2, "fiscalite-statut", 50);
    expect(fiscal.length).toBeGreaterThan(5);
    fiscal.forEach((q) => expect(q.chapter).toBe("fiscalite-statut"));

    // Les questions déjà vues ne reviennent pas tant qu'il en reste.
    const pool = QUESTIONS.filter((q) => q.level === 4 && q.chapter === "methode-pro").map((q) => q.id);
    const rest = drawQuestions(4, "methode-pro", 50, pool.slice(0, pool.length - 2));
    expect(rest.map((q) => q.id).sort()).toEqual(pool.slice(-2).sort());
    // Tout vu : on repart de toute la sélection.
    expect(drawQuestions(4, "methode-pro", 50, pool)).toHaveLength(pool.length);
  });
});

test.describe("Quiz libre — correction côté serveur", () => {
  const lvl1 = QUESTIONS.filter((q) => q.level === 1);
  const good = (q: (typeof QUESTIONS)[number]) => ({ id: q.id, choice: q.options[0] });
  const bad = (q: (typeof QUESTIONS)[number]) => ({ id: q.id, choice: q.options[2] });

  test("série : bonnes réponses sur 10, parties truquées refusées", () => {
    const answers = lvl1.slice(0, 10).map((q, i) => (i < 7 ? good(q) : bad(q)));
    expect(gradeRun(1, "serie", answers)).toMatchObject({ score: 7, correct: 7, total: 10 });
    expect(() => gradeRun(1, "serie", answers.slice(0, 9))).toThrow(InvalidQuizError);
    expect(() => gradeRun(1, "serie", [...answers.slice(0, 9), answers[0]])).toThrow(InvalidQuizError);
    expect(() => gradeRun(2, "serie", answers)).toThrow(InvalidQuizError); // mauvais niveau
    expect(() => gradeRun(1, "serie", [...answers.slice(0, 9), { id: "inconnue", choice: "x" }])).toThrow(InvalidQuizError);
    expect(() => gradeRun(1, "serie", "n'importe quoi")).toThrow(InvalidQuizError);
  });

  test("chrono : points selon la vitesse, plafonnés", () => {
    const answers = lvl1.slice(0, 10).map((q) => ({ ...good(q), ms: 0 }));
    expect(gradeRun(1, "chrono", answers).score).toBe(CHRONO_MAX);
    const slow = lvl1.slice(0, 10).map((q) => ({ ...good(q), ms: 19_500 }));
    expect(gradeRun(1, "chrono", slow).score).toBe(1000);
    const cheat = lvl1.slice(0, 10).map((q) => ({ ...good(q), ms: -50_000 }));
    expect(gradeRun(1, "chrono", cheat).score).toBe(CHRONO_MAX);
  });

  test("sans fin : la plus longue série sans faute", () => {
    const qs = lvl1.slice(0, 8);
    const answers = [good(qs[0]), good(qs[1]), bad(qs[2]), good(qs[3]), good(qs[4]), good(qs[5]), bad(qs[6]), good(qs[7])];
    expect(gradeRun(1, "libre", answers)).toMatchObject({ score: 3, correct: 6, total: 8 });
  });

  test("XP de série : paliers à 6, 8 et 10, multipliés par le niveau", () => {
    expect(serieXp(5, 1)).toBe(0);
    expect(serieXp(6, 1)).toBe(10);
    expect(serieXp(8, 2)).toBe(40);
    expect(serieXp(10, 4)).toBe(120);
    expect([1, 2, 3, 4].reduce((s, l) => s + serieXpMax(l as QuizLevel), 0)).toBe(300);
  });
});

async function answerCurrent(page: Page, correct: boolean) {
  const text = (await page.locator("#quiz-question").innerText()).trim();
  const bank = byText.get(text);
  expect(bank, text).toBeTruthy();
  const target = correct ? bank!.options[0] : bank!.options[1];
  await page.getByRole("button", { name: target, exact: true }).click();
}

test("PARZI Academy : quiz libre, une série de 10 avec XP", async ({ page }) => {
  await page.goto("/academy/quiz");
  await expect(page.getByRole("heading", { name: "Quiz libre" })).toBeVisible();
  await page.getByRole("button", { name: /Niveau 2 · Intermédiaire/ }).click();
  await page.getByRole("button", { name: /Série de 10/ }).click();
  await page.getByRole("button", { name: "Lancer le quiz →" }).click();

  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Question ${i + 1}/10`)).toBeVisible();
    await answerCurrent(page, true);
    await expect(page.getByText("Bonne réponse.")).toBeVisible();
    await page.getByRole("button", { name: i === 9 ? "Voir mon résultat →" : "Question suivante →" }).click();
  }

  await expect(page.getByRole("heading", { name: "10/10" })).toBeVisible();
  await expect(page.getByText("Sans faute.")).toBeVisible();
  await expect(page.getByText(/XP de ce niveau : 60\/60/)).toBeVisible();
});

test("PARZI Academy : quiz libre, les erreurs renvoient vers la leçon", async ({ page }) => {
  await page.goto("/academy/quiz");
  await page.getByRole("button", { name: "Lancer le quiz →" }).click();
  for (let i = 0; i < 10; i++) {
    await answerCurrent(page, i % 2 === 0);
    await page.getByRole("button", { name: i === 9 ? "Voir mon résultat →" : "Question suivante →" }).click();
  }
  await expect(page.getByRole("heading", { name: "5/10" })).toBeVisible();
  await expect(page.getByText("À revoir (5)")).toBeVisible();
  await expect(page.getByRole("link", { name: /Relire :/ }).first()).toBeVisible();
});

test("PARZI Academy : quiz libre, chrono et sans fin", async ({ page }) => {
  await page.goto("/academy/quiz");
  await page.getByRole("button", { name: /Chrono/ }).click();
  await page.getByRole("button", { name: "Lancer le quiz →" }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Question ${i + 1}/10`)).toBeVisible();
    await answerCurrent(page, true);
  }
  await expect(page.getByText(/Bilan · Niveau 1 · Chrono/)).toBeVisible({ timeout: 10_000 });
  const pts = Number((await page.locator("#quiz-bilan").innerText()).replace(/\D/g, ""));
  expect(pts).toBeGreaterThan(1500);

  await page.getByRole("button", { name: "Changer de niveau ou de mode" }).click();
  await page.getByRole("button", { name: /Sans fin/ }).click();
  await page.getByRole("button", { name: "Lancer le quiz →" }).click();
  for (let i = 0; i < 4; i++) {
    await answerCurrent(page, i < 3);
    await page.getByRole("button", { name: "Question suivante →" }).click();
  }
  await page.getByRole("button", { name: "Arrêter et voir mon bilan" }).click();
  await expect(page.getByRole("heading", { name: "3 d'affilée" })).toBeVisible();
  await expect(page.getByText(/Nouveau record pour ce niveau|Résultat enregistré/)).toBeVisible();
});
