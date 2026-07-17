export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { aiEnabled, askAssistant, clearAiMessages, getAiMessages } from "@/lib/ai";
import SubmitButton from "@/components/SubmitButton";

const SUGGESTIONS = [
  "Qu'est-ce que j'oublie ?",
  "Quelles sont mes priorités cette semaine ?",
  "Quels clubs de mon réseau correspondent à mes joueurs ?",
  "Prépare un message pour approcher une de mes cibles de scouting",
  "Quels contrats ou mandats dois-je surveiller en premier ?",
];

export default async function AssistantPage() {
  const user = await requireUser();
  const enabled = aiEnabled();
  const messages = enabled ? await getAiMessages(user.id) : [];

  async function ask(formData: FormData) {
    "use server";
    const u = await requireUser();
    const q = String(formData.get("q") ?? "").trim();
    if (!q) return;
    await askAssistant(u.id, q);
    revalidatePath("/assistant");
  }

  async function clear() {
    "use server";
    const u = await requireUser();
    await clearAiMessages(u.id);
    revalidatePath("/assistant");
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">✦ Assistant</h1>
          <p className="text-sm text-[#898781] mb-6">Ton copilote — il connaît tes joueurs, tes clubs, tes cibles et ton agenda.</p>
        </div>
        {messages.length > 0 && (
          <form action={clear}>
            <button type="submit" className="text-[12px] text-[#898781] hover:text-[#d03b3b]">Effacer la conversation</button>
          </form>
        )}
      </div>

      {!enabled ? (
        <div className="glass-card p-6 text-center text-[13.5px] text-[#52514e]">
          Le moteur IA n&apos;est pas encore configuré sur ce déploiement (variable <code className="text-[12px] bg-[#f0efec] px-1.5 py-0.5 rounded">ANTHROPIC_API_KEY</code> manquante).
        </div>
      ) : (
        <>
          {messages.length === 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {SUGGESTIONS.map((s) => (
                <form key={s} action={ask}>
                  <input type="hidden" name="q" value={s} />
                  <button type="submit" className="text-[12.5px] border border-black/15 rounded-full px-3.5 py-1.5 bg-white/70 text-[#52514e] hover:border-[#2a78d6] hover:text-[#2a78d6]">
                    {s}
                  </button>
                </form>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-4">
            {messages.length === 0 && (
              <div className="glass-card p-5 text-[13.5px] text-[#52514e]">
                Bonjour 👋 Pose-moi une question sur ton portefeuille, tes clubs ou tes cibles — ou choisis une suggestion ci-dessus.
                Mes réponses s&apos;appuient sur <b>tes</b> données dans Parzi Manage.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "self-end max-w-[80%] bg-[#2a78d6] text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[13.5px] whitespace-pre-wrap"
                    : "self-start max-w-[85%] bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_8px_rgba(16,24,40,0.07)] rounded-bl-md px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            ))}
          </div>

          <form action={ask} className="flex gap-2 sticky bottom-4">
            <input
              name="q" required autoComplete="off"
              placeholder="Pose ta question…"
              className="flex-1 glass-input rounded-xl px-4 py-3 text-[14px] bg-white/70 shadow-sm focus:outline-none focus:border-[#2a78d6]"
            />
            <SubmitButton
              label="Envoyer"
              pendingLabel="Réflexion…"
              className="bg-[#2a78d6] text-white font-semibold text-[14px] rounded-xl px-5 hover:bg-[#2266bb]"
            />
          </form>
          <p className="text-[11px] text-[#898781] mt-3">
            L&apos;assistant peut se tromper — vérifie les points importants, et fais valider tout sujet juridique par un avocat.
          </p>
        </>
      )}
    </div>
  );
}
