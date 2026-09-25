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
import { QUIZ_COUNT, countByLevel } from "./quiz-libre";
import { SCENARIOS } from "./simulation";

export const FREE_CHAPTER_ID = "fondamentaux";
const QUIZ_BY_LEVEL = countByLevel(null);
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

// ---------------------------------------------------------------------------
// Comparatif Gratuit / Accès complet (vitrine). C'est aussi la référence du
// futur verrou : ce qui est « true » ou décrit dans `gratuit` reste ouvert.
// ---------------------------------------------------------------------------

/** true = inclus ; false = non inclus ; texte = inclus, avec cette précision. */
export type Cellule = boolean | string;
export type LigneComparatif = { quoi: string; detail?: string; gratuit: Cellule; complet: Cellule };
export type GroupeComparatif = { titre: string; accroche: string; lignes: LigneComparatif[] };

export function comparatif(): GroupeComparatif[] {
  const f = academyFigures();
  const free = freeChapter();
  const heures = Math.round(f.minutes / 60);
  const quizFree = QUIZ_BY_LEVEL[1];
  return [
    {
      titre: "Les cours",
      accroche: "Tout le métier d'agent, du cadre juridique à la fiscalité.",
      lignes: [
        {
          quoi: "Leçons du programme",
          detail: "Cas concrets, erreur classique à éviter, l'essentiel à retenir",
          gratuit: `Module 1 · ${free.lessons.length} leçons`,
          complet: `${f.chapters} modules · ${f.lessons} leçons (~${heures} h)`,
        },
        { quoi: "Écoute des leçons à voix haute", detail: "Le texte suit la voix, mot à mot", gratuit: "Module 1", complet: true },
        { quoi: "Quiz de fin de leçon", detail: "Corrigés et expliqués", gratuit: "Module 1", complet: `${f.questions} questions` },
        { quoi: "Notes personnelles dans chaque leçon", gratuit: "Module 1", complet: true },
        { quoi: "Glossaire du métier", detail: "Les termes clés, expliqués simplement", gratuit: true, complet: true },
        { quoi: "Aide-mémoire", detail: "Les points clés de toutes tes leçons, prêts à réviser", gratuit: false, complet: true },
        { quoi: "Fiches & modèles", detail: "Mandat de représentation, contrat du joueur : quoi vérifier", gratuit: false, complet: true },
      ],
    },
    {
      titre: "L'entraînement",
      accroche: "On ne retient bien que ce qu'on pratique.",
      lignes: [
        {
          quoi: "Quiz libre",
          detail: "Série de 10, chrono ou sans fin",
          gratuit: `Niveau 1 · ${quizFree} questions`,
          complet: `4 niveaux · ${f.quizLibre} questions`,
        },
        {
          quoi: "Mises en situation",
          detail: "Tu es l'agent : négociation, mineur, crise, transfert à l'étranger…",
          gratuit: "1 dossier",
          complet: `${f.simulations} dossiers`,
        },
        { quoi: "Diagnostic de départ", detail: "Tes points forts et tes points faibles", gratuit: true, complet: true },
        { quoi: "Révision intelligente et carnet d'erreurs", detail: "Tes erreurs reviennent jusqu'à ce qu'elles soient acquises", gratuit: "Module 1", complet: true },
        { quoi: "Plan d'étude jusqu'à l'examen", detail: "Le rythme à tenir selon ta date d'examen", gratuit: false, complet: true },
      ],
    },
    {
      titre: "L'examen",
      accroche: "Arrive le jour J en ayant déjà fait l'exercice.",
      lignes: [
        { quoi: "Examen blanc de la licence d'agent", detail: "En conditions, avec minuteur", gratuit: false, complet: true },
        {
          quoi: "Certifications PARZI",
          detail: "Agent Ready, Confirmé, Expert : bilan par compétence et diplôme numérique à ton nom",
          gratuit: false,
          complet: `${f.certifications - 1} niveaux`,
        },
      ],
    },
    {
      titre: "La motivation",
      accroche: "Parce que tenir la distance, c'est la moitié du travail.",
      lignes: [
        { quoi: "XP, niveaux et série de jours", gratuit: true, complet: true },
        { quoi: "Badges et trophées", gratuit: true, complet: true },
        { quoi: "Classement des élèves (Hall of Fame)", gratuit: true, complet: true },
        { quoi: "Historique de ta progression", gratuit: true, complet: true },
      ],
    },
  ];
}
