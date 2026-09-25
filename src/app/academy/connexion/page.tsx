export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import ConfirmationNotice from "@/components/ConfirmationNotice";
import SubmitButton from "@/components/SubmitButton";
import { LESSON_COUNT } from "@/lib/academy-course";
import { CONFIRMATION_PATH, academyEmailRedirect, rememberPendingEmail } from "@/lib/academy-signup";
import { getAcademyTheme } from "@/lib/academy-theme";
import { getUser, signIn, signUp } from "@/lib/auth";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, passwordProblem } from "@/lib/password-policy";
import ThemeToggle from "@/components/ThemeToggle";
import { getProfile, setPath, upsertProfile } from "@/lib/queries";
import AcademyIcon, { type AcademyIconName } from "@/components/AcademyIcon";

export const metadata = { title: "Connexion" };

const POINTS: [AcademyIconName, string][] = [
  ["cap", `${LESSON_COUNT} leçons pour devenir agent de joueur, du cadre juridique à la fiscalité`],
  ["revision", "Révision intelligente : ton carnet d'erreurs et tes points faibles"],
  ["medal", "Certifications et examen blanc de la licence d'agent"],
];

// Connexion / inscription propres à PARZI Academy : aucune donnée de
// démonstration Parzi Manage n'est créée ; le profil est marqué « aspirant ».
// Même compte que Parzi Manage (même base) — un apprenant devenu agent
// retrouvera son compte dans Manage.
export default async function AcademyConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; info?: string; mode?: string }>;
}) {
  const { erreur, info, mode } = await searchParams;
  if (await getUser()) redirect("/academy");
  const isSignup = mode === "inscription";

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const res = await signIn(email, String(formData.get("password")));
    if (!res.ok) {
      // Adresse pas encore confirmée : on propose de renvoyer l'e-mail.
      if (res.unconfirmed) {
        await rememberPendingEmail(email);
        redirect("/academy/verifie-ton-email?non-confirme=1");
      }
      redirect(`/academy/connexion?erreur=${encodeURIComponent(res.error)}`);
    }
    const u = await getUser();
    if (u) {
      await upsertProfile(u.id, u.email);
      // Compte confirmé par e-mail : le parcours n'a pas pu être posé à
      // l'inscription → on le pose à la première connexion Academy
      // (sans jamais écraser un compte agent).
      const profile = await getProfile(u.id);
      if (!profile?.path) await setPath(u.id, "aspirant");
    }
    redirect("/academy");
  }

  async function register(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const problem = passwordProblem(String(formData.get("password") ?? ""));
    if (problem) redirect(`/academy/connexion?mode=inscription&erreur=${encodeURIComponent(problem)}`);
    // Le lien de confirmation ramène sur parziacademy.fr/academy/confirmation,
    // qui connecte l'élève directement.
    const res = await signUp(email, String(formData.get("password")), await academyEmailRedirect(CONFIRMATION_PATH));
    if (res.status === "erreur") {
      redirect(`/academy/connexion?mode=inscription&erreur=${encodeURIComponent(res.error)}`);
    }
    if (res.status === "a-confirmer") {
      // Compte créé, e-mail de confirmation parti : ce n'est pas une erreur.
      await rememberPendingEmail(email);
      redirect("/academy/verifie-ton-email");
    }
    const u = await getUser();
    if (u) {
      await upsertProfile(u.id, u.email);
      await setPath(u.id, "aspirant");
    }
    redirect("/academy");
  }

  const theme = await getAcademyTheme();

  const input =
    "w-full rounded-xl px-4 py-3 text-[14.5px] text-white placeholder:text-[color:var(--gris)] focus:outline-none transition-shadow";
  const inputStyle = { background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)" };

  return (
    <div className="parzi" data-theme={theme}>
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="min-h-full flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[920px] grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* ---- Présentation ---- */}
          <section className="pz-rise">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[12px] grid place-items-center font-black text-white pz-sur-rouge text-[18px]"
                style={{ background: "linear-gradient(135deg, var(--rouge), var(--rouge-profond))" }}
              >
                P
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-[19px] tracking-tight">
                  PARZI <span className="pz-red">Academy</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] pz-muted">Construis ta carrière</div>
              </div>
            </div>

            <h1 className="text-[28px] sm:text-[34px] font-black tracking-tight leading-tight mt-8">
              Deviens agent de joueur.
              <br />
              <span className="pz-red">Pour de vrai.</span>
            </h1>
            <p className="text-[14px] leading-6 pz-muted mt-3 max-w-[440px]">
              La formation complète, du cadre juridique à la négociation, pensée par des gens du
              métier — avec un moteur de révision qui travaille tes points faibles.
            </p>

            <div className="flex flex-col gap-3 mt-7">
              {POINTS.map(([icon, txt]) => (
                <div key={txt} className="flex items-center gap-3 text-[13.5px]" style={{ color: "var(--texte-2)" }}>
                  <span
                    className="w-8 h-8 rounded-lg grid place-items-center text-[14px] shrink-0"
                    style={{ background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)" }}
                  >
                    <AcademyIcon name={icon} size={15} style={{ color: "var(--argent)" }} />
                  </span>
                  {txt}
                </div>
              ))}
            </div>
            <Link href="/academy/decouvrir" className="inline-flex mt-6 text-[13px] font-bold pz-red hover:underline">
              Découvrir la formation · module 1 offert →
            </Link>
          </section>

          {/* ---- Formulaire ---- */}
          <section className="pz-card p-6 sm:p-8 pz-rise pz-d1">
            <h2 className="text-[22px] font-black tracking-tight">
              {isSignup ? "Crée ton compte" : "Bon retour"}
            </h2>
            <p className="text-[13px] pz-muted mt-1 mb-6">
              {isSignup
                ? "Gratuit — ta progression est sauvegardée."
                : "Reprends ta formation là où tu l'as laissée."}
            </p>

            <ConfirmationNotice />
            {erreur ? (
              <div
                className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
                style={{ color: "var(--rouge-clair)", background: "rgba(194,24,51,.10)", border: "1px solid rgba(194,24,51,.3)" }}
              >
                {erreur}
              </div>
            ) : null}
            {info ? (
              <div
                className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
                style={{ color: "var(--vert)", background: "rgba(29,185,84,.10)", border: "1px solid rgba(29,185,84,.3)" }}
              >
                {info}
              </div>
            ) : null}

            <form action={isSignup ? register : login} className="flex flex-col gap-3">
              <input
                name="email"
                type="email"
                required
                placeholder="ton@email.com"
                autoComplete="email"
                className={input}
                style={inputStyle}
              />
              <input
                name="password"
                type="password"
                required
                minLength={isSignup ? PASSWORD_MIN_LENGTH : 6}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={isSignup ? `Mot de passe (${PASSWORD_HINT})` : "Mot de passe"}
                className={input}
                style={inputStyle}
              />
              <SubmitButton
                label={isSignup ? "Créer mon compte →" : "Se connecter →"}
                pendingLabel={isSignup ? "Création du compte…" : "Connexion…"}
                className="pz-btn w-full mt-1"
                style={{ padding: "13px 16px" }}
              />
            </form>

            {!isSignup ? (
              <p className="text-[12.5px] mt-3 text-right">
                <Link href="/academy/mot-de-passe-oublie" className="pz-muted hover:underline">
                  Mot de passe oublié ?
                </Link>
              </p>
            ) : null}

            {isSignup ? (
              <p className="text-[12px] pz-muted mt-3 leading-5">
                Tes données servent uniquement à ta formation.{" "}
                <Link href="/academy/confidentialite" className="font-bold hover:underline">
                  Confidentialité
                </Link>
              </p>
            ) : null}

            <p className="text-[13px] pz-muted mt-5">
              {isSignup ? (
                <>
                  Déjà un compte ?{" "}
                  <Link href="/academy/connexion" className="font-bold pz-red hover:underline">
                    Se connecter
                  </Link>
                </>
              ) : (
                <>
                  Nouveau sur PARZI Academy ?{" "}
                  <Link href="/academy/connexion?mode=inscription" className="font-bold pz-red hover:underline">
                    Créer un compte gratuit
                  </Link>
                </>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
