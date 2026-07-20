"use client";
import { createContext, useContext } from "react";
import { translate, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

const Ctx = createContext<Locale>(DEFAULT_LOCALE);

/** Ne rend aucun DOM (Context.Provider) : n'affecte pas la mise en page. */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

/** Hook de traduction pour les composants client. */
export function useT() {
  const locale = useContext(Ctx);
  return (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
}

export function useLocale() {
  return useContext(Ctx);
}
