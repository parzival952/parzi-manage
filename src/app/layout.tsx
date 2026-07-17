import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, signOut } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parzi Manage",
  description: "Le copilote IA des agents de football",
};

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◧" },
  { href: "/joueurs", label: "Joueurs", icon: "⚽" },
  { href: "/crm", label: "CRM", icon: "👥" },
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
      <body className="min-h-full flex bg-[#f9f9f7] text-[#0b0b0b]">
        <aside className="w-56 shrink-0 bg-[#101418] text-[#d6d9dd] sticky top-0 h-screen flex flex-col p-4">
          <div className="flex items-center gap-2.5 px-2 pb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white">
              P
            </div>
            <div>
              <div className="font-bold text-white text-[15px] leading-tight">Parzi Manage</div>
              <div className="text-[10px] uppercase tracking-widest text-[#7c828a]">Bêta · MVP</div>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 text-sm"
              >
                <span className="w-5 text-center opacity-80">{n.icon}</span> {n.label}
              </Link>
            ))}
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
                    <button type="submit" className="text-[10px] text-[#7c828a] hover:text-white">Se déconnecter</button>
                  </form>
                </div>
              </div>
            ) : (
              <Link href="/connexion" className="text-xs text-[#7c828a] hover:text-white">Se connecter</Link>
            )}
          </div>
        </aside>
        <main className="flex-1 p-8 max-w-6xl">{children}</main>
      </body>
    </html>
  );
}
