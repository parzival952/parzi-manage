"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { AuthMessage, authInputClass, authInputStyle } from "@/components/AcademyAuthUi";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

type Recovery =
  | { state: "lecture" }
  | { state: "invalide"; message: string }
  | { state: "pret"; accessToken: string; refreshToken: string };

// Lit le fragment d'URL posé par le lien de l'e-mail (#access_token=…&type=recovery
// ou #error_code=otp_expired…), garde les jetons en mémoire puis efface le
// fragment de la barre d'adresse (il contient un jeton).
function readRecovery(): Recovery {
  const hash = window.location.hash;
  if (hash.length < 2) {
    return {
      state: "invalide",
      message: "Ouvre cette page depuis le lien de l'e-mail « Nouveau mot de passe ».",
    };
  }
  const p = new URLSearchParams(hash.slice(1));
  if (p.get("error") || p.get("error_code")) {
    return {
      state: "invalide",
      message:
        p.get("error_code") === "otp_expired"
          ? "Ce lien a expiré ou a déjà servi. Redemande un e-mail ci-dessous."
          : "Ce lien n'est pas valide. Redemande un e-mail ci-dessous.",
    };
  }
  const accessToken = p.get("access_token");
  const refreshToken = p.get("refresh_token");
  if (!accessToken || !refreshToken || p.get("type") !== "recovery") {
    return { state: "invalide", message: "Ce lien n'est pas valide. Redemande un e-mail ci-dessous." };
  }
  return { state: "pret", accessToken, refreshToken };
}

export default function NewPasswordForm({
  action,
}: {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
}) {
  const [recovery, setRecovery] = useState<Recovery>({ state: "lecture" });
  const [result, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    const r = readRecovery();
    // Lecture unique du fragment au chargement (valeur du navigateur).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecovery(r);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  if (recovery.state === "lecture") {
    return <p className="text-[13px] pz-muted">Vérification du lien…</p>;
  }

  if (recovery.state === "invalide") {
    return (
      <>
        <AuthMessage tone="erreur">{recovery.message}</AuthMessage>
        <Link href="/academy/mot-de-passe-oublie" className="pz-btn w-full" style={{ padding: "13px 16px" }}>
          Recevoir un nouveau lien →
        </Link>
      </>
    );
  }

  return (
    <>
      {result.error ? <AuthMessage tone="erreur">{result.error}</AuthMessage> : null}
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="access_token" value={recovery.accessToken} />
        <input type="hidden" name="refresh_token" value={recovery.refreshToken} />
        <input
          name="password"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          placeholder={`Nouveau mot de passe (${PASSWORD_HINT})`}
          aria-label="Nouveau mot de passe"
          className={authInputClass}
          style={authInputStyle}
        />
        <input
          name="confirmation"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          placeholder="Confirme le mot de passe"
          aria-label="Confirme le mot de passe"
          className={authInputClass}
          style={authInputStyle}
        />
        <button type="submit" disabled={pending} className="pz-btn w-full mt-1" style={{ padding: "13px 16px" }}>
          {pending ? "Enregistrement…" : "Enregistrer et me connecter →"}
        </button>
      </form>
    </>
  );
}
