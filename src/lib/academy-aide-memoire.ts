// Aide-mémoire de révision : agrège les points « 🎯 À retenir » de chaque leçon
// du programme, groupés par chapitre. Dérivé de COURSE (aucune base de données,
// aucun contenu à maintenir en double).

import { COURSE } from "@/lib/academy-course";

export type AideMemoireLesson = {
  id: string;
  title: string;
  points: string[];
};

export type AideMemoireChapter = {
  id: string;
  title: string;
  subtitle: string;
  lessons: AideMemoireLesson[];
};

const MARKER = "🎯 À retenir";

/** Points « 🎯 À retenir » d'une leçon (liste vide si la leçon n'en a pas). */
export function extractPoints(blocks: string[]): string[] {
  const block = blocks.find((b) => b.includes(MARKER));
  if (!block) return [];
  // Retire « 🎯 À retenir » puis le tiret d'introduction éventuel.
  let body = block.slice(block.indexOf(MARKER) + MARKER.length);
  body = body.replace(/^\s*[—–-]\s*/, "");
  return body
    .split("·")
    .map((s) => s.trim().replace(/\s*\.\s*$/, "").trim())
    .filter(Boolean);
}

export function buildAideMemoire(): AideMemoireChapter[] {
  return COURSE.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    subtitle: chapter.subtitle,
    lessons: chapter.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      points: extractPoints(lesson.blocks),
    })),
  }));
}
