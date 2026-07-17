import { redirect } from "next/navigation";
import { getUser, signIn, signUp } from "@/lib/auth";
import { ensureSeeded } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ erreur?: string; mode?: string }> }) {
  const { erreur, mode } = await searchParams;
  const user = await getUser();
  if (user) redirect("/dashboard");
  const isSignup = mode === "inscription";

  async function login(formData: FormData) {
    "use server";
    const res = await signIn(String(formData.get("email")), String(formData.get("password")));
    if (!res.ok) redirect(`/connexion?erreur=${encodeURIComponent(res.error)}`);
    redirect("/dashboard");
  }

  async function register(formData: FormData) {
    "use server";
    const res = await signUp(String(formData.get("email")), String(formData.get("password")));
    if (!res.ok) redirect(`/connexion?mode=inscription&erreur=${encodeURIComponent(res.error)}`);
    const u = await getUser();
    if (u) await ensureSeeded(u.id);
    redirect("/dashboard");
  }

  const input = "w-full border border-black/15 rounded-lg px-3.5 py-2.5 text-[14px] bg-white focus:outline-none focus:border-[#2a78d6]";

  return (
    <div className="min-h-screen w-full grid place-items-center bg-[#f9f9f7] fixed inset-0 z-50">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white text-lg">P</div>
          <div>
            <div className="font-bold text-[17px] leading-tight">Parzi Manage</div>
            <div className="text-[11px] text-[#898781]">Le copilote des agents de football</div>
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <h1 className="font-bold text-[16px] mb-1">{isSignup ? "Créer ton compte agent" : "Connexion"}</h1>
          <p className="text-[12.5px] text-[#898781] mb-4">
            {isSignup ? "Ton espace démarre avec un portefeuille de démonstration." : "Retrouve ton portefeuille et tes alertes."}
          </p>
          {erreur && (
            <div className="text-[12.5px] text-[#d03b3b] bg-[#d03b3b]/8 border border-[#d03b3b]/25 rounded-lg px-3 py-2 mb-3">{erreur}</div>
          )}
          <form action={isSignup ? register : login} className="flex flex-col gap-2.5">
            <input name="email" type="email" required placeholder="ton@email.com" className={input} />
            <input name="password" type="password" required minLength={6} placeholder="Mot de passe (6 caractères min.)" className={input} />
            <button type="submit" className="bg-[#2a78d6] text-white font-semibold text-[14px] rounded-lg py-2.5 mt-1 hover:bg-[#2266bb]">
              {isSignup ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#52514e] mt-4">
          {isSignup ? (
            <>Déjà un compte ? <a href="/connexion" className="text-[#2a78d6] font-medium hover:underline">Se connecter</a></>
          ) : (
            <>Nouveau sur Parzi Manage ? <a href="/connexion?mode=inscription" className="text-[#2a78d6] font-medium hover:underline">Créer un compte</a></>
          )}
        </p>
      </div>
    </div>
  );
}
