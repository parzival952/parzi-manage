import { cookies } from "next/headers";

// Thème PARZI Academy : nuit (par défaut, identité de la marque) ou clair.
// Mémorisé dans un cookie pour que le serveur rende directement le bon thème
// (aucun flash au chargement).
export type AcademyTheme = "dark" | "light";
export const THEME_COOKIE = "pz_theme";

export async function getAcademyTheme(): Promise<AcademyTheme> {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return value === "light" ? "light" : "dark";
}
