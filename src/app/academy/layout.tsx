import type { Metadata } from "next";

import "./academy.css";

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
  return <>{children}</>;
}
