// Inscription progressive PARZI Academy : les questions posées après la
// création du compte, et leur validation. Fonctions pures (testables), sans
// base de données. Les valeurs stockées sont des codes courts ; les libellés
// ne servent qu'à l'affichage.

export type Option = { value: string; label: string; hint?: string };

export const AGE_RANGES: Option[] = [
  { value: "moins-18", label: "Moins de 18 ans" },
  { value: "18-25", label: "18 – 25 ans" },
  { value: "26-35", label: "26 – 35 ans" },
  { value: "36-plus", label: "36 ans et plus" },
];

export const COUNTRIES: Option[] = [
  "France",
  "Belgique",
  "Suisse",
  "Luxembourg",
  "Canada",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d'Ivoire",
  "Cameroun",
  "Autre pays",
].map((c) => ({ value: c, label: c }));

export const GOALS: Option[] = [
  { value: "licence", label: "Obtenir la licence d'agent", hint: "Préparer l'examen (FFF / FIFA)." },
  { value: "lancer", label: "Me lancer comme agent", hint: "J'ai la licence, ou je l'aurai bientôt." },
  { value: "proche", label: "Accompagner un proche", hint: "Un enfant, un frère, un ami qui joue." },
  { value: "decouvrir", label: "Découvrir le métier", hint: "Je veux comprendre comment ça marche." },
];

export const EXAM_HORIZONS: Option[] = [
  { value: "moins-3-mois", label: "Dans moins de 3 mois" },
  { value: "3-6-mois", label: "Dans 3 à 6 mois" },
  { value: "plus-6-mois", label: "Dans plus de 6 mois" },
  { value: "pas-prevu", label: "Je ne sais pas encore" },
];

export const REFERRAL_SOURCES: Option[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "google", label: "Google" },
  { value: "bouche-a-oreille", label: "Bouche-à-oreille" },
  { value: "club-agent", label: "Un club ou un agent" },
  { value: "autre", label: "Autre" },
];

export const ONBOARDING_STEPS = 3;

const has = (list: Option[], v: string) => list.some((o) => o.value === v);
const clean = (v: FormDataEntryValue | null) => String(v ?? "").replace(/\s+/g, " ").trim();

export type Step1 = { firstName: string; lastName: string; ageRange: string; country: string; region: string };
export type Step2 = { goal: string; examHorizon: string };
export type Step3 = { phone: string; referralSource: string };

type Checked<T> = { ok: true; data: T } | { ok: false; error: string };

// Lettres (tous alphabets), espaces, apostrophes, traits d'union, points.
const NAME_RE = /^[\p{L}][\p{L}\p{M} '’.-]*$/u;

export function checkStep1(f: FormData): Checked<Step1> {
  const firstName = clean(f.get("first_name"));
  const lastName = clean(f.get("last_name"));
  const ageRange = clean(f.get("age_range"));
  const country = clean(f.get("country"));
  const region = clean(f.get("region"));
  if (!firstName || !lastName) return { ok: false, error: "Indique ton prénom et ton nom." };
  if (firstName.length > 60 || lastName.length > 60 || !NAME_RE.test(firstName) || !NAME_RE.test(lastName)) {
    return { ok: false, error: "Ton prénom et ton nom ne doivent contenir que des lettres." };
  }
  if (!has(AGE_RANGES, ageRange)) return { ok: false, error: "Choisis ta tranche d'âge." };
  if (!has(COUNTRIES, country)) return { ok: false, error: "Choisis ton pays." };
  if (region.length > 80) return { ok: false, error: "Ta ville ou ta région est trop longue." };
  return { ok: true, data: { firstName, lastName, ageRange, country, region } };
}

export function checkStep2(f: FormData): Checked<Step2> {
  const goal = clean(f.get("goal"));
  const examHorizon = clean(f.get("exam_horizon"));
  if (!has(GOALS, goal)) return { ok: false, error: "Choisis ton objectif." };
  if (!has(EXAM_HORIZONS, examHorizon)) return { ok: false, error: "Dis-nous quand tu comptes passer l'examen." };
  return { ok: true, data: { goal, examHorizon } };
}

/**
 * Étape facultative. Le téléphone n'est jamais demandé ni gardé pour un
 * élève de moins de 18 ans (minimisation des données).
 */
export function checkStep3(f: FormData, ageRange: string | null): Checked<Step3> {
  const rawPhone = clean(f.get("phone"));
  const referralSource = clean(f.get("referral_source"));
  let phone = "";
  if (rawPhone && ageRange !== "moins-18") {
    const digits = rawPhone.replace(/\D/g, "");
    if (!/^\+?[\d\s.()-]+$/.test(rawPhone) || digits.length < 8 || digits.length > 15) {
      return { ok: false, error: "Ce numéro de téléphone ne semble pas valide." };
    }
    phone = rawPhone;
  }
  if (referralSource && !has(REFERRAL_SOURCES, referralSource)) {
    return { ok: false, error: "Choisis une réponse dans la liste." };
  }
  return { ok: true, data: { phone, referralSource } };
}

/** Étape demandée dans l'URL, ramenée entre 1 et l'étape atteinte. */
export function stepToShow(requested: string | undefined, reached: number): number {
  const n = Number.parseInt(requested ?? "", 10);
  const max = Math.min(Math.max(reached, 1), ONBOARDING_STEPS);
  if (!Number.isFinite(n) || n < 1) return max;
  return Math.min(n, max);
}
