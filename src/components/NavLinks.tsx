"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ items }: { items: { href: string; label: string; icon: string }[] }) {
  const path = usePathname();
  return (
    <>
      {items.map((n) => {
        const active = path === n.href || path.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            className={
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors " +
              (active
                ? "bg-[#2563eb]/10 text-[#2563eb] font-semibold"
                : "text-[#475569] hover:bg-[#0f172a]/5 hover:text-[#0f172a]")
            }
          >
            <span className="w-5 text-center opacity-90">{n.icon}</span> {n.label}
          </Link>
        );
      })}
    </>
  );
}

/** Navigation mobile fixe en bas — 5 onglets, actions au pouce. */
export function BottomNav() {
  const path = usePathname();
  const tabs = [
    { href: "/dashboard", label: "Dashboard", icon: "◧" },
    { href: "/joueurs", label: "Joueurs", icon: "⚽" },
    { href: "/assistant", label: "IA", icon: "✦", accent: true },
    { href: "/veille", label: "Veille", icon: "📡" },
    { href: "/calendrier", label: "Agenda", icon: "📅" },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/92 backdrop-blur-xl border-t border-[#e8ebf0] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/");
          return (
            <Link key={t.href} href={t.href} className="flex flex-col items-center gap-0.5 py-2">
              <span
                className={
                  "grid place-items-center text-[17px] transition-all " +
                  (t.accent
                    ? "w-11 h-11 -mt-5 rounded-full text-white bg-gradient-to-br from-[#2563eb] to-[#4a3aa7] shadow-lg shadow-[#2563eb]/30"
                    : active
                    ? "text-[#2563eb]"
                    : "text-[#94a3b8]")
                }
              >
                {t.icon}
              </span>
              <span className={"text-[10px] " + (active ? "text-[#2563eb] font-semibold" : "text-[#94a3b8]")}>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
