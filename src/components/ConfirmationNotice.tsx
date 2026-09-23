"use client";

import { useEffect, useSyncExternalStore } from "react";

// Retour du lien de l'e-mail de confirmation Supabase : le résultat arrive dans
// le fragment d'URL (#access_token=… ou #error=…), invisible côté serveur.
// On l'affiche une fois, puis on efface le fragment (il peut contenir un jeton).

// Dernier fragment non vide vu : le message reste affiché après l'effacement
// du fragment dans la barre d'adresse.
let captured = "";
const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => {
  if (window.location.hash.length > 1) captured = window.location.hash;
  return captured;
};

function parse(hash: string): { ok: boolean; text: string } | null {
  if (!hash || hash.length < 2) return null;
  const p = new URLSearchParams(hash.slice(1));
  if (p.get("error") || p.get("error_code")) {
    const expired = p.get("error_code") === "otp_expired";
    return {
      ok: false,
      text: expired
        ? "Ce lien de confirmation a expiré ou a déjà été utilisé. Essaie de te connecter : si ton adresse est déjà confirmée, ça fonctionnera."
        : "La confirmation de ton adresse n'a pas abouti. Réessaie de te connecter, ou recrée ton compte.",
    };
  }
  if (p.get("access_token") || p.get("type") === "signup") {
    return { ok: true, text: "Adresse e-mail confirmée. Connecte-toi pour commencer ta formation." };
  }
  return null;
}

export default function ConfirmationNotice() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const notice = parse(hash);

  useEffect(() => {
    if (notice && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [notice]);

  if (!notice) return null;
  return (
    <div
      role="status"
      className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
      style={
        notice.ok
          ? { color: "var(--vert)", background: "rgba(29,185,84,.10)", border: "1px solid rgba(29,185,84,.3)" }
          : { color: "var(--rouge-clair)", background: "rgba(194,24,51,.10)", border: "1px solid rgba(194,24,51,.3)" }
      }
    >
      {notice.text}
    </div>
  );
}
