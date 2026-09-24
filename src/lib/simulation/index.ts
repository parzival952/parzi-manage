// Registre des mises en situation PARZI Academy.
import type { Scenario } from "./engine";
import { LEMAIRE } from "./scenarios/lemaire";
import { MBAYE } from "./scenarios/mbaye";
import { MOREL } from "./scenarios/morel";
import { TRAORE } from "./scenarios/traore";

export const SCENARIOS: Scenario[] = [MBAYE, TRAORE, LEMAIRE, MOREL];

export function getScenario(id: string): Scenario | null {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

/** Scénarios proposés dans un chapitre ou une leçon (encarts). */
export function scenariosForChapter(chapterId: string): Scenario[] {
  return SCENARIOS.filter((s) => s.chapters.includes(chapterId));
}

export function scenariosForLesson(lessonId: string): Scenario[] {
  return SCENARIOS.filter((s) => s.lessons.includes(lessonId));
}
