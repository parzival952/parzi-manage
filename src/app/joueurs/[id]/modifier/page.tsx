import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getPlayer, updatePlayer, deletePlayer } from "@/lib/queries";
import { PlayerFields, playerFromForm } from "@/components/PlayerFields";

export default async function ModifierJoueurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  const user = await requireUser();
  const p = await getPlayer(user.id, playerId);
  if (!p) notFound();

  async function update(formData: FormData) {
    "use server";
    const u = await requireUser();
    await updatePlayer(u.id, playerId, playerFromForm(formData));
    revalidatePath("/joueurs");
    revalidatePath(`/joueurs/${playerId}`);
    revalidatePath("/dashboard");
    redirect(`/joueurs/${playerId}`);
  }

  async function remove() {
    "use server";
    const u = await requireUser();
    await deletePlayer(u.id, playerId);
    revalidatePath("/joueurs");
    revalidatePath("/dashboard");
    redirect("/joueurs");
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/joueurs/${playerId}`} className="text-[13px] text-[#2a78d6] hover:underline">← Retour à la fiche</Link>
      <h1 className="text-xl font-bold mt-3 mb-4">Modifier — {p.name}</h1>
      <form action={update} className="glass-card p-5">
        <PlayerFields p={p} />
        <div className="mt-5 flex gap-3">
          <button type="submit" className="bg-[#2a78d6] text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-[#2266bb]">
            Enregistrer
          </button>
          <Link href={`/joueurs/${playerId}`} className="text-sm text-[#52514e] px-4 py-2.5 hover:underline">Annuler</Link>
        </div>
      </form>
      <form action={remove} className="mt-4">
        <button type="submit" className="text-[13px] text-[#d03b3b] hover:underline">
          Supprimer ce joueur du portefeuille
        </button>
      </form>
    </div>
  );
}
