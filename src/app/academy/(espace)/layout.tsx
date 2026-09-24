import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAcademyHost } from "@/lib/academy-host";
import { getAcademyTheme } from "@/lib/academy-theme";
import { requireUser, signOut } from "@/lib/auth";
import AcademyIcon from "@/components/AcademyIcon";
import AcademyNav from "@/components/AcademyNav";
import HashFocus from "@/components/HashFocus";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  // Sur parziacademy.fr : aucun lien vers Parzi Manage.
  const academyOnly = isAcademyHost((await headers()).get("host"));
  const theme = await getAcademyTheme();

  async function logout() {
    "use server";
    await signOut();
    redirect("/academy/connexion");
  }

  return (
    <div className="parzi" data-theme={theme}>
      <div className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 backdrop-blur-xl" style={{ background: "var(--entete-bg)", borderBottom: "1px solid var(--ligne)" }}>
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2.5">
            <Link href="/academy" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-[10px] grid place-items-center font-black text-white pz-sur-rouge" style={{ background: "linear-gradient(135deg, var(--rouge), var(--rouge-profond))" }}>P</div>
              <div className="leading-tight">
                <div className="font-extrabold text-[15px] tracking-tight">PARZI <span className="pz-red">Academy</span></div>
                <div className="text-[9px] uppercase tracking-[0.22em] pz-muted">Construis ta carrière</div>
              </div>
            </Link>

            <div className="flex-1 flex justify-center">
              <AcademyNav academyOnly={academyOnly} variant="top" />
            </div>

            <Link
              href="/academy/recherche"
              className="w-9 h-9 rounded-xl grid place-items-center pz-muted hover:text-white transition-colors"
              style={{ border: "1px solid var(--ligne)", background: "rgba(var(--ink-rgb),.03)" }}
              aria-label="Rechercher dans l'Academy"
              title="Rechercher"
            >
              <AcademyIcon name="search" size={16} />
            </Link>
            <ThemeToggle />
            {academyOnly ? (
              <form action={logout}>
                <button type="submit" className="text-[12px] pz-muted hover:text-white px-2">Se déconnecter</button>
              </form>
            ) : (
              <Link href="/dashboard" className="text-[12px] pz-muted hover:text-white px-2">Quitter</Link>
            )}
          </div>
        </header>

        <main className="pz-main flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">{children}</main>

        <AcademyNav academyOnly={academyOnly} />
        <HashFocus />
      </div>
    </div>
  );
}
