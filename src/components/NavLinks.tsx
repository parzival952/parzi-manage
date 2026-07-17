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
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors " +
              (active
                ? "bg-[#2a78d6]/20 text-white font-semibold"
                : "text-[#b9bec7] hover:bg-white/5 hover:text-white")
            }
          >
            <span className="w-5 text-center opacity-90">{n.icon}</span> {n.label}
          </Link>
        );
      })}
    </>
  );
}
