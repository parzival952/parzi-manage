// Certifications PARZI Academy — examens surveillés + diplômes numériques vérifiables.
// Réf : academy-systeme-progression.md §11. Avertissement d'intégrité : PARZI certifie
// des COMPÉTENCES, pas la licence officielle d'agent (FFF/FIFA).
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { addBonusXp, chaptersCompleted, COURSE, getProgress } from "./academy";

export type CertQuestion = { q: string; options: string[]; answer: number };

export type Cert = {
  id: string; name: string; subtitle: string; desc: string;
  passScore: number; bonusXp: number;
  prereqLabel: string;
  prereq: (p: { chapters: number; lessons: number; level: number }) => boolean;
  exam: CertQuestion[];
};

export const CERTS: Cert[] = [
  {
    id: "agent-ready",
    name: "Agent Ready",
    subtitle: "Fondamentaux du métier d'agent",
    desc: "Valide ta maîtrise des bases du métier : rôle, réglementation, mandat, approche et négociation. La première pierre de ta carrière.",
    passScore: 75, bonusXp: 500,
    prereqLabel: "Terminer les 2 chapitres du parcours « Devenir agent »",
    prereq: (p) => p.chapters >= COURSE.chapters.length,
    exam: [
      { q: "Quelle est la mission première d'un agent ?", options: ["Toucher une commission sur chaque transfert", "Gérer et protéger la carrière de son client dans la durée", "Trouver le salaire le plus élevé à court terme"], answer: 1 },
      { q: "Sur quoi repose la relation agent-joueur ?", options: ["Le contrat", "La confiance", "La notoriété"], answer: 1 },
      { q: "Comment obtient-on traditionnellement une licence d'agent ?", options: ["En payant une cotisation", "En réussissant un examen", "Par recommandation"], answer: 1 },
      { q: "Concernant les joueurs mineurs, la réglementation est :", options: ["Souple", "Inexistante", "Stricte et protectrice"], answer: 2 },
      { q: "Qu'est-ce qu'un mandat exclusif ?", options: ["Le joueur peut avoir plusieurs agents", "Seul cet agent représente le joueur sur la période", "Un contrat avec un club"], answer: 1 },
      { q: "Pourquoi suivre l'échéance d'un mandat à l'avance ?", options: ["Pour augmenter sa commission", "Pour ne pas risquer de perdre son client", "Ce n'est pas important"], answer: 1 },
      { q: "D'où vient souvent le premier joueur d'un agent ?", options: ["D'un club de Ligue 1", "De divisions inférieures ou de son réseau local", "D'un transfert international"], answer: 1 },
      { q: "Qu'est-ce qu'un « point de rupture » en négociation ?", options: ["Le moment où on s'énerve", "Le seuil en dessous duquel on refuse l'accord", "La commission de l'agent"], answer: 1 },
    ],
  },
];

export function findCert(id: string): Cert | undefined {
  return CERTS.find((c) => c.id === id);
}

export type EarnedCert = { cert_id: string; score: number; code: string; created_at: string };

export async function getMyCerts(uid: string): Promise<Map<string, EarnedCert>> {
  const map = new Map<string, EarnedCert>();
  if (usePostgres()) {
    const rows = (await pg()`SELECT cert_id, score, code, created_at::text AS created_at FROM certifications WHERE user_id = ${uid}`) as unknown as EarnedCert[];
    for (const r of rows) map.set(r.cert_id, r);
  } else {
    const rows = db().prepare("SELECT cert_id, score, code, created_at FROM certifications WHERE user_id = ?").all(uid) as EarnedCert[];
    for (const r of rows) map.set(r.cert_id, r);
  }
  return map;
}

/** Prérequis remplis pour passer l'examen ? */
export async function canTakeCert(uid: string, cert: Cert): Promise<boolean> {
  const p = await getProgress(uid);
  return cert.prereq({ chapters: chaptersCompleted(p.done), lessons: p.done.size, level: p.info.level });
}

function genCode(): string {
  const y = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PZ-${y}-${rand}`;
}

export type ExamResult = { pass: boolean; already: boolean; score: number; code?: string; bonusXp?: number };

/** Soumet un examen : enregistre la certification si réussie (idempotent), donne le bonus XP. */
export async function submitExam(uid: string, certId: string, score: number): Promise<ExamResult> {
  const cert = findCert(certId);
  if (!cert) return { pass: false, already: false, score };
  const existing = await getMyCerts(uid);
  if (existing.has(certId)) {
    return { pass: true, already: true, score, code: existing.get(certId)!.code };
  }
  if (score < cert.passScore) return { pass: false, already: false, score };

  const code = genCode();
  if (usePostgres()) {
    await pg()`INSERT INTO certifications (user_id, cert_id, score, code) VALUES (${uid}, ${certId}, ${score}, ${code})
      ON CONFLICT (user_id, cert_id) DO NOTHING`;
  } else {
    db().prepare("INSERT OR IGNORE INTO certifications (user_id, cert_id, score, code) VALUES (?,?,?,?)").run(uid, certId, score, code);
  }
  await addBonusXp(uid, cert.bonusXp);
  return { pass: true, already: false, score, code, bonusXp: cert.bonusXp };
}
