// L'offre PARZI Academy, affichée sur la page d'accueil publique.
//
// Module 1 (« Les fondamentaux du métier ») gratuit ; le reste de la formation
// est payant : paiement unique, ou mensuel. Les prix se règlent ICI (un seul
// endroit). Un prix à null n'est pas affiché.
//
// Le verrou des modules payants et le paiement arrivent dans une étape
// séparée : cette page annonce l'offre, elle ne bloque rien.
import { ALL_LESSONS, COURSE, LESSON_COUNT } from "./academy-course";
import { CERTS } from "./certifications";
import { QUIZ_COUNT } from "./quiz-libre";
import { SCENARIOS } from "./simulation";

export const FREE_CHAPTER_ID = "fondamentaux";
/** Quiz libre : niveaux gratuits (les autres font partie de l'accès complet). */
export const FREE_QUIZ_LEVELS = [1];

export const OFFER = {
  /** Accès complet, en une fois (€ TTC). */
  oneTimeEur: 99 as number | null,
  /** Accès complet, par mois (€ TTC). À fixer : null = non affiché. */
  monthlyEur: null as number | null,
};

/** Essai sans compte : une leçon du module gratuit et une simulation. */
export const TRIAL_LESSON_ID = "role";
export const TRIAL_SCENARIO_ID = "dossier-mbaye";

export const SIGNUP_HREF = "/academy/connexion?mode=inscription";

export function freeChapter() {
  return COURSE.chapters.find((c) => c.id === FREE_CHAPTER_ID) ?? COURSE.chapters[0];
}

/** Chiffres réels de la formation (calculés, jamais saisis à la main). */
export function academyFigures() {
  return {
    chapters: COURSE.chapters.length,
    lessons: LESSON_COUNT,
    questions: ALL_LESSONS.reduce((n, { lesson }) => n + lesson.quiz.length, 0),
    simulations: SCENARIOS.length,
    certifications: CERTS.length,
    minutes: ALL_LESSONS.reduce((n, { lesson }) => n + lesson.minutes, 0),
    quizLibre: QUIZ_COUNT,
  };
}

export function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
