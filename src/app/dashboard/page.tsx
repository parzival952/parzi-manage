export const dynamic = "force-dynamic";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { aiEnabled, generateTodayBrief, getTodayBrief } from "@/lib/ai";
import { createTask, getAlerts, getEvents, getKpis, getOpportunities, getPlayers, getTasks, toggleTask } from "@/lib/queries";
import { getVeille, matchesPortfolio, portfolioKeywords } from "@/lib/veille";
import SubmitButton from "@/components/SubmitButton";

const sevColor: Record<string, string> = {
  critical: "bg-[#ef4444]", serious: "bg-[#f59e0b]", warning: "bg-[#f59e0b]", good: "bg-[#10b981]",
};

function timeAgo(d: Date | null): string {
  if (!d) return "";
  const mins = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.round(mins / 60);
  return h < 24 ? `il y a ${h} h` : `il y a ${Math.round(h / 24)} j`;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [kpis, alerts, tasks, events, opps, players, brief, veille] = await Promise.all([
    getKpis(user.id), getAlerts(user.id), getTasks(user.id), getEvents(user.id),
    getOpportunities(user.id), getPlayers(user.id),
    aiEnabled() ? getTodayBrief(user.id) : Promise.resolve(null),
    getVeille().catch(() => ({ items: [], sourcesOk: 0, sourcesTotal: 0 })),
  ]);

  // --- Agency Health Score (calculé sur les vraies données) ---
  const urgent = players.filter((p) => p.status === "urgent").length;
  const soon = players.filter((p) => p.status === "soon").length;
  const ok = players.filter((p) => p.status === "ok").length;
  const lateTasks = tasks.filter((t) => t.is_late && !t.is_done).length;
  const score = Math.max(35, Math.min(99, 96 - urgent * 14 - soon * 3 - lateTasks * 5));
  const scoreLabel = score >= 85 ? "Excellent" : score >= 70 ? "Solide" : score >= 55 ? "À surveiller" : "Sous tension";
  const scoreColor = score >= 85 ? "#10b981" : score >= 70 ? "#2563eb" : score >= 55 ? "#f59e0b" : "#ef4444";

  // --- « Pendant ton absence » (vrais compteurs) ---
  const kws = portfolioKeywords(players, []);
  const veilleItems = veille.items.map((n) => ({ ...n, mine: matchesPortfolio(n.title, kws) }));
  const mineCount = veilleItems.filter((n) => n.mine).length;

  // --- Joueurs prioritaires (les 3 plus urgents) ---
  const priority = players.slice(0, 3);

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
  async function makeBrief() {
    "use server";
    const u = await requireUser();
    await generateTodayBrief(u.id);
    revalidatePath("/dashboard");
  }

  // --- Agenda intelligent (timeline) ---
  const bucket = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("aujourd")) return "Aujourd'hui";
    if (l.includes("demain")) return "Demain";
    return "Cette semaine";
  };
  const agendaBuckets = ["Aujourd'hui", "Demain", "Cette semaine"] as const;

  return (
    <div>
      {/* ================= HEADER — le rapport de l'IA ================= */}
      <div className="anim-rise d1 mb-5">
        <h1 className="text-[22px] font-bold tracking-tight">Bonjour 👋</h1>
        <p className="text-[13.5px] text-[#475569] mt-1.5 leading-relaxed">
          Pendant ton absence, <span className="font-semibold text-[#2563eb]">Parzi AI</span> a analysé{" "}
          <b>{veille.items.length || "les"} actualités mercato</b>
          {mineCount > 0 && <> — dont <b className="text-[#2563eb]">{mineCount} concernent ton portefeuille</b></>},
          surveillé <b>{kpis.expiring} échéance{kpis.expiring > 1 ? "s" : ""}</b> de contrats et mandats,
          et suit <b>{opps.length} opportunité{opps.length > 1 ? "s" : ""}</b> pour tes joueurs.
        </p>
      </div>

      {/* ================= MISSION DU JOUR + HEALTH SCORE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Mission du jour — LA carte principale */}
        <section className="glass-card card-hover anim-rise d2 lg:col-span-2 p-6 border-l-[3px] border-l-[#2563eb] relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#2563eb]/5 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-white bg-gradient-to-r from-[#2563eb] to-[#4a3aa7] rounded-full px-3 py-1 tracking-wide">
              ✦ MISSION DU JOUR
            </span>
            {aiEnabled() && (
              <form action={makeBrief} className="ml-auto">
                <SubmitButton
                  label={brief ? "Actualiser" : "Générer"}
                  pendingLabel="L'IA lit tes données…"
                  className="text-[12px] text-[#2563eb] hover:underline font-medium"
                />
              </form>
            )}
          </div>
          {brief ? (
            <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{brief}</p>
          ) : (
            <p className="text-[13.5px] text-[#475569] leading-relaxed">
              Ton copilote lit tes joueurs, tes échéances, ton agenda et le marché — puis t&apos;écrit ton plan de bataille du jour.
              {aiEnabled() ? " Clique sur « Générer » (et chaque matin à 8h, il sera prêt avant ton café)." : ""}
            </p>
          )}
          <a
            href="#taches"
            className="inline-block mt-4 bg-[#2563eb] hover:bg-[#1d4fd7] text-white font-semibold text-[13.5px] rounded-xl px-5 py-2.5 shadow-md shadow-[#2563eb]/25 transition-colors"
          >
            ▶ Commencer ma journée
          </a>
        </section>

        {/* Agency Health Score */}
        <section className="glass-card card-hover anim-rise d3 p-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-3">Agency Health</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[44px] font-extrabold tracking-tight leading-none" style={{ color: scoreColor }}>{score}</span>
            <span className="text-[15px] text-[#94a3b8] font-medium">/100</span>
            <span className="ml-auto text-[12.5px] font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-[#eef1f5] mt-3.5 mb-4 overflow-hidden">
            <div className="progress-bar h-full rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)` }} />
          </div>
          <div className="flex flex-col gap-1.5 text-[12.5px]">
            <div className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> {ok} contrat{ok > 1 ? "s" : ""} sous contrôle</div>
            {soon > 0 && <div className="flex items-center gap-2"><span className="text-[#f59e0b]">⚠</span> {soon} contrat{soon > 1 ? "s" : ""} expire{soon > 1 ? "nt" : ""} bientôt</div>}
            {urgent > 0 && <div className="flex items-center gap-2"><span className="text-[#ef4444]">●</span> {urgent} urgence{urgent > 1 ? "s" : ""} mandat</div>}
            <div className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> {tasks.filter((t) => !!t.is_done).length} tâche{tasks.filter((t) => !!t.is_done).length > 1 ? "s" : ""} bouclée{tasks.filter((t) => !!t.is_done).length > 1 ? "s" : ""}</div>
            {lateTasks > 0 && <div className="flex items-center gap-2"><span className="text-[#ef4444]">●</span> {lateTasks} tâche{lateTasks > 1 ? "s" : ""} en retard</div>}
          </div>
        </section>
      </div>

      {/* ================= OPPORTUNITÉS IA ================= */}
      {opps.length > 0 && (
        <section className="anim-rise d4 mb-4">
          <div className="flex items-baseline gap-2 mb-2.5 px-1">
            <h2 className="text-[15px] font-bold tracking-tight">🎯 Opportunités détectées</h2>
            <span className="text-[12px] text-[#94a3b8]">le marché, croisé avec tes joueurs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {opps.slice(0, 4).map((o) => {
              const prio = o.fit_pct >= 85 ? { t: "Priorité haute", c: "#10b981" } : o.fit_pct >= 75 ? { t: "Priorité moyenne", c: "#2563eb" } : { t: "À explorer", c: "#94a3b8" };
              return (
                <div key={o.id} className="glass-card card-hover p-5">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 text-[#10b981] grid place-items-center font-bold text-[15px]">
                      {o.club.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[14px] truncate">{o.club}</div>
                      <div className="text-[11px] font-semibold" style={{ color: prio.c }}>{prio.t}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-[19px] font-extrabold text-[#10b981] leading-none">{o.fit_pct}%</div>
                      <div className="text-[9.5px] uppercase tracking-wide text-[#94a3b8]">compatibilité</div>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-[#475569] leading-relaxed mb-3">{o.body}</p>
                  <Link href="/clubs" className="text-[12.5px] font-semibold text-[#2563eb] hover:underline">
                    Contacter le club →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= JOUEURS PRIORITAIRES + TIMELINE LIVE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Joueurs prioritaires */}
          <section className="anim-rise d5">
            <div className="flex items-baseline gap-2 mb-2.5 px-1">
              <h2 className="text-[15px] font-bold tracking-tight">⚽ Joueurs prioritaires</h2>
              <Link href="/joueurs" className="ml-auto text-[12px] text-[#2563eb] font-medium hover:underline">Tout le portefeuille →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {priority.map((p) => {
                const st = p.status === "urgent" ? { c: "#ef4444", bg: "#ef4444" } : p.status === "soon" ? { c: "#b45309", bg: "#f59e0b" } : { c: "#047857", bg: "#10b981" };
                return (
                  <Link key={p.id} href={`/joueurs/${p.id}`} className="glass-card card-hover p-4 block">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb]/15 to-[#4a3aa7]/15 text-[#2563eb] grid place-items-center font-bold text-[14px]">
                        {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[13.5px] truncate">{p.name}</div>
                        <div className="text-[11px] text-[#94a3b8] truncate">{p.position}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-[11.5px] text-[#475569]">
                      <div className="flex justify-between"><span className="text-[#94a3b8]">Contrat</span><b>{p.contract_end}</b></div>
                      <div className="flex justify-between"><span className="text-[#94a3b8]">Valeur</span><b>{p.est_value}</b></div>
                    </div>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10.5px] font-bold rounded-full px-2.5 py-1" style={{ color: st.c, background: `${st.bg}18` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.bg }} /> {p.status_label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Tâches */}
          <section id="taches" className="glass-card anim-rise d6 p-5 scroll-mt-6">
            <h2 className="text-[13px] font-bold tracking-tight mb-3">
              ✅ Plan d&apos;action <span className="text-[#2563eb] font-semibold">· {tasks.filter((t) => !t.is_done).length} restante{tasks.filter((t) => !t.is_done).length > 1 ? "s" : ""}</span>
            </h2>
            {tasks.map((t) => (
              <form key={t.id} action={toggle} className="flex items-center gap-2.5 py-1.5 border-b border-[#f0f2f5] last:border-0">
                <input type="hidden" name="id" value={t.id} />
                <button
                  type="submit"
                  aria-label={t.is_done ? "Marquer à faire" : "Marquer faite"}
                  className={`w-[18px] h-[18px] rounded-md border grid place-items-center text-[10px] transition-colors ${
                    t.is_done ? "bg-[#2563eb] border-[#2563eb] text-white" : "border-[#cbd2dc] bg-white hover:border-[#2563eb]"
                  }`}
                >
                  {t.is_done ? "✓" : ""}
                </button>
                <span className={`text-[13px] ${t.is_done ? "line-through text-[#94a3b8]" : ""}`}>{t.title}</span>
                <span className={`ml-auto text-[11px] whitespace-nowrap ${t.is_late && !t.is_done ? "text-[#ef4444] font-bold" : "text-[#94a3b8]"}`}>
                  {t.is_late && !t.is_done ? "⚠ " : ""}{t.due_label}
                </span>
              </form>
            ))}
            <form action={addTask} className="flex gap-2 mt-3">
              <input name="title" placeholder="Nouvelle action…" required className="glass-input flex-1 rounded-lg px-3 py-1.5 text-[13px]" />
              <input name="due" placeholder="Quand ?" className="glass-input w-20 rounded-lg px-2 py-1.5 text-[12px]" />
              <button type="submit" className="bg-[#2563eb] text-white text-[13px] font-semibold rounded-lg px-3.5">+</button>
            </form>
          </section>
        </div>

        {/* Timeline Live */}
        <section className="glass-card anim-rise d6 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[13px] font-bold tracking-tight">⚡ Timeline live</h2>
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
          </div>
          <div className="flex flex-col">
            {alerts.slice(0, 3).map((a, i) => (
              <div key={`a${a.id}`} className={`anim-rise d${Math.min(i + 2, 8)} flex gap-2.5 py-2 border-b border-[#f0f2f5] items-start`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevColor[a.severity]}`} />
                <div>
                  <div className="text-[12.5px] leading-snug">{a.body}</div>
                  <div className="text-[10.5px] text-[#94a3b8] mt-0.5">{a.meta}</div>
                </div>
              </div>
            ))}
            {veilleItems.slice(0, 5).map((n, i) => (
              <a key={`v${i}`} href={n.link} target="_blank" rel="noopener noreferrer"
                className={`anim-rise d${Math.min(i + 4, 8)} flex gap-2.5 py-2 border-b border-[#f0f2f5] last:border-0 items-start hover:text-[#2563eb]`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.mine ? "bg-[#2563eb]" : "bg-[#cbd2dc]"}`} />
                <div>
                  <div className="text-[12.5px] leading-snug">
                    {n.mine && <span className="text-[9px] font-bold text-white bg-[#2563eb] rounded px-1.5 py-0.5 mr-1 align-middle">PORTEFEUILLE</span>}
                    {n.title}
                  </div>
                  <div className="text-[10.5px] text-[#94a3b8] mt-0.5">{n.source} · {timeAgo(n.date)}</div>
                </div>
              </a>
            ))}
          </div>
          <Link href="/veille" className="block text-[12px] text-[#2563eb] font-medium hover:underline mt-3">Toute la veille →</Link>
        </section>
      </div>

      {/* ================= AGENDA INTELLIGENT ================= */}
      <section className="glass-card anim-rise d7 p-5 mb-2">
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="text-[13px] font-bold tracking-tight">📅 Agenda intelligent</h2>
          <Link href="/calendrier" className="ml-auto text-[12px] text-[#2563eb] font-medium hover:underline">Gérer →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {agendaBuckets.map((b) => {
            const evs = events.filter((e) => bucket(e.day_label) === b);
            return (
              <div key={b}>
                <div className={`text-[10.5px] font-bold uppercase tracking-widest mb-2 ${b === "Aujourd'hui" ? "text-[#2563eb]" : "text-[#94a3b8]"}`}>{b}</div>
                {evs.length === 0 ? (
                  <div className="text-[12px] text-[#cbd2dc]">—</div>
                ) : (
                  evs.map((e) => (
                    <div key={e.id} className="flex gap-2.5 py-1.5 items-start">
                      <span className="text-[11.5px] font-bold text-[#2563eb] min-w-11 tabular-nums">{e.time_label}</span>
                      <div>
                        <div className="text-[12.5px] leading-snug">{e.title}</div>
                        <div className="text-[10.5px] text-[#94a3b8]">{e.location}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
