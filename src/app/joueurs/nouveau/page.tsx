import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createPlayer } from "@/lib/queries";
import { PlayerFields, playerFromForm } from "@/components/PlayerFields";

export const dynamic = "force-dynamic";

export default async function NouveauJoueurPage() {
  await requireUser();

  async function create(formData: FormData) {
    "use server";
    const u = await requireUser();
    await createPlayer(u.id, playerFromForm(formData));
    revalidatePath("/joueurs");
    revalidatePath("/dashboard");
    redirect("/joueurs");
  }

  return (
    <div className="max-w-2xl">
      <Link href="/joueurs" className="text-[13px] text-[#2a78d6] hover:underline">← Retour aux joueurs</Link>
      <h1 className="text-xl font-bold mt-3 mb-4">Ajouter un joueur</h1>
      <form action={create} className="glass-card p-5">
        <PlayerFields />
        <div className="mt-5 flex gap-3">
          <button type="submit" className="bg-[#2a78d6] text-white font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-[#2266bb]">
            Ajouter le joueur
          </button>
          <Link href="/joueurs" className="text-sm text-[#52514e] px-4 py-2.5 hover:underline">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
