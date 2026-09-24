"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Après un lien vers un ancrage (#bloc-3, #clause-liberatoire…), fait défiler
 * jusqu'à l'élément et le met en évidence quelques secondes. Nécessaire car la
 * pseudo-classe :target ne suit pas la navigation côté client de Next.js.
 */
export default function HashFocus() {
  const pathname = usePathname();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    function focusHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      el.classList.add("pz-cible-active");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("pz-cible-active"), 4000);
    }

    // Laisse le rendu de la nouvelle page se terminer avant de chercher l'ancre.
    const raf = requestAnimationFrame(() => setTimeout(focusHash, 60));
    window.addEventListener("hashchange", focusHash);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("hashchange", focusHash);
    };
  }, [pathname]);

  return null;
}
