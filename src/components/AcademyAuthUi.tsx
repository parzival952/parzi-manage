import type { ReactNode } from "react";

export const authInputClass =
  "w-full rounded-xl px-4 py-3 text-[14.5px] text-white placeholder:text-[color:var(--gris)] focus:outline-none transition-shadow";
export const authInputStyle = { background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)" };

export function AuthMessage({ tone, children }: { tone: "ok" | "erreur"; children: ReactNode }) {
  return (
    <div
      role={tone === "erreur" ? "alert" : "status"}
      className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
      style={
        tone === "ok"
          ? { color: "var(--vert)", background: "rgba(29,185,84,.10)", border: "1px solid rgba(29,185,84,.3)" }
          : { color: "var(--rouge-clair)", background: "rgba(194,24,51,.10)", border: "1px solid rgba(194,24,51,.3)" }
      }
    >
      {children}
    </div>
  );
}
