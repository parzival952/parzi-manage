"use client";

import AcademyIcon from "@/components/AcademyIcon";

const COOKIE = "pz_theme"; // même nom que THEME_COOKIE (src/lib/academy-theme.ts)

/**
 * Bascule mode nuit / mode clair. Le thème est porté par l'attribut
 * data-theme du conteneur .parzi ; l'icône affichée dépend du thème via le
 * CSS (.pz-si-nuit / .pz-si-clair), sans état React (pas d'écart d'hydratation).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const root = event.currentTarget.closest(".parzi");
    if (!root) return;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`w-9 h-9 rounded-xl grid place-items-center pz-muted hover:text-white transition-colors ${className}`}
      style={{ border: "1px solid var(--ligne)", background: "rgba(var(--ink-rgb),.03)" }}
      aria-label="Changer de thème (clair / nuit)"
      title="Mode clair / mode nuit"
    >
      <span className="pz-si-nuit">
        <AcademyIcon name="moon" size={16} />
      </span>
      <span className="pz-si-clair">
        <AcademyIcon name="sun" size={16} />
      </span>
    </button>
  );
}
