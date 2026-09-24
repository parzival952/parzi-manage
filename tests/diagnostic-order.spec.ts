import { expect, test } from "@playwright/test";
import {
  loadPrivateDiagnosticQuestions,
  loadPublicDiagnosticQuestions,
} from "../src/lib/academy-diagnostic";

test.describe("Diagnostic — propositions mélangées", () => {
  const privateQuestions = loadPrivateDiagnosticQuestions();
  const publicQuestions = loadPublicDiagnosticQuestions();

  test("mêmes questions, mêmes propositions (seul l'ordre change), sans la clé", () => {
    expect(publicQuestions.map((q) => q.id)).toEqual(privateQuestions.map((q) => q.id));
    publicQuestions.forEach((q, i) => {
      const ids = (list: { id: string }[]) => list.map((o) => o.id).sort();
      expect(ids(q.options)).toEqual(ids(privateQuestions[i].options));
      expect("correctAnswerIds" in q).toBe(false);
    });
  });

  test("la bonne réponse des questions à choix unique est répartie entre les positions", () => {
    const single = privateQuestions.filter((q) => !q.isMultiple);
    const perPosition = new Map<number, number>();
    for (const q of single) {
      const shown = publicQuestions.find((p) => p.id === q.id)!;
      const position = shown.options.findIndex((o) => o.id === q.correctAnswerIds[0]);
      perPosition.set(position, (perPosition.get(position) ?? 0) + 1);
    }
    const maxOptions = Math.max(...single.map((q) => q.options.length));
    for (const [position, count] of perPosition) {
      expect(count, `position ${position + 1}`).toBeLessThanOrEqual(Math.ceil(single.length / maxOptions) + 1);
    }
  });

  test("l'ordre est stable d'un chargement à l'autre", () => {
    expect(loadPublicDiagnosticQuestions()).toEqual(publicQuestions);
  });
});
