import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, signIn, signUp } from "@/lib/auth";
import { ensureSeeded, upsertProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

const POINTS = [
  ["✦", "Ton copilote IA lit tes données et prépare ta journée"],
  ["⚽", "Joueurs, mandats, clubs, scouting — tout au même endroit"],
  ["📡", "Veille mercato filtrée sur TON portefeuille"],
];

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ erreur?: string; mode?: string }> }) {
  const { erreur, mode } = await searchParams;
  const user = await getUser();
  if (user) redirect("/dashboard");
  const isSignup = mode === "inscription";

  async function login(formData: FormData) {
    "use server";
    const res = await signIn(String(formData.get("email")), String(formData.get("password")));
    if (!res.ok) redirect(`/connexion?erreur=${encodeURIComponent(res.error)}`);
    const u = await getUser();
    if (u) { await ensureSeeded(u.id); await upsertProfile(u.id, u.email); } // portefeuille démo aussi pour les comptes confirmés par e-mail
    redirect("/dashboard");
  }

  async function register(formData: FormData) {
    "use server";
    const res = await signUp(String(formData.get("email")), String(formData.get("password")));
    if (!res.ok) redirect(`/connexion?mode=inscription&erreur=${encodeURIComponent(res.error)}`);
    const u = await getUser();
    if (u) { await ensureSeeded(u.id); await upsertProfile(u.id, u.email); }
    redirect("/dashboard");
  }

  const input =
    "w-full rounded-xl px-4 py-3 text-[14.5px] bg-white border border-black/10 focus:outline-none focus:border-[#2a78d6] focus:ring-4 focus:ring-[#2a78d6]/10 transition-shadow";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0f0e0b] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---- Panneau de marque (graphite & or) ---- */}
      <div className="relative flex flex-col items-center justify-center text-center px-8 py-10 lg:py-0 lg:min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,164,92,0.14),transparent_60%)] pointer-events-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/parzi-gold.webp"
          alt="PARZI — Global Football Intelligence"
          className="relative w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[520px] rounded-2xl shadow-2xl shadow-black/50"
        />
        <p className="relative mt-6 text-[11px] tracking-[0.28em] uppercase text-[#c9a45c]/90 font-semibold">
          Global Football Intelligence
        </p>
        <div className="relative mt-8 hidden lg:flex flex-col gap-3 text-left">
          {POINTS.map(([icon, txt]) => (
            <div key={txt} className="flex items-center gap-3 text-[13.5px] text-[#d8d3c8]">
              <span className="w-7 h-7 rounded-lg bg-white/5 border border-[#c9a45c]/25 grid place-items-center text-[13px]">{icon}</span>
              {txt}
            </div>
          ))}
        </div>
      </div>

      {/* ---- Panneau formulaire (clair) ---- */}
      <div className="bg-[#f6f7f9] lg:min-h-screen flex items-center justify-center px-5 py-10 rounded-t-3xl lg:rounded-none">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#4a3aa7] grid place-items-center font-bold text-white">P</div>
            <div>
              <div className="font-bold text-[16px] leading-tight text-[#0f172a]">Parzi Manage</div>
              <div className="text-[10px] uppercase tracking-widest text-[#94a3b8]">Command Center</div>
            </div>
          </div>

          <h1 className="font-bold text-[22px] tracking-tight text-[#0f172a] mb-1">
            {isSignup ? "Crée ton espace agent" : "Bon retour 👋"}
          </h1>
          <p className="text-[13.5px] text-[#64748b] mb-6">
            {isSignup
              ? "Gratuit en bêta — ton espace démarre avec un portefeuille de démonstration."
              : "Retrouve ton portefeuille, tes alertes et ta mission du jour."}
          </p>

          {erreur && (
            <div className="text-[13px] text-[#b91c1c] bg-[#ef4444]/8 border border-[#ef4444]/25 rounded-xl px-3.5 py-2.5 mb-4">{erreur}</div>
          )}

          <form action={isSignup ? register : login} className="flex flex-col gap-3">
            <input name="email" type="email" required placeholder="ton@email.com" autoComplete="email" className={input} />
            <input
              name="password" type="password" required minLength={6} autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="Mot de passe (6 caractères min.)" className={input}
            />
            <button
              type="submit"
              className="bg-[#2563eb] hover:bg-[#1d4fd8] text-white font-semibold text-[14.5px] rounded-xl py-3 mt-1 shadow-lg shadow-[#2563eb]/25 transition-colors"
            >
              {isSignup ? "Créer mon compte →" : "Se connecter →"}
            </button>
          </form>

          <p className="text-[13.5px] text-[#64748b] mt-5">
            {isSignup ? (
              <>Déjà un compte ? <Link href="/connexion" className="text-[#2563eb] font-semibold hover:underline">Se connecter</Link></>
            ) : (
              <>Nouveau sur Parzi Manage ? <Link href="/connexion?mode=inscription" className="text-[#2563eb] font-semibold hover:underline">Créer un compte gratuit</Link></>
            )}
          </p>

          <p className="text-[11.5px] text-[#94a3b8] mt-8">
            <Link href="/?apercu=1" className="hover:text-[#64748b]">← Découvrir Parzi Manage</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
