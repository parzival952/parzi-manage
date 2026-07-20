// i18n — cœur pur (utilisable serveur ET client, aucune dépendance à next/headers).
// Convention : tout texte visible passe par une clé de messages/*.json.
// Ajouter une langue = ajouter un fichier JSON + l'enregistrer ici. RTL prêt.
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const RTL_LOCALES: Locale[] = []; // ex. "ar" quand on l'ajoutera

const DICTS: Record<Locale, unknown> = { fr, en };

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
export function dirFor(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), dict);
}

/** Traduit une clé pour une locale, avec repli sur la langue par défaut puis la clé brute. Interpole {var}. */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = lookup(DICTS[locale], key) ?? lookup(DICTS[DEFAULT_LOCALE], key);
  if (typeof raw !== "string") return key;
  return vars ? raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : raw;
}
