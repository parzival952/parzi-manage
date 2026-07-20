// i18n — helpers serveur (lecture du cookie de langue). Import séparé de i18n.ts
// pour que le cœur reste utilisable côté client sans embarquer next/headers.
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, dirFor, isLocale, translate, type Locale } from "./i18n";

export const LOCALE_COOKIE = "pm_locale";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/** À appeler en tête d'un composant serveur : renvoie la locale + une fonction t(). */
export async function getServerT() {
  const locale = await getLocale();
  return {
    locale,
    dir: dirFor(locale),
    t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
  };
}
