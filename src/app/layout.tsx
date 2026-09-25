import type { Metadata } from "next";

import Analytics from "@/components/Analytics";
import { I18nProvider } from "@/components/I18nProvider";
import { dirFor } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import "./globals.css";

// Racine COMMUNE et minimale : document HTML, langue, statistiques.
// Chaque produit a ensuite sa propre mise en page :
//   - Parzi Manage   → src/app/(manage)/layout.tsx
//   - PARZI Academy  → src/app/academy/layout.tsx (+ (espace)/layout.tsx)
// Les métadonnées par défaut sont celles de Manage ; l'Academy les remplace.
export const metadata: Metadata = {
  metadataBase: new URL("https://parzi-manage-parzi2.vercel.app"),
  title: { default: "Parzi Manage — le copilote IA des agents de football", template: "%s · Parzi Manage" },
  description:
    "Joueurs, mandats, clubs, scouting, veille mercato : Parzi Manage centralise tout — et son assistant IA prépare chaque journée de l'agent. Gratuit en bêta.",
  openGraph: {
    title: "Parzi Manage — le copilote IA des agents de football",
    description: "Gérez vos joueurs, trouvez vos cibles, et laissez l'IA préparer vos journées. Gratuit en bêta.",
    url: "https://parzi-manage-parzi2.vercel.app",
    siteName: "Parzi Manage",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={dirFor(locale)} className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider locale={locale}>
          {children}
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  );
}
