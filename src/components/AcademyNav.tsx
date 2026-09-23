"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AcademyIcon, { type AcademyIconName } from "@/components/AcademyIcon";

const TABS: { href: string; label: string; icon: AcademyIconName }[] = [
  { href: "/academy", label: "Parcours", icon: "bookOpen" },
  { href: "/academy/classement", label: "Classement", icon: "trophy" },
  { href: "/academy/profil", label: "Profil", icon: "medal" },
  { href: "/dashboard", label: "Manage", icon: "folder" },
];

export default function AcademyNav({ academyOnly = false }: { academyOnly?: boolean }) {
  const path = usePathname();
  // Sur parziacademy.fr, pas d'onglet vers Parzi Manage.
  const tabs = academyOnly ? TABS.filter((t) => !t.href.startsWith("/dashboard")) : TABS;
  return (
    <nav className="pz-nav">
      <div className={"max-w-2xl mx-auto grid " + (tabs.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
        {tabs.map((t) => {
          const active = t.href === "/academy" ? path === "/academy" : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className="flex flex-col items-center gap-1 py-3">
              <AcademyIcon name={t.icon} size={19} style={{ color: active ? "var(--rouge-vif)" : "var(--gris)" }} />
              <span className="text-[11px] font-semibold" style={{ color: active ? "var(--blanc)" : "var(--gris)" }}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
