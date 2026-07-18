// Data Provider n°1 — football-data.org (source licenciée, plan gratuit).
// Première brique de la couche « Data Providers » de l'architecture PARZI OS :
// AUCUNE page n'appelle la source directement, tout passe par cette interface —
// le jour où on ajoute API-Football/Sportmonks, seule cette couche change.
// Quota gratuit : 10 requêtes/min → cache serveur 6 h sur chaque appel.

const API = "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_KEY;

export const footDataEnabled = () => Boolean(KEY);

/** Compétitions disponibles sur le plan gratuit de la source. */
export const LEAGUES: { code: string; name: string; flag: string }[] = [
  { code: "FL1", name: "Ligue 1", flag: "🇫🇷" },
  { code: "CL", name: "Ligue des champions", flag: "🏆" },
  { code: "PL", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "PD", name: "La Liga", flag: "🇪🇸" },
  { code: "SA", name: "Serie A", flag: "🇮🇹" },
  { code: "BL1", name: "Bundesliga", flag: "🇩🇪" },
  { code: "PPL", name: "Liga Portugal", flag: "🇵🇹" },
  { code: "DED", name: "Eredivisie", flag: "🇳🇱" },
];

export type StandingRow = {
  position: number; team: { name: string; crest: string };
  playedGames: number; won: number; draw: number; lost: number;
  points: number; goalsFor: number; goalsAgainst: number; goalDifference: number;
};
export type Match = {
  id: number; utcDate: string; matchday: number | null; status: string;
  homeTeam: { name: string; crest: string }; awayTeam: { name: string; crest: string };
  score: { fullTime: { home: number | null; away: number | null } };
};
export type Scorer = {
  player: { name: string; nationality: string | null; dateOfBirth?: string | null };
  team: { name: string; crest: string };
  goals: number | null; assists: number | null; playedMatches: number | null;
};

async function call<T>(path: string): Promise<T | null> {
  if (!KEY) return null;
  try {
    const r = await fetch(`${API}${path}`, {
      headers: { "X-Auth-Token": KEY },
      // Cache serveur 6 h : fraîcheur suffisante pour classements/résultats, quota préservé.
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(9000),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function getStandings(code: string): Promise<StandingRow[] | null> {
  const j = await call<{ standings?: { type: string; table: StandingRow[] }[] }>(`/competitions/${code}/standings`);
  const total = j?.standings?.find((s) => s.type === "TOTAL") ?? j?.standings?.[0];
  return total?.table ?? null;
}

/** Derniers résultats (les plus récents d'abord). */
export async function getResults(code: string, limit = 10): Promise<Match[] | null> {
  const j = await call<{ matches?: Match[] }>(`/competitions/${code}/matches?status=FINISHED`);
  if (!j?.matches) return null;
  return [...j.matches].sort((a, b) => b.utcDate.localeCompare(a.utcDate)).slice(0, limit);
}

/** Prochains matchs (les plus proches d'abord) — fenêtre de 45 jours pour couvrir
 *  tous les statuts à venir (SCHEDULED et TIMED). */
export async function getUpcoming(code: string, limit = 10): Promise<Match[] | null> {
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10);
  const j = await call<{ matches?: Match[] }>(`/competitions/${code}/matches?dateFrom=${from}&dateTo=${to}`);
  if (!j?.matches) return null;
  return j.matches
    .filter((m) => m.status !== "FINISHED")
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(0, limit);
}

export async function getScorers(code: string, limit = 10): Promise<Scorer[] | null> {
  const j = await call<{ scorers?: Scorer[] }>(`/competitions/${code}/scorers?limit=${limit}`);
  return j?.scorers ?? null;
}
