// Notifications e-mail Parzi Manage — Resend via API REST (pas de SDK).
// Désactivé tant que RESEND_API_KEY n'est pas définie : aucun impact sur le reste.
// Note : avec l'expéditeur par défaut onboarding@resend.dev, Resend n'autorise
// l'envoi QU'À l'adresse du compte Resend — vérifier un domaine pour la bêta élargie.
import { getTodayBrief, getTodayRecommendations, type Recommendation } from "./ai";
import { getNotifiableProfiles, markBriefSent } from "./queries";
import { usePostgres } from "./pg";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Parzi Manage <onboarding@resend.dev>";

export const emailEnabled = () => Boolean(RESEND_KEY);

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_KEY) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

const PRIORITY_COLOR: Record<number, string> = { 5: "#ef4444", 4: "#f59e0b", 3: "#2563eb", 2: "#2563eb", 1: "#64748b" };

/** E-mail du brief du matin — HTML simple, styles inline (compatibilité clients mail). */
export function briefEmailHtml(brief: string, actions: Recommendation[], dateLabel: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = actions.map((a, i) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #e8ebf0;vertical-align:top;width:28px;">
        <div style="width:22px;height:22px;border-radius:50%;background:${PRIORITY_COLOR[a.priority] || "#2563eb"};color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;">${i + 1}</div>
      </td>
      <td style="padding:10px 0 10px 10px;border-top:1px solid #e8ebf0;">
        <div style="font-weight:600;font-size:14px;color:#0f172a;">${esc(a.title)}</div>
        ${a.why ? `<div style="font-size:12.5px;color:#64748b;margin-top:2px;">${esc(a.why)}</div>` : ""}
        <div style="font-size:12px;color:#94a3b8;margin-top:3px;">
          ${a.impact ? `💰 ${esc(a.impact)} · ` : ""}${a.effort ? `⏱ ${esc(a.effort)} · ` : ""}${a.probability ? `🎯 ${esc(a.probability)}` : ""}
        </div>
      </td>
    </tr>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="padding:0 4px 14px;">
        <span style="display:inline-block;width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#2563eb,#4a3aa7);color:#fff;font-weight:700;text-align:center;line-height:28px;font-size:15px;">P</span>
        <span style="font-weight:700;font-size:15px;color:#0f172a;vertical-align:8px;margin-left:8px;">Parzi Manage</span>
        <span style="font-size:12px;color:#94a3b8;vertical-align:8px;margin-left:8px;">${esc(dateLabel)}</span>
      </td></tr>
      <tr><td style="background:#ffffff;border:1px solid #e8ebf0;border-radius:16px;padding:22px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#2563eb;">MISSION DU JOUR</div>
        <div style="font-size:14px;line-height:1.6;color:#334155;margin:10px 0 16px;">${esc(brief)}</div>
        ${actions.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>` : ""}
        <div style="margin-top:18px;">
          <a href="https://parzi-manage-parzi2.vercel.app/dashboard" style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;font-size:13.5px;text-decoration:none;border-radius:10px;padding:10px 18px;">▶ Commencer ma journée</a>
        </div>
      </td></tr>
      <tr><td style="padding:14px 8px;font-size:11px;color:#94a3b8;line-height:1.5;">
        Impacts financiers = estimations IA, à valider par toi. Tu peux désactiver cet e-mail dans Réglages → Notifications.
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

/** Envoi du brief du matin à tous les comptes opt-in (appelé après le cron des briefs). */
export async function sendMorningEmails(): Promise<{ emailed: number }> {
  if (!emailEnabled() || !usePostgres()) return { emailed: 0 };
  const date = new Date().toISOString().slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const profiles = await getNotifiableProfiles(date);
  let emailed = 0;
  for (const p of profiles) {
    const brief = await getTodayBrief(p.user_id);
    if (!brief) continue; // pas de brief généré (compte sans joueurs, IA en erreur…) → rien à envoyer
    const actions = await getTodayRecommendations(p.user_id);
    const ok = await sendEmail(p.email, `☀️ Ton plan du jour — ${actions.length ? actions.length + " actions" : "brief"} Parzi`, briefEmailHtml(brief, actions, dateLabel));
    if (ok) { await markBriefSent(p.user_id, date); emailed++; }
  }
  return { emailed };
}
