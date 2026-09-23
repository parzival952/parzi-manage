export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { getUser, signIn, signUp } from "@/lib/auth";
import { setPath, upsertProfile } from "@/lib/queries";

export const metadata = { title: "Connexion" };

const POINTS = [
  ["🎓", "45 leçons pour devenir agent de joueur, du cadre juridique à la négociation"],
  ["🧠", "Révision intelligente : ton carnet d'erreurs et tes points faibles"],
  ["🏅", "Certifications et examen blanc de la licence d'agent"],
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
    const res = await signIn(String(formData.get("email")), String(formData.get("password")));
    if (!res.ok) redirect(`/academy/connexion?erreur=${encodeURIComponent(res.error)}`);
    const u = await getUser();
    if (u) await upsertProfile(u.id, u.email);
    redirect("/academy");
  }

  async function register(formData: FormData) {
    "use server";
    const res = await signUp(String(formData.get("email")), String(formData.get("password")));
    if (!res.ok) {
      // « Compte créé — confirme ton adresse e-mail… » n'est pas une erreur.
      const key = res.error.startsWith("Compte créé") ? "info" : "erreur";
      redirect(`/academy/connexion?mode=${key === "info" ? "" : "inscription"}&${key}=${encodeURIComponent(res.error)}`);
    }
    const u = await getUser();
    if (u) {
      await upsertProfile(u.id, u.email);
      await setPath(u.id, "aspirant");
    }
    redirect("/academy");
  }

  const input =
    "w-full rounded-xl px-4 py-3 text-[14.5px] text-white placeholder:text-[#6b7079] focus:outline-none transition-shadow";
  const inputStyle = { background: "rgba(255,255,255,.04)", border: "1px solid var(--ligne)" };

  return (
    <div className="parzi">
      <div className="min-h-full flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[920px] grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* ---- Présentation ---- */}
          <section className="pz-rise">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[12px] grid place-items-center font-black text-white text-[18px]"
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
                <div key={txt} className="flex items-center gap-3 text-[13.5px]" style={{ color: "#D8DADF" }}>
                  <span
                    className="w-8 h-8 rounded-lg grid place-items-center text-[14px] shrink-0"
                    style={{ background: "rgba(255,255,255,.04)", border: "1px solid var(--ligne)" }}
                  >
                    {icon}
                  </span>
                  {txt}
                </div>
              ))}
            </div>
          </section>

          {/* ---- Formulaire ---- */}
          <section className="pz-card p-6 sm:p-8 pz-rise pz-d1">
            <h2 className="text-[22px] font-black tracking-tight">
              {isSignup ? "Crée ton compte" : "Bon retour 👋"}
            </h2>
            <p className="text-[13px] pz-muted mt-1 mb-6">
              {isSignup
                ? "Gratuit — ta progression est sauvegardée."
                : "Reprends ta formation là où tu l'as laissée."}
            </p>

            {erreur ? (
              <div
                className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
                style={{ color: "#ff8b95", background: "rgba(228,0,43,.10)", border: "1px solid rgba(228,0,43,.3)" }}
              >
                {erreur}
              </div>
            ) : null}
            {info ? (
              <div
                className="text-[13px] rounded-xl px-3.5 py-2.5 mb-4"
                style={{ color: "#8CF3AD", background: "rgba(29,185,84,.10)", border: "1px solid rgba(29,185,84,.3)" }}
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
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="Mot de passe (6 caractères min.)"
                className={input}
                style={inputStyle}
              />
              <button type="submit" className="pz-btn w-full mt-1" style={{ padding: "13px 16px" }}>
                {isSignup ? "Créer mon compte →" : "Se connecter →"}
              </button>
            </form>

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
