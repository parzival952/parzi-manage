// Registre des mises en situation PARZI Academy.
import type { Scenario } from "./engine";
import { BENALI } from "./scenarios/benali";
import { FOURNIER } from "./scenarios/fournier";
import { LEMAIRE } from "./scenarios/lemaire";
import { MBAYE } from "./scenarios/mbaye";
import { MOREL } from "./scenarios/morel";
import { RIVIERE } from "./scenarios/riviere";
import { TRAORE } from "./scenarios/traore";

export const SCENARIOS: Scenario[] = [MBAYE, TRAORE, LEMAIRE, MOREL, FOURNIER, RIVIERE, BENALI];

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
