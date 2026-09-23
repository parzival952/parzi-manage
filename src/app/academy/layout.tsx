import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAcademyHost } from "@/lib/academy-host";
import { requireUser, signOut } from "@/lib/auth";
import AcademyNav from "@/components/AcademyNav";
import "./academy.css";

export const metadata = { title: "PARZI Academy" };

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  // Sur parziacademy.fr : aucun lien vers Parzi Manage.
  const academyOnly = isAcademyHost((await headers()).get("host"));

  async function logout() {
    "use server";
    await signOut();
    redirect("/connexion");
  }

  return (
    <div className="parzi">
      <div className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 backdrop-blur-xl" style={{ background: "rgba(10,10,12,0.72)", borderBottom: "1px solid var(--ligne)" }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] grid place-items-center font-black text-white" style={{ background: "linear-gradient(135deg, var(--rouge), var(--rouge-profond))" }}>P</div>
            <div className="leading-tight">
              <div className="font-extrabold text-[15px] tracking-tight">PARZI <span className="pz-red">Academy</span></div>
              <div className="text-[9px] uppercase tracking-[0.22em] pz-muted">Construis ta carrière</div>
            </div>
            {academyOnly ? (
              <form action={logout} className="ml-auto">
                <button type="submit" className="text-[12px] pz-muted hover:text-white">Se déconnecter</button>
              </form>
            ) : (
              <Link href="/dashboard" className="ml-auto text-[12px] pz-muted hover:text-white">Quitter</Link>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">{children}</main>

        <AcademyNav academyOnly={academyOnly} />
      </div>
    </div>
  );
}
