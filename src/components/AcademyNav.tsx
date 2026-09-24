"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AcademyIcon, { type AcademyIconName } from "@/components/AcademyIcon";

type Tab = { href: string; label: string; icon: AcademyIconName; desktopOnly?: boolean };

const TABS: Tab[] = [
  { href: "/academy", label: "Parcours", icon: "bookOpen" },
  { href: "/academy/revision", label: "Révision", icon: "revision", desktopOnly: true },
  { href: "/academy/certifications", label: "Certifications", icon: "cap", desktopOnly: true },
  { href: "/academy/classement", label: "Classement", icon: "trophy" },
  { href: "/academy/profil", label: "Profil", icon: "medal" },
  { href: "/dashboard", label: "Manage", icon: "folder" },
];

function isActive(path: string, href: string) {
  return href === "/academy" ? path === "/academy" : path.startsWith(href);
}

/**
 * Navigation Academy.
 * - variant="bottom" : barre basse (téléphone / tablette, < 1024 px).
 * - variant="top" : liens dans l'en-tête, sur ordinateur (≥ 1024 px).
 */
export default function AcademyNav({
  academyOnly = false,
  variant = "bottom",
}: {
  academyOnly?: boolean;
  variant?: "bottom" | "top";
}) {
  const path = usePathname();
  // Sur parziacademy.fr, pas d'onglet vers Parzi Manage.
  const base = academyOnly ? TABS.filter((t) => !t.href.startsWith("/dashboard")) : TABS;

  if (variant === "top") {
    return (
      <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation Academy">
        {base.map((t) => {
          const active = isActive(path, t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors"
              style={{
                color: active ? "var(--blanc)" : "var(--gris)",
                background: active ? "rgba(var(--ink-rgb),.06)" : "transparent",
              }}
            >
              <AcademyIcon name={t.icon} size={15} style={{ color: active ? "var(--rouge-vif)" : "currentColor" }} />
              {t.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  const tabs = base.filter((t) => !t.desktopOnly);
  return (
    <nav className="pz-nav lg:hidden">
      <div className={"max-w-2xl mx-auto grid " + (tabs.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
        {tabs.map((t) => {
          const active = isActive(path, t.href);
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
