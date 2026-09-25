"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { AuthMessage } from "@/components/AcademyAuthUi";
import { parseAuthFragment } from "@/lib/auth-errors";

type Etat =
  | { etat: "lecture" }
  | { etat: "connexion"; accessToken: string; refreshToken: string }
  | { etat: "invalide"; expired: boolean };

// Arrivée depuis le lien de l'e-mail de confirmation : Supabase a confirmé
// l'adresse et place une session dans le fragment d'URL. On la transmet au
// serveur (qui la vérifie et connecte l'élève), puis on efface le fragment de
// la barre d'adresse (il contient un jeton).
export default function EmailConfirmation({
  action,
}: {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
}) {
  const [lien, setLien] = useState<Etat>({ etat: "lecture" });
  const [result, formAction, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);
  const sent = useRef(false);

  useEffect(() => {
    const f = parseAuthFragment(window.location.hash);
    // Lecture unique du fragment au chargement (valeur du navigateur).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLien(
      f?.kind === "session"
        ? { etat: "connexion", accessToken: f.accessToken, refreshToken: f.refreshToken }
        : { etat: "invalide", expired: f?.kind === "erreur" && f.expired },
    );
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Envoi automatique, une seule fois, dès que les jetons sont lus.
  useEffect(() => {
    if (lien.etat === "connexion" && !sent.current) {
      sent.current = true;
      form.current?.requestSubmit();
    }
  }, [lien]);

  if (lien.etat === "lecture") {
    return <p className="text-[13px] pz-muted">Vérification du lien…</p>;
  }

  if (lien.etat === "invalide" || result.error) {
    return (
      <>
        <AuthMessage tone="erreur">
          {result.error ??
            (lien.etat === "invalide" && lien.expired
              ? "Ce lien a expiré ou a déjà servi. Si ton adresse est déjà confirmée, connecte-toi. Sinon, renvoie un e-mail de confirmation."
              : "Ce lien n'est pas valide. Connecte-toi, ou renvoie un e-mail de confirmation.")}
        </AuthMessage>
        <div className="flex flex-col gap-3">
          <Link href="/academy/connexion" className="pz-btn w-full" style={{ padding: "13px 16px" }}>
            Se connecter →
          </Link>
          <Link href="/academy/verifie-ton-email" className="text-[13px] font-bold pz-red hover:underline text-center">
            Renvoyer l&apos;e-mail de confirmation
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthMessage tone="ok">Adresse e-mail confirmée ✓</AuthMessage>
      <form ref={form} action={formAction}>
        <input type="hidden" name="access_token" value={lien.accessToken} />
        <input type="hidden" name="refresh_token" value={lien.refreshToken} />
        <p className="text-[13px] pz-muted inline-flex items-center gap-2" role="status">
          <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {pending ? "Connexion à ton espace…" : "Ouverture de ton espace…"}
        </p>
      </form>
    </>
  );
}
