import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, signOut } from "@/lib/auth";
import NavLinks, { BottomNav } from "@/components/NavLinks";
import Analytics from "@/components/Analytics";
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
  { href: "/competitions", label: "Compétitions", icon: "🏆" },
  { href: "/calendrier", label: "Calendrier", icon: "📅" },
  { href: "/academy", label: "Academy", icon: "🎓" },
  { href: "/parametres", label: "Réglages", icon: "⚙" },
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
        {/* ---- Barre latérale (PC) — claire, façon Linear ---- */}
        <aside className="hidden md:flex w-56 shrink-0 bg-white/70 backdrop-blur-xl sticky top-0 h-screen flex-col p-4 border-r border-[#e8ebf0]">
          <div className="flex items-center gap-2.5 px-2 pb-6">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#2563eb] to-[#4a3aa7] grid place-items-center font-bold text-white shadow-md shadow-[#2563eb]/25">
              P
            </div>
            <div>
              <div className="font-bold text-[#0f172a] text-[15px] leading-tight tracking-tight">Parzi Manage</div>
              <div className="text-[9.5px] uppercase tracking-widest text-[#94a3b8]">Command Center</div>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            <NavLinks items={nav} />
          </nav>
          <div className="mt-auto pt-3 border-t border-[#e8ebf0] px-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563eb] to-[#4a3aa7] grid place-items-center text-white text-xs font-semibold shrink-0">
                  {(user.email[0] ?? "A").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0f172a] truncate">{user.email}</div>
                  <form action={logout}>
                    <button type="submit" className="text-[10px] text-[#94a3b8] hover:text-[#0f172a]">Se déconnecter</button>
                  </form>
                </div>
              </div>
            ) : (
              <Link href="/connexion" className="text-xs text-[#94a3b8] hover:text-[#0f172a]">Se connecter</Link>
            )}
          </div>
        </aside>

        {/* ---- Colonne principale ---- */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barre du haut (mobile) — fine, logo seul */}
          <header className="md:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#e8ebf0]">
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#4a3aa7] grid place-items-center font-bold text-white text-sm">
                P
              </div>
              <span className="font-bold text-[15px] tracking-tight">Parzi Manage</span>
              {user && (
                <form action={logout} className="ml-auto">
                  <button type="submit" className="text-[11px] text-[#94a3b8]">Déconnexion</button>
                </form>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full pb-28 md:pb-8">{children}</main>
        </div>

        {/* ---- Assistant IA flottant ---- */}
        {user && (
          <Link
            href="/assistant"
            title="Parler à ton copilote IA"
            className="ai-float ai-bubble fixed bottom-24 md:bottom-6 right-5 z-50 w-13 h-13 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#2563eb] to-[#4a3aa7] text-white grid place-items-center text-[22px] shadow-xl shadow-[#2563eb]/30 hover:scale-105 transition-transform"
            style={{ width: 52, height: 52 }}
          >
            ✦
          </Link>
        )}

        {/* ---- Navigation mobile (5 onglets) ---- */}
        {user && <BottomNav />}

        <Analytics email={user?.email} />
      </body>
    </html>
  );
}
