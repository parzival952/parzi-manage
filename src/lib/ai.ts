// Assistant IA Parzi Manage — appel direct à l'API Anthropic (Messages).
// L'IA reçoit en contexte les données de l'agent connecté : réponses personnalisées.
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { getClubs, getContacts, getEvents, getPlayers, getProspects, getTasks } from "./queries";

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.PARZI_AI_MODEL || "claude-sonnet-5";

export const aiEnabled = () => Boolean(API_KEY);

export type AiMessage = { id: number; role: "user" | "assistant"; content: string };

export async function getAiMessages(uid: string): Promise<AiMessage[]> {
  if (usePostgres()) {
    return (await pg()`SELECT id, role, content FROM ai_messages WHERE user_id = ${uid} ORDER BY id`) as unknown as AiMessage[];
  }
  return db().prepare("SELECT id, role, content FROM ai_messages ORDER BY id").all() as AiMessage[];
}

async function addAiMessage(uid: string, role: "user" | "assistant", content: string): Promise<void> {
  if (usePostgres()) {
    await pg()`INSERT INTO ai_messages (user_id, role, content) VALUES (${uid}, ${role}, ${content})`;
    return;
  }
  db().prepare("INSERT INTO ai_messages (role, content) VALUES (?,?)").run(role, content);
}

export async function clearAiMessages(uid: string): Promise<void> {
  if (usePostgres()) { await pg()`DELETE FROM ai_messages WHERE user_id = ${uid}`; return; }
  db().prepare("DELETE FROM ai_messages").run();
}

/** Construit le contexte métier de l'agent (ses données réelles). */
async function buildContext(uid: string): Promise<string> {
  const [players, clubs, prospects, tasks, events, contacts] = await Promise.all([
    getPlayers(uid), getClubs(uid), getProspects(uid), getTasks(uid), getEvents(uid), getContacts(uid),
  ]);
  const lines: string[] = [];
  lines.push(`## Joueurs sous mandat (${players.length})`);
  for (const p of players) lines.push(`- ${p.name} — ${p.position}, ${p.age} ans, ${p.club}. Contrat: ${p.contract_end}. Valeur est.: ${p.est_value}. Salaire: ${p.salary}. Mandat: ${p.mandate}. Statut: ${p.status_label}. Pied: ${p.strong_foot}, ${p.height}, ${p.nationality}. Notes: ${p.notes || "—"}`);
  lines.push(`\n## Clubs du réseau (${clubs.length})`);
  for (const c of clubs) lines.push(`- ${c.name} (${c.league || "?"}) — besoin: ${c.need || "?"}, budget: ${c.budget || "?"}, contact: ${c.contact_name || "?"}. Notes: ${c.notes || "—"}`);
  lines.push(`\n## Cibles de scouting (${prospects.length})`);
  for (const p of prospects) lines.push(`- ${p.name} — ${p.position || "?"}, ${p.age} ans, ${p.club || "?"} (${p.league || "?"}), fin de contrat: ${p.contract_end || "?"}. Note: ${p.note || "—"}`);
  lines.push(`\n## Tâches ouvertes (${tasks.filter((t) => !t.is_done).length})`);
  for (const t of tasks.filter((t) => !t.is_done)) lines.push(`- ${t.title} (${t.due_label})`);
  lines.push(`\n## Agenda (${events.length})`);
  for (const e of events) lines.push(`- ${e.day_label} ${e.time_label} : ${e.title}${e.location ? " — " + e.location : ""}`);
  lines.push(`\n## Contacts (${contacts.length})`);
  for (const c of contacts) lines.push(`- ${c.name} — ${c.role}, ${c.org}. Dernier échange: ${c.last_exchange}. Prochain pas: ${c.next_step}`);
  return lines.join("\n");
}

const SYSTEM = `Tu es le copilote IA de Parzi Manage, l'assistant des agents de football.
Tu parles français, tu tutoies l'agent, tu es direct, concret et orienté action.

Règles importantes :
- Tu t'appuies UNIQUEMENT sur les données de l'agent fournies en contexte pour parler de SES joueurs, clubs, cibles, tâches et rendez-vous. Tu ne les inventes jamais.
- Pour les connaissances générales du métier (réglementation FIFA/FFF, usages de négociation, structure d'un mandat), tu réponds avec prudence et tu recommandes la validation par un avocat pour tout ce qui est juridique.
- Tu ne connais PAS l'actualité en temps réel (transferts récents, matchs d'hier) : si on te le demande, dis-le honnêtement.
- Pour toute estimation (salaire, valeur), donne une fourchette et rappelle que c'est indicatif.
- Réponses courtes et structurées. Termine quand c'est utile par UNE action concrète que l'agent peut faire dans Parzi Manage.`;

// ---------- Brief du jour ----------

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayBrief(uid: string): Promise<string | null> {
  const date = todayStr();
  if (usePostgres()) {
    const rows = (await pg()`SELECT content FROM daily_briefs WHERE user_id = ${uid} AND brief_date = ${date} ORDER BY id DESC LIMIT 1`) as unknown as { content: string }[];
    return rows[0]?.content ?? null;
  }
  const row = db().prepare("SELECT content FROM daily_briefs WHERE brief_date = ? ORDER BY id DESC LIMIT 1").get(date) as { content: string } | undefined;
  return row?.content ?? null;
}

export async function generateTodayBrief(uid: string): Promise<{ ok: boolean; error?: string }> {
  if (!API_KEY) return { ok: false, error: "Clé API non configurée." };
  const context = await buildContext(uid);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: `${SYSTEM}\n\n# Données actuelles de l'agent\n${context}`,
        messages: [{
          role: "user",
          content: "Rédige mon brief du jour en 4-6 phrases maximum, sans titre ni liste : les 2-3 priorités absolues d'aujourd'hui (échéances, rendez-vous, urgences), puis une opportunité ou un point d'attention. Ton direct, dense, zéro blabla.",
        }],
      }),
    });
    const j = await r.json();
    if (!r.ok) return { ok: false, error: j?.error?.message || "Erreur du service IA." };
    const text = (j.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n") || "";
    const date = todayStr();
    if (usePostgres()) {
      await pg()`DELETE FROM daily_briefs WHERE user_id = ${uid} AND brief_date = ${date}`;
      await pg()`INSERT INTO daily_briefs (user_id, brief_date, content) VALUES (${uid}, ${date}, ${text})`;
    } else {
      db().prepare("DELETE FROM daily_briefs WHERE brief_date = ?").run(date);
      db().prepare("INSERT INTO daily_briefs (brief_date, content) VALUES (?,?)").run(date, text);
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Service IA injoignable." };
  }
}

export async function askAssistant(uid: string, question: string): Promise<{ ok: boolean; error?: string }> {
  if (!API_KEY) return { ok: false, error: "Clé API non configurée." };
  await addAiMessage(uid, "user", question);

  const [context, history] = await Promise.all([buildContext(uid), getAiMessages(uid)]);
  // Historique récent (les 12 derniers messages), le dernier étant la question
  const recent = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: `${SYSTEM}\n\n# Données actuelles de l'agent\n${context}`,
        messages: recent,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      const msg = j?.error?.message || "Erreur du service IA.";
      await addAiMessage(uid, "assistant", `⚠️ ${msg}`);
      return { ok: false, error: msg };
    }
    const text = (j.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n") || "…";
    await addAiMessage(uid, "assistant", text);
    return { ok: true };
  } catch {
    await addAiMessage(uid, "assistant", "⚠️ Le service IA est momentanément injoignable. Réessaie dans un instant.");
    return { ok: false, error: "Service injoignable." };
  }
}
