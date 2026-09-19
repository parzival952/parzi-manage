// Certifications PARZI Academy — examens surveillés + diplômes numériques vérifiables.
// Réf : academy-systeme-progression.md §11. Avertissement d'intégrité : PARZI certifie
// des COMPÉTENCES, pas la licence officielle d'agent (FFF/FIFA).
//
// Échelle de certifications (parcours PARZI) :
//   Agent Ready → Agent Confirmé → Agent Expert
// + un « Examen blanc — Licence d'agent » : simulation complète, dans l'esprit de
//   l'examen officiel, pour s'entraîner en conditions (minuteur).
//
// La CORRECTION est faite CÔTÉ SERVEUR (server action de la page examen) : le client
// n'envoie que ses réponses (indices), jamais son score. La clé (`answer`) vit ici,
// dans un module serveur, et n'est jamais transmise au navigateur.
//
// Chaque question porte un `domain` (compétence) → l'examen produit un BILAN PAR
// COMPÉTENCE (gradeExam) qui dit à l'apprenant quoi réviser.
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { addBonusXp, chaptersCompleted, COURSE, getProgress, ATTR_DEFS } from "./academy";
import type { AttrKey } from "./academy";

export type CertQuestion = { q: string; options: string[]; answer: number; domain?: AttrKey };

/** Contexte évalué pour débloquer une certification. */
export type CertCtx = { chapters: number; lessons: number; level: number; earned: Set<string> };

/** Score obtenu sur une compétence lors d'un examen (pour le bilan). */
export type DomainScore = { key: AttrKey; label: string; correct: number; total: number; pct: number };

export type Cert = {
  id: string; name: string; subtitle: string; desc: string;
  passScore: number; bonusXp: number;
  durationMin?: number;
  prereqLabel: string;
  prereq: (p: CertCtx) => boolean;
  exam: CertQuestion[];
};

const ALL_CHAPTERS = COURSE.chapters.length;

export const CERTS: Cert[] = [
  {
    id: "agent-ready",
    name: "Agent Ready",
    subtitle: "Fondamentaux & cadre du métier",
    desc: "Valide les bases : le rôle réel de l'agent, l'écosystème du football, la déontologie et le cadre juridique. La première pierre de ta carrière.",
    passScore: 75, bonusXp: 500, durationMin: 10,
    prereqLabel: "Terminer les 2 premiers chapitres (Fondamentaux · Cadre juridique)",
    prereq: (p) => p.chapters >= 2,
    exam: [
      { q: "Quelle est la mission première d'un agent de joueur ?", options: ["Toucher une commission sur chaque transfert", "Gérer et protéger la carrière de son client dans la durée", "Obtenir le salaire le plus élevé à court terme"], answer: 1, domain: "MGT" },
      { q: "Sur quoi se construit — et se détruit — la relation agent-joueur ?", options: ["Le contrat signé", "La confiance", "La notoriété de l'agent"], answer: 1, domain: "MGT" },
      { q: "Quelle instance chapeaute le football au niveau mondial ?", options: ["L'UEFA", "La FIFA", "La FFF"], answer: 1, domain: "JUR" },
      { q: "Dans un club, quel est l'interlocuteur clé de l'agent sur l'aspect sportif ?", options: ["Le directeur sportif / la cellule recrutement", "Le service communication", "Le président, et lui seul"], answer: 0, domain: "BUS" },
      { q: "Quand se fait l'essentiel du vrai travail d'un agent ?", options: ["Uniquement pendant le mercato", "Entre les mercatos, pour préparer les coups", "Le jour des matchs"], answer: 1, domain: "BUS" },
      { q: "Comment obtient-on traditionnellement une licence d'agent ?", options: ["En payant une cotisation annuelle", "En réussissant un examen", "Par simple recommandation d'un club"], answer: 1, domain: "JUR" },
      { q: "Un plafond de commission cité dans un vieux document a peut-être changé. Le bon réflexe ?", options: ["Se fier au document tel quel", "Vérifier le texte FFF/FIFA en vigueur", "Demander de mémoire à un confrère"], answer: 1, domain: "JUR" },
      { q: "Que dit la réglementation sur les transferts internationaux de joueurs mineurs ?", options: ["Ils sont libres", "Ils sont interdits par principe, sauf exceptions strictement définies", "Ils sont interdits sans aucune exception possible"], answer: 1, domain: "JUR" },
      { q: "Un club propose à ton joueur de 19 ans un gros contrat… mais sur le banc, sans temps de jeu. Que fais-tu ?", options: ["Tu signes : la commission est belle", "Tu évalues l'impact sur sa progression et tu oses refuser si ça casse sa carrière", "Tu le laisses décider seul, sans avis"], answer: 1, domain: "MGT" },
      { q: "Sur une même opération, peux-tu être rémunéré à la fois par le club et par le joueur ?", options: ["Oui, toujours", "Non — c'est un conflit d'intérêts, sauf transparence et accord explicite des parties", "Oui, tant que personne ne le sait"], answer: 1, domain: "JUR" },
    ],
  },
  {
    id: "agent-confirme",
    name: "Agent Confirmé",
    subtitle: "Contrats, détection & négociation",
    desc: "Tu maîtrises les mandats et les contrats, tu sais détecter et évaluer un joueur, et tu tiens une négociation. Le niveau d'un agent qui travaille pour de vrai.",
    passScore: 80, bonusXp: 800, durationMin: 12,
    prereqLabel: "Obtenir « Agent Ready » et terminer 6 chapitres",
    prereq: (p) => p.chapters >= 6 && p.earned.has("agent-ready"),
    exam: [
      { q: "Qu'est-ce qu'un mandat exclusif ?", options: ["Le joueur peut mandater plusieurs agents en même temps", "Seul cet agent représente le joueur sur la période convenue", "Un contrat conclu directement avec un club"], answer: 1, domain: "JUR" },
      { q: "Pourquoi anticiper l'échéance d'un mandat bien avant son terme ?", options: ["Pour augmenter mécaniquement sa commission", "Pour ne pas risquer de perdre son client au renouvellement", "Ce n'est pas important"], answer: 1, domain: "MGT" },
      { q: "Un mandat de représentation doit être :", options: ["Verbal, la confiance suffit", "Écrit, daté et signé, avec les mentions obligatoires", "Conclu uniquement entre agents"], answer: 1, domain: "JUR" },
      { q: "À quoi sert une clause libératoire dans un contrat de joueur ?", options: ["À fixer le salaire minimum", "À fixer le montant qui permet de déclencher le départ du joueur", "À interdire tout transfert"], answer: 1, domain: "JUR" },
      { q: "Qu'est-ce qu'un pourcentage à la revente (sell-on) ?", options: ["Une prime de signature", "Une part reversée au club (ou à l'agent) d'origine sur un futur transfert", "Une taxe fédérale"], answer: 1, domain: "JUR" },
      { q: "Sur le plafond de commission applicable, le réflexe professionnel est de :", options: ["Appliquer un chiffre entendu entre confrères", "Vérifier le plafond en vigueur, sachant qu'il est mouvant et contesté", "Ignorer la question"], answer: 1, domain: "JUR" },
      { q: "Quelle est la meilleure prévention des litiges ?", options: ["Tout formaliser par écrit dès le départ", "Régler les choses à l'oral pour aller plus vite", "Éviter d'aborder les points qui fâchent"], answer: 0, domain: "JUR" },
      { q: "En détection, faut-il se fier uniquement aux statistiques d'un joueur ?", options: ["Oui, les chiffres ne mentent pas", "Non — il faut croiser data, œil du terrain et contexte", "Non — seul l'œil compte, jamais la data"], answer: 1, domain: "SCO" },
      { q: "Évaluer sérieusement un joueur, c'est regarder :", options: ["Uniquement le physique", "Technique, physique, mental, projection et contexte", "Uniquement le nombre de buts"], answer: 1, domain: "SCO" },
      { q: "Premier contact avec un jeune joueur et sa famille : quelle posture ?", options: ["Promettre monts et merveilles pour convaincre vite", "Rester éthique, respecter le cadre et ne pas survendre", "Contourner la famille pour aller plus vite"], answer: 1, domain: "MGT" },
      { q: "Qu'appelle-t-on le « point de rupture » en négociation ?", options: ["Le moment où l'on hausse le ton", "Le seuil en dessous duquel on refuse l'accord", "Le montant de la commission de l'agent"], answer: 1, domain: "NEG" },
      { q: "Dernier jour du mercato, le club te presse de conclure sous le plancher que tu avais préparé à froid. Que fais-tu ?", options: ["Tu cèdes, l'urgence l'exige", "Tu t'en tiens au plancher fixé à froid", "Tu improvises un chiffre encore plus bas"], answer: 1, domain: "NEG" },
    ],
  },
  {
    id: "agent-expert",
    name: "Agent Expert",
    subtitle: "Maîtrise complète du métier",
    desc: "Business, réseau, finances, méthode : tu couvres tout le spectre du métier, cas complexes et pièges déontologiques inclus. Le sommet du parcours PARZI.",
    passScore: 85, bonusXp: 1200, durationMin: 14,
    prereqLabel: "Obtenir « Agent Confirmé » et terminer les 8 chapitres",
    prereq: (p) => p.chapters >= ALL_CHAPTERS && p.earned.has("agent-confirme"),
    exam: [
      { q: "Les revenus d'un agent sont par nature :", options: ["Fixes et réguliers", "Variables et irréguliers — à provisionner", "Garantis par la fédération"], answer: 1, domain: "BUS" },
      { q: "Comment circulent les règles dans la hiérarchie du football ?", options: ["Des clubs vers la FIFA", "De la FIFA vers les fédérations, puis les clubs", "Chaque club fixe ses propres règles"], answer: 1, domain: "JUR" },
      { q: "Négocier un transfert, c'est une négociation :", options: ["À deux (agent et club)", "Multi-parties : club acheteur, club vendeur et joueur", "Uniquement entre les deux clubs"], answer: 1, domain: "NEG" },
      { q: "En négociation, montrer qu'on est pressé de conclure est :", options: ["Une force", "Une erreur qui affaiblit ta position", "Sans effet"], answer: 1, domain: "NEG" },
      { q: "Qu'est-ce que l'« ancrage » en négociation ?", options: ["Poser en premier une référence qui cadre la discussion", "Refuser catégoriquement de parler chiffres", "Attendre systématiquement la dernière minute"], answer: 0, domain: "NEG" },
      { q: "La marque personnelle et l'image d'un joueur, c'est :", options: ["Un gadget secondaire", "Un actif à construire tôt et à protéger", "Uniquement l'affaire du club"], answer: 1, domain: "BUS" },
      { q: "Le bon timing d'un transfert se décide d'abord selon :", options: ["La seule offre la plus élevée", "La progression sportive et le projet de carrière", "Le calendrier des sponsors"], answer: 1, domain: "MGT" },
      { q: "Structurer proprement son activité d'agent, c'est :", options: ["Travailler au noir tant que l'activité est petite", "Choisir un statut, tenir une comptabilité et être en conformité", "Ne s'occuper que du sportif"], answer: 1, domain: "BUS" },
      { q: "Les premiers clients d'un agent viennent le plus souvent :", options: ["De la Ligue 1", "Des divisions inférieures et du réseau local", "De transferts internationaux"], answer: 1, domain: "BUS" },
      { q: "Dans ce métier, la réputation se construit surtout sur :", options: ["La parole tenue, dans la durée", "Le nombre d'abonnés en ligne", "Les coups médiatiques"], answer: 0, domain: "BUS" },
      { q: "Face à des revenus irréguliers, la bonne gestion consiste à :", options: ["Tout dépenser quand l'argent rentre", "Provisionner les impôts et se constituer une trésorerie", "Ne rien anticiper"], answer: 1, domain: "BUS" },
      { q: "Un club veut glisser une clause clairement défavorable à ton joueur. Que fais-tu ?", options: ["Tu la laisses passer pour conclure vite", "Tu la repères, tu l'expliques à ton joueur et tu la renégocies ou refuses", "Tu signes sans la lire"], answer: 1, domain: "JUR" },
      { q: "Les plafonds de commission et certaines règles « agents » :", options: ["Sont gravés dans le marbre", "Évoluent et font l'objet de contentieux — d'où la veille", "N'existent pas"], answer: 1, domain: "JUR" },
      { q: "Un confrère te propose une rétro-commission occulte pour lui « prêter » un joueur sous ton mandat. Ta réponse ?", options: ["Accepter, c'est courant", "Refuser : c'est contraire à la déontologie et à la loi", "Accepter si la somme est importante"], answer: 1, domain: "JUR" },
    ],
  },
  {
    id: "licence-blanche",
    name: "Examen blanc — Licence d'agent",
    subtitle: "Simulation de l'examen officiel",
    desc: "Un examen complet qui balaie tout le programme, dans l'esprit de l'examen officiel d'agent (FFF/FIFA). Entraîne-toi en conditions avant le vrai jour. Rappel : PARZI certifie des compétences, pas la licence officielle.",
    passScore: 70, bonusXp: 1500, durationMin: 20,
    prereqLabel: "Terminer les 8 chapitres du programme",
    prereq: (p) => p.chapters >= ALL_CHAPTERS,
    exam: [
      { q: "Le cœur du métier d'agent, c'est :", options: ["Encaisser un maximum de commissions", "Gérer et défendre la carrière d'un client dans la durée", "Être proche des présidents de clubs"], answer: 1, domain: "MGT" },
      { q: "Instance mondiale / instance européenne du football :", options: ["FFF / UEFA", "FIFA / UEFA", "UEFA / FIFA"], answer: 1, domain: "JUR" },
      { q: "Un mandat de représentation est valablement conclu quand il est :", options: ["Écrit, signé, daté, avec les mentions obligatoires", "Promis oralement entre gens de confiance", "Annoncé publiquement sur les réseaux"], answer: 0, domain: "JUR" },
      { q: "Transferts internationaux de mineurs :", options: ["Autorisés librement", "Interdits par principe, sauf exceptions strictement définies", "Autorisés partout dès 15 ans"], answer: 1, domain: "JUR" },
      { q: "Un plafond de commission t'est présenté comme « la règle ». Tu :", options: ["L'appliques sans vérifier", "Vérifies le texte en vigueur, car ces plafonds sont mouvants et contestés", "L'ignores complètement"], answer: 1, domain: "JUR" },
      { q: "La meilleure arme contre les litiges est :", options: ["Un bon avocat, une fois le litige né", "L'écrit, en amont", "La discrétion sur les points sensibles"], answer: 1, domain: "JUR" },
      { q: "En détection, la bonne méthode combine :", options: ["Seulement les statistiques", "Data, œil du terrain et contexte", "Seulement la réputation du joueur"], answer: 1, domain: "SCO" },
      { q: "Le « point de rupture » en négociation, c'est :", options: ["Le seuil sous lequel tu refuses l'accord", "Le moment où tu t'énerves", "Le montant de ta commission"], answer: 0, domain: "NEG" },
      { q: "Négocier un transfert implique de gérer :", options: ["Un seul interlocuteur", "Plusieurs parties aux intérêts différents (clubs + joueur)", "Uniquement le joueur"], answer: 1, domain: "NEG" },
      { q: "Montrer au club adverse que tu es pressé de signer :", options: ["Renforce ta position", "Affaiblit ta position", "N'a aucun impact"], answer: 1, domain: "NEG" },
      { q: "L'image et la marque personnelle d'un joueur :", options: ["Se construisent tôt et constituent un actif", "Ne concernent que les stars", "Sont l'affaire exclusive du club"], answer: 0, domain: "BUS" },
      { q: "Un jeune surdoué a une offre très payée mais un temps de jeu quasi nul. Ton conseil :", options: ["Signer pour la commission", "Prioriser un projet où il joue, quitte à gagner moins tout de suite", "Le laisser seul face au choix"], answer: 1, domain: "MGT" },
      { q: "Revenus d'agent et gestion :", options: ["Réguliers, aucune anticipation nécessaire", "Irréguliers : provisionner impôts et trésorerie", "Toujours croissants d'année en année"], answer: 1, domain: "BUS" },
      { q: "Tes premiers mandats viennent le plus probablement :", options: ["De grands clubs européens", "De divisions inférieures et de ton réseau local", "D'appels entrants d'agents stars"], answer: 1, domain: "BUS" },
      { q: "Un club te propose de te payer, toi l'agent du joueur, pour « faciliter » aussi son côté de l'accord. Tu :", options: ["Acceptes en silence", "Refuses, ou exiges transparence et accord explicite : sinon c'est un conflit d'intérêts", "Acceptes si le montant est élevé"], answer: 1, domain: "JUR" },
      { q: "La réputation d'un agent tient surtout à :", options: ["Ses coups médiatiques", "Sa parole tenue dans la durée", "Son nombre d'abonnés"], answer: 1, domain: "BUS" },
      { q: "Face à un règlement qui a changé depuis ta formation :", options: ["Tu continues comme avant", "Tu fais de la veille et te réfères au texte à jour", "Tu attends qu'un litige tranche la question"], answer: 1, domain: "JUR" },
      { q: "Un mandat exclusif signifie :", options: ["Le joueur peut cumuler plusieurs agents", "Toi seul le représentes sur la période convenue", "C'est le club qui choisit l'agent"], answer: 1, domain: "JUR" },
    ],
  },
];

export function findCert(id: string): Cert | undefined {
  return CERTS.find((c) => c.id === id);
}

/** Corrige un examen côté serveur : score global + bilan par compétence. */
export function gradeExam(cert: Cert, answers: number[]): { score: number; correct: number; breakdown: DomainScore[] } {
  let correct = 0;
  const per: Partial<Record<AttrKey, { correct: number; total: number }>> = {};
  cert.exam.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    if (ok) correct++;
    if (q.domain) {
      const d = (per[q.domain] ??= { correct: 0, total: 0 });
      d.total++;
      if (ok) d.correct++;
    }
  });
  const score = cert.exam.length ? Math.round((correct / cert.exam.length) * 100) : 0;
  const breakdown: DomainScore[] = ATTR_DEFS
    .filter(({ key }) => per[key])
    .map(({ key, label }) => {
      const d = per[key]!;
      return { key, label, correct: d.correct, total: d.total, pct: Math.round((d.correct / d.total) * 100) };
    });
  return { score, correct, breakdown };
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

/** Construit le contexte de prérequis d'un utilisateur (progression + certifs obtenues). */
export async function certContext(uid: string): Promise<CertCtx> {
  const [p, mine] = await Promise.all([getProgress(uid), getMyCerts(uid)]);
  return {
    chapters: chaptersCompleted(p.done),
    lessons: p.done.size,
    level: p.info.level,
    earned: new Set(mine.keys()),
  };
}

/** Prérequis remplis pour passer l'examen ? */
export async function canTakeCert(uid: string, cert: Cert): Promise<boolean> {
  const ctx = await certContext(uid);
  return cert.prereq(ctx);
}

function genCode(): string {
  const y = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PZ-${y}-${rand}`;
}

export type ExamResult = { pass: boolean; already: boolean; score: number; code?: string; bonusXp?: number; breakdown?: DomainScore[] };

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
