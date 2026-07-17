// PARZI Score — moteur de scores explicables.
// Principe fondateur : chaque sous-score est calculé sur des données RÉELLES
// et explicable ; ce qui exige un fournisseur de données pas encore branché
// est affiché « en attente de données », jamais inventé.
import type { Opportunity, Player } from "./queries";
import type { NewsItem } from "./veille";

export type SubScore = {
  key: string;
  label: string;
  value: number | null; // null = en attente de données
  weight: number;
  why: string;
};

export type ParziScore = {
  total: number;
  label: string;
  color: string;
  subs: SubScore[];
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

function parseValueMEur(v: string): number | null {
  const m = v.replace(",", ".").match(/([\d.]+)\s*M/i);
  return m ? parseFloat(m[1]) : null;
}

export function computeParziScore(
  p: Player,
  allPlayers: Player[],
  opps: Opportunity[],
  news: NewsItem[],
): ParziScore {
  const lastName = (p.name.replace(/\(.*\)/, "").trim().split(/\s+/).pop() ?? "").toLowerCase();
  const club = p.club.replace(/\(.*\)/, "").trim().toLowerCase();

  // --- Situation contractuelle (réel : statut + libellé) ---
  const contrat: SubScore = {
    key: "contrat",
    label: "Situation contractuelle",
    weight: 3,
    value: p.status === "urgent" ? 22 : p.status === "soon" ? 55 : 88,
    why:
      p.status === "urgent"
        ? `Échéance critique : ${p.status_label}. Chaque semaine sans action détruit de la valeur.`
        : p.status === "soon"
        ? `Contrat qui approche de l'échéance (${p.contract_end}) : fenêtre de négociation ouverte — c'est un levier, pas encore un risque.`
        : `Contrat sécurisé jusqu'à ${p.contract_end} : position de force pour négocier sans urgence.`,
  };

  // --- Demande du marché (réel : opportunités qui citent le joueur) ---
  const demandCount = opps.filter((o) => lastName.length >= 4 && o.body.toLowerCase().includes(lastName)).length;
  const demande: SubScore = {
    key: "demande",
    label: "Demande du marché",
    weight: 3,
    value: clamp(30 + demandCount * 30),
    why: demandCount > 0
      ? `${demandCount} opportunité${demandCount > 1 ? "s" : ""} active${demandCount > 1 ? "s" : ""} cite${demandCount > 1 ? "nt" : ""} explicitement ce profil.`
      : "Aucune opportunité active ne cite ce joueur — à provoquer (dossier, approches clubs).",
  };

  // --- Momentum médiatique (réel : actus de la veille citant joueur/club) ---
  const mediaCount = news.filter((n) => {
    const t = n.title.toLowerCase();
    return (lastName.length >= 4 && t.includes(lastName)) || (club.length >= 4 && t.includes(club));
  }).length;
  const momentum: SubScore = {
    key: "momentum",
    label: "Momentum médiatique",
    weight: 2,
    value: clamp(35 + mediaCount * 15),
    why: mediaCount > 0
      ? `${mediaCount} actualité${mediaCount > 1 ? "s" : ""} récente${mediaCount > 1 ? "s" : ""} mentionne${mediaCount > 1 ? "nt" : ""} le joueur ou son club dans la veille.`
      : "Pas de présence dans l'actualité récente — le kit média et les performances feront le momentum.",
  };

  // --- Fenêtre de carrière (réel : âge) ---
  const ageScore = p.age <= 21 ? 90 : p.age <= 24 ? 80 : p.age <= 27 ? 68 : p.age <= 30 ? 52 : 38;
  const fenetre: SubScore = {
    key: "fenetre",
    label: "Fenêtre de carrière",
    weight: 2,
    value: ageScore,
    why:
      p.age <= 24
        ? `${p.age} ans : plein potentiel de valorisation devant lui — le marché paie l'avenir.`
        : p.age <= 28
        ? `${p.age} ans : maturité sportive, valeur au sommet — le timing des décisions compte double.`
        : `${p.age} ans : la valeur de transfert décroît, le levier passe au salaire et à la durée.`,
  };

  // --- Valeur relative dans le portefeuille (réel : est_value comparée) ---
  const val = parseValueMEur(p.est_value);
  const values = allPlayers.map((x) => parseValueMEur(x.est_value)).filter((x): x is number => x !== null);
  const maxVal = values.length ? Math.max(...values) : null;
  const valeur: SubScore = {
    key: "valeur",
    label: "Valeur marchande (relative)",
    weight: 2,
    value: val !== null && maxVal ? clamp(25 + (val / maxVal) * 70) : null,
    why:
      val !== null && maxVal
        ? `Valeur estimée ${p.est_value} — ${val >= maxVal ? "l'actif n°1 du portefeuille" : `à ${Math.round((val / maxVal) * 100)} % de l'actif le plus valorisé du portefeuille`}.`
        : "Renseigne une valeur estimée (ex. « 2,5 M€ ») pour activer ce sous-score.",
  };

  // --- Sous-scores en attente de fournisseurs de données (jamais inventés) ---
  const awaiting: SubScore[] = [
    { key: "perf", label: "Performance sportive", weight: 3, value: null, why: "Nécessite un fournisseur de statistiques (API-Football / StatsBomb) — roadmap V2." },
    { key: "temps", label: "Temps de jeu", weight: 2, value: null, why: "Nécessite les minutes jouées officielles — roadmap V2." },
    { key: "blessures", label: "Fiabilité physique", weight: 2, value: null, why: "Nécessite l'historique de blessures sous licence — roadmap V2." },
  ];

  const active = [contrat, demande, momentum, fenetre, valeur].filter((s) => s.value !== null);
  const totalWeight = active.reduce((s, x) => s + x.weight, 0);
  const total = clamp(active.reduce((s, x) => s + (x.value as number) * x.weight, 0) / (totalWeight || 1));

  return {
    total,
    label: total >= 78 ? "Actif stratégique" : total >= 60 ? "Solide" : total >= 45 ? "À travailler" : "Sous tension",
    color: total >= 78 ? "#10b981" : total >= 60 ? "#2563eb" : total >= 45 ? "#f59e0b" : "#ef4444",
    subs: [contrat, demande, momentum, fenetre, valeur, ...awaiting],
  };
}
