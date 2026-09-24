// Aperçu admin PARZI Academy : voir badges, trophées et rangs tous débloqués,
// sans rien écrire. Les badges et trophées restent calculés à partir de la
// vraie progression pour tout le monde ; l'aperçu remplace seulement les
// statistiques UTILISÉES POUR L'AFFICHAGE, le temps d'une page, et seulement
// pour un admin. Rien ne touche la base, le classement ni les certifications.
import { chaptersCompleted, COURSE, LESSON_COUNT } from "./academy";
import type { BadgeStats } from "./badges";
import { cumulativeXp, levelInfo, MAX_LEVEL, type LevelInfo } from "./progression";
import { isAdmin } from "./verification";

export const PREVIEW_PARAM = "apercu";

/** L'utilisateur est-il admin, et a-t-il demandé l'aperçu (`?apercu=1`) ? */
export function adminPreviewState(
  email: string | null | undefined,
  params: Record<string, string | string[] | undefined>,
): { admin: boolean; preview: boolean } {
  const admin = isAdmin(email);
  const raw = params[PREVIEW_PARAM];
  const asked = (Array.isArray(raw) ? raw[0] : raw) === "1";
  return { admin, preview: admin && asked };
}

/** Statistiques « tout débloqué » : niveau max, toutes les leçons à 100 %, séries longues. */
export function maxedStats(): BadgeStats & { totalLessons: number } {
  const allLessons = new Set(COURSE.chapters.flatMap((c) => c.lessons.map((l) => l.id)));
  return {
    level: MAX_LEVEL,
    xp: cumulativeXp(MAX_LEVEL),
    streak: 365,
    best: 365,
    lessons: LESSON_COUNT,
    chapters: chaptersCompleted(allLessons),
    perfect: LESSON_COUNT,
    totalLessons: LESSON_COUNT,
  };
}

/** Niveau et rang « tout débloqué » pour l'échelle des rangs. */
export function maxedLevelInfo(): LevelInfo {
  return levelInfo(cumulativeXp(MAX_LEVEL));
}
