export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { aiEnabled, generateTodayBrief, getTodayBrief } from "@/lib/ai";
import SubmitButton from "@/components/SubmitButton";
import { createTask, getAlerts, getEvents, getKpis, getOpportunities, getTasks, toggleTask } from "@/lib/queries";

const sevColor: Record<string, string> = {
  critical: "bg-[#d03b3b]",
  serious: "bg-[#ec835a]",
  warning: "bg-[#fab219]",
  good: "bg-[#0ca30c]",
};
const sevLabel: Record<string, string> = {
  critical: "Urgent",
  serious: "Important",
  warning: "À suivre",
  good: "Bonne nouvelle",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [kpis, alerts, tasks, events, opps, brief] = await Promise.all([
    getKpis(user.id), getAlerts(user.id), getTasks(user.id), getEvents(user.id), getOpportunities(user.id),
    aiEnabled() ? getTodayBrief(user.id) : Promise.resolve(null),
  ]);

  async function makeBrief() {
    "use server";
    const u = await requireUser();
    await generateTodayBrief(u.id);
    revalidatePath("/dashboard");
  }

  async function toggle(formData: FormData) {
    "use server";
    const u = await requireUser();
    await toggleTask(u.id, Number(formData.get("id")));
    revalidatePath("/dashboard");
  }

  async function addTask(formData: FormData) {
    "use server";
    const u = await requireUser();
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    await createTask(u.id, title, String(formData.get("due") ?? "").trim() || "—");
    revalidatePath("/dashboard");
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Bonjour 👋</h1>
      <p className="text-sm text-[#898781] mb-6">
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 mb-4">
        {[
          { label: "Joueurs sous mandat", value: kpis.players },
          { label: "Contrats / mandats à surveiller", value: kpis.expiring },
          { label: "Événements à venir", value: kpis.events },
          { label: "Tâches ouvertes", value: kpis.openTasks },
        ].map((k) => (
          <div key={k.label} className="glass-card p-4">
            <div className="text-xs text-[#52514e]">{k.label}</div>
            <div className="text-2xl font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {aiEnabled() && (
        <section className="glass-card border-l-[3px] border-l-[#2a78d6] p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#2a78d6] bg-[#2a78d6]/10 rounded-full px-2.5 py-0.5">✦ Brief IA du jour</span>
            <form action={makeBrief} className="ml-auto">
              <SubmitButton
                label={brief ? "Régénérer" : "Générer mon brief"}
                pendingLabel="Ton copilote lit tes données…"
                className="text-[12px] text-[#2a78d6] hover:underline"
              />
            </form>
          </div>
          {brief ? (
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{brief}</p>
          ) : (
            <p className="text-[13px] text-[#898781]">
              Clique sur « Générer mon brief » : ton copilote lit tes joueurs, tes échéances et ton agenda, et te donne ta journée en 30 secondes.
              Tu peux aussi lui poser des questions dans l&apos;onglet <Link href="/assistant" className="text-[#2a78d6] hover:underline">Assistant ✦</Link>.
            </p>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 items-start">
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          <section className="glass-card p-4">
            <h2 className="text-[13px] font-semibold text-[#52514e] mb-3">🔔 Alertes</h2>
            {alerts.map((a) => (
              <div key={a.id} className="flex gap-2.5 py-2 border-b border-[#eceae4] last:border-0 items-start">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevColor[a.severity]}`} />
                <div className="text-[13px] leading-snug">
                  <span className="text-[10px] font-bold uppercase tracking-wide mr-1.5 text-[#52514e]">
                    {sevLabel[a.severity]}
                  </span>
                  {a.body}
                  <div className="text-[11px] text-[#898781]">{a.meta}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="glass-card p-4">
            <h2 className="text-[13px] font-semibold text-[#52514e] mb-3">🎯 Opportunités détectées</h2>
            {opps.map((o) => (
              <div key={o.id} className="py-2 border-b border-[#eceae4] last:border-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-[13px]">{o.club}</span>
                  <span className="text-[11px] font-semibold text-[#006300]">Compatibilité {o.fit_pct} %</span>
                </div>
                <div className="text-[12.5px] text-[#52514e] mt-0.5">{o.body}</div>
              </div>
            ))}
          </section>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3.5">
          <section className="glass-card p-4">
            <h2 className="text-[13px] font-semibold text-[#52514e] mb-3">
              ✅ Tâches <span className="text-[#2a78d6] font-medium">· {tasks.filter((t) => !t.is_done).length} restantes</span>
            </h2>
            {tasks.map((t) => (
              <form key={t.id} action={toggle} className="flex items-center gap-2.5 py-1.5 border-b border-[#eceae4] last:border-0">
                <input type="hidden" name="id" value={t.id} />
                <button
                  type="submit"
                  aria-label={t.is_done ? "Marquer à faire" : "Marquer faite"}
                  className={`w-4 h-4 rounded border grid place-items-center text-[10px] ${
                    t.is_done ? "bg-[#2a78d6] border-[#2a78d6] text-white" : "border-[#c3c2b7] bg-white/70"
                  }`}
                >
                  {t.is_done ? "✓" : ""}
                </button>
                <span className={`text-[13px] ${t.is_done ? "line-through text-[#898781]" : ""}`}>{t.title}</span>
                <span className={`ml-auto text-[11px] whitespace-nowrap ${t.is_late && !t.is_done ? "text-[#d03b3b] font-semibold" : "text-[#898781]"}`}>
                  {t.is_late && !t.is_done ? "⚠ " : ""}
                  {t.due_label}
                </span>
              </form>
            ))}
            <form action={addTask} className="flex gap-2 mt-3">
              <input name="title" placeholder="Nouvelle tâche…" required
                className="flex-1 glass-input rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2a78d6]" />
              <input name="due" placeholder="Quand ?"
                className="w-20 glass-input rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:border-[#2a78d6]" />
              <button type="submit" className="bg-[#2a78d6] text-white text-[13px] font-semibold rounded-lg px-3">+</button>
            </form>
          </section>

          <section className="glass-card p-4">
            <h2 className="text-[13px] font-semibold text-[#52514e] mb-3">📅 Agenda</h2>
            {events.map((e) => (
              <div key={e.id} className="flex gap-3 py-1.5 border-b border-[#eceae4] last:border-0">
                <span className="text-[12px] font-semibold text-[#2a78d6] min-w-16 tabular-nums">
                  {e.day_label} {e.time_label}
                </span>
                <div>
                  <div className="text-[13px]">{e.title}</div>
                  <div className="text-[11px] text-[#898781]">{e.location}</div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
