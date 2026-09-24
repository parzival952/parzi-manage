import { expect, test } from "@playwright/test";
import {
  CERTS,
  examForDisplay,
  gradeExam,
  optionOrder,
  toOriginalAnswers,
} from "../src/lib/certifications";

test.describe("Certifications — intégrité des examens", () => {
  test("cocher toujours la même position ne permet de réussir aucun examen", () => {
    for (const cert of CERTS) {
      const maxOptions = Math.max(...cert.exam.map((q) => q.options.length));
      for (let position = 0; position < maxOptions; position++) {
        const displayed = cert.exam.map(() => position);
        const { score } = gradeExam(cert, toOriginalAnswers(cert, displayed));
        expect(score, `${cert.id}, toujours la réponse n°${position + 1}`).toBeLessThan(cert.passScore);
      }
    }
  });

  test("les bonnes réponses cochées dans l'ordre affiché donnent 100 %", () => {
    for (const cert of CERTS) {
      const shown = examForDisplay(cert);
      const displayed = cert.exam.map((q, i) => shown[i].options.indexOf(q.options[q.answer]));
      expect(gradeExam(cert, toOriginalAnswers(cert, displayed)).score, cert.id).toBe(100);
    }
  });

  test("l'ordre affiché est stable et reste une permutation complète", () => {
    for (const cert of CERTS) {
      cert.exam.forEach((q, i) => {
        const order = optionOrder(cert.id, i, q.options.length);
        expect(optionOrder(cert.id, i, q.options.length)).toEqual(order);
        expect([...order].sort()).toEqual(q.options.map((_, k) => k));
      });
    }
  });

  test("les réponses invalides comptent comme non répondues", () => {
    const cert = CERTS[0];
    const junk = ["1", 1.5, -1, 99, null];
    expect(toOriginalAnswers(cert, junk).slice(0, junk.length)).toEqual(junk.map(() => -1));
    expect(toOriginalAnswers(cert, "pas un tableau")).toEqual(cert.exam.map(() => -1));
  });
});
