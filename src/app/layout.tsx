import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, signOut } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

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

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◧" },
  { href: "/assistant", label: "Assistant ✦", icon: "🤖" },
  { href: "/joueurs", label: "Joueurs", icon: "⚽" },
  { href: "/clubs", label: "Clubs", icon: "🏟" },
  { href: "/scouting", label: "Scouting", icon: "🔭" },
  { href: "/crm", label: "CRM", icon: "👥" },
  { href: "/veille", label: "Veille", icon: "📡" },
  { href: "/calendrier", label: "Calendrier", icon: "📅" },
];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  async function logout() {
    "use server";
    await signOut();
    redirect("/connexion");
  }

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full md:flex">
        {/* ---- Barre latérale (PC) : verre sombre ---- */}
        <aside className="hidden md:flex w-56 shrink-0 bg-[#0e1420]/85 backdrop-blur-xl text-[#d6d9dd] sticky top-0 h-screen flex-col p-4 border-r border-white/10">
          <div className="flex items-center gap-2.5 px-2 pb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white shadow-lg shadow-[#2a78d6]/30">
              P
            </div>
            <div>
              <div className="font-bold text-white text-[15px] leading-tight">Parzi Manage</div>
              <div className="text-[10px] uppercase tracking-widest text-[#8a93a3]">Bêta · MVP</div>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            <NavLinks items={nav} />
          </nav>
          <div className="mt-auto pt-3 border-t border-white/10 px-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#2a78d6] grid place-items-center text-white text-xs font-semibold shrink-0">
                  {(user.email[0] ?? "A").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{user.email}</div>
                  <form action={logout}>
                    <button type="submit" className="text-[10px] text-[#8a93a3] hover:text-white">Se déconnecter</button>
                  </form>
                </div>
              </div>
            ) : (
              <Link href="/connexion" className="text-xs text-[#8a93a3] hover:text-white">Se connecter</Link>
            )}
          </div>
        </aside>

        {/* ---- Colonne principale (mobile : barre du haut + nav défilante) ---- */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden sticky top-0 z-40 bg-[#0e1420]/85 backdrop-blur-xl text-white border-b border-white/10">
            <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white text-sm">
                P
              </div>
              <span className="font-bold text-[15px]">Parzi Manage</span>
              {user && (
                <form action={logout} className="ml-auto">
                  <button type="submit" className="text-[11px] text-[#8a93a3]">Déconnexion</button>
                </form>
              )}
            </div>
            <nav className="flex gap-1 px-3 pb-2 overflow-x-auto whitespace-nowrap [&>a]:shrink-0">
              <NavLinks items={nav} />
            </nav>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
