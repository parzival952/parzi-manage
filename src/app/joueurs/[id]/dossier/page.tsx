import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { aiEnabled, generatePitch } from "@/lib/ai";
import { getPlayer } from "@/lib/queries";
import PrintButton from "@/components/PrintButton";
import SubmitButton from "@/components/SubmitButton";

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  const user = await requireUser();
  const p = await getPlayer(user.id, playerId);
  if (!p) notFound();

  async function makePitch() {
    "use server";
    const u = await requireUser();
    await generatePitch(u.id, playerId);
    revalidatePath(`/joueurs/${playerId}/dossier`);
  }

  const attrs: [string, string][] = [
    ["Poste", p.position],
    ["Âge", `${p.age} ans`],
    ["Taille", p.height],
    ["Pied fort", p.strong_foot],
    ["Nationalité", p.nationality],
    ["Club actuel", p.club],
    ["Fin de contrat", p.contract_end],
    ["Valeur estimée", p.est_value],
  ];

  return (
    <div className="max-w-2xl">
      <div className="no-print flex items-center gap-3 mb-5 flex-wrap">
        <Link href={`/joueurs/${playerId}`} className="text-[13px] text-[#2a78d6] hover:underline">← Retour à la fiche</Link>
        <div className="ml-auto flex gap-2.5">
          {aiEnabled() && (
            <form action={makePitch}>
              <SubmitButton
                label={p.pitch ? "✦ Régénérer l'argumentaire IA" : "✦ Générer l'argumentaire IA"}
                pendingLabel="Rédaction en cours…"
                className="glass-input rounded-lg text-[13.5px] font-medium px-4 py-2 hover:border-[#2a78d6] text-[#2a78d6]"
              />
            </form>
          )}
          <PrintButton />
        </div>
      </div>

      {/* ---- Le document ---- */}
      <div className="glass-card p-8 print:p-10">
        <div className="flex items-center gap-3 pb-5 border-b border-black/10 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2a78d6] to-[#4a3aa7] grid place-items-center font-bold text-white">P</div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#7a8291]">Dossier joueur</div>
            <div className="text-[12.5px] text-[#51586a]">Présenté par {user.email === "demo@parzi.local" ? "votre agent" : user.email}</div>
          </div>
          <div className="ml-auto text-[11px] text-[#7a8291]">
            {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">{p.name}</h1>
        <p className="text-[15px] text-[#51586a] mt-1 mb-7">{p.position} · {p.club}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {attrs.map(([k, v]) => (
            <div key={k} className="bg-white/60 border border-white/70 rounded-xl px-3.5 py-2.5 print:border-[#e2e6ec]">
              <div className="text-[10.5px] uppercase tracking-wide text-[#7a8291]">{k}</div>
              <div className="text-[14px] font-semibold mt-0.5">{v || "—"}</div>
            </div>
          ))}
        </div>

        {p.pitch ? (
          <div className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#2a78d6] mb-2.5">Présentation</h2>
            <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{p.pitch}</p>
          </div>
        ) : (
          <div className="no-print mb-6 text-[13px] text-[#7a8291] bg-white/50 border border-white/70 rounded-xl p-4">
            {aiEnabled()
              ? "Clique sur « Générer l'argumentaire IA » : le copilote rédige la présentation du joueur à partir de sa fiche — tu pourras la régénérer autant que tu veux."
              : "L'argumentaire IA sera disponible quand le moteur IA sera configuré."}
          </div>
        )}

        <div className="pt-5 border-t border-black/10 flex items-center justify-between text-[11px] text-[#7a8291]">
          <span>Document confidentiel — destiné aux clubs et recruteurs</span>
          <span className="font-semibold">Généré avec Parzi Manage ⚽</span>
        </div>
      </div>
    </div>
  );
}
