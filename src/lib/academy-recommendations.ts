// PARZI Academy — pont entre le DIAGNOSTIC et le PROGRAMME.
// Chaque compétence évaluée par le diagnostic (section) est reliée aux leçons du
// programme (academy-course.ts) qui la renforcent, de la plus fondamentale à la
// plus avancée. Ainsi, une faiblesse détectée mène directement au bon contenu.
//
// Pur (aucune I/O) : utilisable côté serveur comme côté client.

// Sections du diagnostic → leçons du programme (ids de academy-course.ts).
export const SECTION_LESSONS: Record<string, string[]> = {
  // Lecture juridique
  "legal-reading": ["lecture-juridique", "licence", "reglement-agents", "cas-pratiques"],
  // Contrats et mandats
  contracts: ["mandat", "contrat-joueur", "clauses-cles", "commission", "litiges"],
  // Écosystème sportif
  "sport-environment": ["ecosysteme", "role", "modele-economique", "reseau"],
  // Règlements du football
  "football-regulations": ["reglement-agents", "mineurs", "transferts-systeme", "licence"],
  // Cas pratiques
  "practical-cases": ["cas-pratiques", "clauses-cles", "negocier-transfert", "litiges"],
  // Méthode d'examen
  "exam-method": ["methode-examen", "cas-pratiques", "lecture-juridique", "veille"],
};

/** Leçons recommandées pour une section du diagnostic (repli : leçon d'introduction). */
export function lessonsForSection(sectionId: string): string[] {
  return SECTION_LESSONS[sectionId] ?? ["role"];
}

/** Leçon prioritaire (première) pour une section — sert de « mission ». */
export function primaryLessonForSection(sectionId: string): string {
  return lessonsForSection(sectionId)[0];
}

/** Leçon d'un jour de plan : parcourt la liste de la section (le plan de 14 jours
 *  traverse ainsi le programme au lieu de répéter la même leçon). */
export function lessonForSectionByDay(sectionId: string, dayNumber: number): string {
  const lessons = lessonsForSection(sectionId);
  const index = Math.max(0, dayNumber - 1) % lessons.length;
  return lessons[index];
}
