export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import FeatureBanner from "@/components/FeatureBanner";

const PAINS = [
  { emoji: "⏰", title: "Les échéances vous échappent", body: "Fins de mandats, contrats à 12 mois de l'échéance, fenêtres de mercato : tout est dans votre tête — et votre tête est déjà pleine." },
  { emoji: "📰", title: "La veille dévore vos matinées", body: "Transferts, rumeurs, blessures, changements de coach : des heures à scroller chaque jour pour ne rien rater d'important pour vos joueurs." },
  { emoji: "📄", title: "L'administratif vous ralentit", body: "Mandats, dossiers joueurs, factures : chaque document repart de zéro, au détriment du terrain et du relationnel." },
];

const FEATURES = [
  { icon: "✦", title: "Assistant IA personnel", body: "Il connaît VOS joueurs, VOS clubs, VOS cibles — priorités du jour, préparation de négo, conseils concrets." },
  { icon: "⚽", title: "Fiches joueurs complètes", body: "Contrat, salaire, mandat, notes de négo — tout au même endroit, statuts d'urgence automatiques." },
  { icon: "🏟", title: "Clubs & besoins", body: "Votre réseau de clubs avec besoins, budgets et contacts — prêt pour le rapprochement avec vos profils." },
  { icon: "🔭", title: "Scouting ciblé", body: "Suivez vos cibles avant le mandat : poste, âge, fin de contrat, notes — filtres instantanés." },
  { icon: "👥", title: "CRM du réseau", body: "Directeurs sportifs, avocats, scouts, sponsors — chaque contact, son historique, le prochain pas." },
  { icon: "📅", title: "Agenda & alertes", body: "Rendez-vous, matchs, échéances de mandats — plus rien ne passe sous le radar." },
];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ apercu?: string }> }) {
  const { apercu } = await searchParams;
  const user = await getUser();
  // Connecté (ou mode démo local sans auth) → application. ?apercu=1 force l'affichage de la page publique.
  if (user && !apercu) redirect("/dashboard");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0e13] text-[#f4f5f7]">
      {/* Nav */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#0b0e13]/85 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white">P</div>
          <span className="font-bold text-[16px]">Parzi Manage</span>
          <span className="text-[9px] font-bold text-[#9085e9] border border-[#9085e9] rounded px-1.5 py-0.5 tracking-widest">BÊTA</span>
          <div className="ml-auto flex gap-2.5">
            <Link href="/connexion" className="text-[13.5px] text-[#b6bcc8] hover:text-white px-3 py-2">Se connecter</Link>
            <Link href="/connexion?mode=inscription" className="bg-[#3987e5] hover:bg-[#2a78d6] text-white text-[13.5px] font-semibold rounded-lg px-4 py-2">
              Créer mon compte
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-14 relative">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_50%_0%,rgba(42,120,214,0.22),transparent_65%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-block text-[12.5px] font-semibold text-[#9085e9] bg-[#9085e9]/10 border border-[#9085e9]/30 rounded-full px-4 py-1.5 mb-6">
            ✦ Conçu pour les agents de football francophones
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Le copilote IA qui gère votre agence{" "}
            <span className="bg-gradient-to-r from-[#5aa2f5] to-[#9085e9] bg-clip-text text-transparent">pendant que vous négociez</span>
          </h1>
          <p className="text-[17px] text-[#b6bcc8] mt-6 max-w-xl mx-auto">
            Joueurs, mandats, clubs, scouting, agenda : Parzi Manage centralise tout — et son assistant IA vous prépare chaque journée.
            Vous débutez sans joueur ? Il vous aide à décrocher votre premier mandat.
          </p>
          <div className="flex gap-3.5 justify-center mt-8 flex-wrap">
            <Link href="/connexion?mode=inscription" className="bg-[#3987e5] hover:bg-[#2a78d6] text-white font-semibold rounded-xl px-6 py-3">
              Commencer gratuitement →
            </Link>
            <Link href="/connexion" className="border border-white/15 hover:border-white/40 text-[#b6bcc8] hover:text-white font-medium rounded-xl px-6 py-3">
              J&apos;ai déjà un compte
            </Link>
          </div>
          <p className="text-[12px] text-[#7c828a] mt-4">Gratuit en bêta · Votre espace privé démarre avec un portefeuille de démonstration</p>
        </div>
      </section>

      {/* Bannière des fonctionnalités */}
      <FeatureBanner />

      {/* Pains */}
      <section className="bg-[#10141b] border-y border-white/10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Votre agence tourne sur WhatsApp, Excel et votre mémoire</h2>
          <p className="text-center text-[#b6bcc8] mt-2 mb-10">Ça marche… jusqu&apos;au jour où ça coûte un mandat, un transfert ou un joueur.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PAINS.map((p) => (
              <div key={p.title} className="bg-[#151a23] border border-white/10 rounded-2xl p-6">
                <div className="text-2xl mb-3">{p.emoji}</div>
                <h3 className="font-semibold text-[15.5px] mb-1.5">{p.title}</h3>
                <p className="text-[13.5px] text-[#b6bcc8]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Une plateforme, tous vos outils</h2>
          <p className="text-center text-[#b6bcc8] mt-2 mb-10">Simple le jour 1, complète le jour 100 — et déjà utilisable aujourd&apos;hui.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#151a23] border border-white/10 rounded-2xl p-6 hover:border-[#3987e5]/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#3987e5]/12 grid place-items-center text-lg mb-3.5">{f.icon}</div>
                <h3 className="font-semibold text-[15px] mb-1">{f.title}</h3>
                <p className="text-[13px] text-[#b6bcc8]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Débutants */}
      <section className="bg-[#10141b] border-y border-white/10 px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Pas encore de joueurs ? C&apos;est pour vous qu&apos;on a commencé.</h2>
          <p className="text-[#b6bcc8] mt-4 text-[15px]">
            Le moment le plus dur de la carrière d&apos;un agent, c&apos;est le premier mandat. Parzi Manage vous aide à suivre vos cibles,
            préparer vos approches et vous présenter comme un pro dès le premier rendez-vous — gratuitement.
            Des milliers d&apos;agents licenciés n&apos;ont pas de joueurs : votre chance, c&apos;est le travail. On vous équipe.
          </p>
          <Link href="/connexion?mode=inscription" className="inline-block mt-7 bg-[#3987e5] hover:bg-[#2a78d6] text-white font-semibold rounded-xl px-6 py-3">
            Tenter ma chance →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center gap-3 text-[12.5px] text-[#7c828a] flex-wrap">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white text-[11px]">P</div>
          <span><b className="text-[#b6bcc8]">Parzi Manage</b> — le copilote des agents de football</span>
          <span className="ml-auto">© 2026 · Conforme RGPD · Fait avec ⚽ en France</span>
        </div>
      </footer>
    </div>
  );
}
