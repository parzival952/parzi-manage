"use client";

import { useEffect, useSyncExternalStore } from "react";

import { parseAuthFragment } from "@/lib/auth-errors";

// Retour du lien de l'e-mail de confirmation Supabase : le résultat arrive dans
// le fragment d'URL (#access_token=… ou #error=…), invisible côté serveur.
// On l'affiche une fois, puis on efface le fragment (il peut contenir un jeton).
// Un lien envoyé avant la page /academy/confirmation (qui connecte directement)
// arrive encore ici avec une session : on le fait suivre là-bas.

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
  const f = parseAuthFragment(hash);
  if (!f) return null;
  if (f.kind === "erreur") {
    return {
      ok: false,
      text: f.expired
        ? "Ce lien de confirmation a expiré ou a déjà été utilisé. Essaie de te connecter : si ton adresse est déjà confirmée, ça fonctionnera."
        : "La confirmation de ton adresse n'a pas abouti. Réessaie de te connecter, ou recrée ton compte.",
    };
  }
  return { ok: true, text: "Adresse e-mail confirmée. Ouverture de ton espace…" };
}

export default function ConfirmationNotice() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const notice = parse(hash);

  useEffect(() => {
    if (!notice || !window.location.hash) return;
    if (parseAuthFragment(window.location.hash)?.kind === "session") {
      window.location.replace(`/academy/confirmation${window.location.hash}`);
      return;
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
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
