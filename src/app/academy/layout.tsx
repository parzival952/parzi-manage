import type { Metadata } from "next";
import localFont from "next/font/local";

import "./academy.css";

// Polices du design system Academy, auto-hébergées (licence SIL OFL 1.1,
// fichiers issus de Fontsource) : aucune requête vers Google Fonts.
const ui = localFont({
  src: "./fonts/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-ui",
  display: "swap",
});
const titre = localFont({
  src: "./fonts/playfair-display-latin-wght-normal.woff2",
  weight: "400 900",
  variable: "--font-titre",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const chiffres = localFont({
  src: [
    { path: "./fonts/dm-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-chiffres",
  display: "swap",
});

// PARZI Academy — produit autonome. Cette mise en page n'hérite de rien de
// Parzi Manage (seulement de la racine commune minimale). Les pages protégées
// vivent dans (espace)/ ; la connexion Academy est dans connexion/.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.parziacademy.fr"),
  title: {
    absolute: "PARZI Academy — Deviens agent de joueur",
    template: "%s · PARZI Academy",
  },
  description:
    "La formation pour devenir agent de joueur : 45 leçons du cadre juridique à la négociation, révision intelligente, certifications et examen blanc de la licence d'agent.",
  applicationName: "PARZI Academy",
  openGraph: {
    title: "PARZI Academy — Deviens agent de joueur",
    description:
      "45 leçons, révision intelligente, certifications et examen blanc de la licence d'agent.",
    url: "https://www.parziacademy.fr",
    siteName: "PARZI Academy",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function AcademyRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // display:contents — le conteneur ne porte que les variables de police.
  return <div className={`${ui.variable} ${titre.variable} ${chiffres.variable} contents`}>{children}</div>;
}
