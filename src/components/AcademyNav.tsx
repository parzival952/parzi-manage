"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/academy", label: "Parcours", icon: "◈" },
  { href: "/academy/profil", label: "Profil", icon: "◆" },
  { href: "/dashboard", label: "Manage", icon: "▤" },
];

export default function AcademyNav() {
  const path = usePathname();
  return (
    <nav className="pz-nav">
      <div className="max-w-2xl mx-auto grid grid-cols-3">
        {TABS.map((t) => {
          const active = t.href === "/academy" ? path === "/academy" : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className="flex flex-col items-center gap-1 py-3">
              <span className="text-[17px]" style={{ color: active ? "var(--rouge)" : "var(--gris)" }}>{t.icon}</span>
              <span className="text-[11px] font-semibold" style={{ color: active ? "var(--blanc)" : "var(--gris)" }}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
