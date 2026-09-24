// Enregistrement d'une partie de simulation + XP (PARZI Academy).
// Dual-mode : Postgres (DATABASE_URL, rôle parzi_app) en prod, SQLite en démo.
// Le score est recalculé ici à partir des choix : le navigateur ne peut pas
// s'attribuer un score. L'XP s'ajoute à academy_progress.xp (XP du compte).
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { replay, result, SCENARIO_ID, xpForScore } from "./academy-simulation";

export type SimulationRecord = {
  score: number;
  xpGained: number;
  bestScore: number;
  xpTotal: number; // XP déjà gagnée sur ce scénario, tous paliers confondus
};

export class InvalidRunError extends Error {}

/** Rejoue la partie, met à jour le meilleur score et crédite l'XP du palier. */
export async function recordSimulationRun(uid: string, prep: unknown, choices: unknown): Promise<SimulationRecord> {
  const state = replay(prep, choices);
  if (!state) throw new InvalidRunError("Partie invalide");
  const score = result(state).score;
  const tierXp = xpForScore(score);

  if (usePostgres()) {
    return pg().begin(async (sql) => {
      // La ligne existe avant le verrou : deux parties simultanées ne peuvent
      // pas créditer deux fois le même palier.
      await sql`INSERT INTO academy_simulation_runs (user_id, scenario_id) VALUES (${uid}, ${SCENARIO_ID})
        ON CONFLICT (user_id, scenario_id) DO NOTHING`;
      const rows = (await sql`SELECT best_score, xp_awarded FROM academy_simulation_runs
        WHERE user_id = ${uid} AND scenario_id = ${SCENARIO_ID} FOR UPDATE`) as unknown as {
        best_score: number; xp_awarded: number;
      }[];
      const prev = rows[0] ?? { best_score: 0, xp_awarded: 0 };
      const gained = Math.max(0, tierXp - prev.xp_awarded);
      const bestScore = Math.max(prev.best_score, score);
      const xpTotal = prev.xp_awarded + gained;
      await sql`UPDATE academy_simulation_runs
        SET best_score = ${bestScore}, xp_awarded = ${xpTotal}, plays = plays + 1, updated_at = now()
        WHERE user_id = ${uid} AND scenario_id = ${SCENARIO_ID}`;
      if (gained > 0) {
        await sql`INSERT INTO academy_progress (user_id, xp) VALUES (${uid}, ${gained})
          ON CONFLICT (user_id) DO UPDATE SET xp = academy_progress.xp + ${gained}`;
      }
      return { score, xpGained: gained, bestScore, xpTotal };
    }) as Promise<SimulationRecord>;
  }

  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    d.prepare("INSERT OR IGNORE INTO academy_simulation_runs (user_id, scenario_id) VALUES (?, ?)").run(uid, SCENARIO_ID);
    const prev = d
      .prepare("SELECT best_score, xp_awarded FROM academy_simulation_runs WHERE user_id = ? AND scenario_id = ?")
      .get(uid, SCENARIO_ID) as { best_score: number; xp_awarded: number };
    const gained = Math.max(0, tierXp - prev.xp_awarded);
    const bestScore = Math.max(prev.best_score, score);
    const xpTotal = prev.xp_awarded + gained;
    d.prepare(
      "UPDATE academy_simulation_runs SET best_score = ?, xp_awarded = ?, plays = plays + 1, updated_at = datetime('now') WHERE user_id = ? AND scenario_id = ?",
    ).run(bestScore, xpTotal, uid, SCENARIO_ID);
    if (gained > 0) {
      d.prepare("INSERT INTO academy_progress (user_id, xp) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET xp = xp + ?").run(uid, gained, gained);
    }
    d.exec("COMMIT");
    return { score, xpGained: gained, bestScore, xpTotal };
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

/** Meilleur score et XP déjà gagnée (affichage de l'intro). */
export async function getSimulationBest(uid: string): Promise<{ bestScore: number; xpTotal: number } | null> {
  try {
    if (usePostgres()) {
      const rows = (await pg()`SELECT best_score, xp_awarded FROM academy_simulation_runs
        WHERE user_id = ${uid} AND scenario_id = ${SCENARIO_ID}`) as unknown as { best_score: number; xp_awarded: number }[];
      return rows[0] ? { bestScore: rows[0].best_score, xpTotal: rows[0].xp_awarded } : null;
    }
    const r = db()
      .prepare("SELECT best_score, xp_awarded FROM academy_simulation_runs WHERE user_id = ? AND scenario_id = ?")
      .get(uid, SCENARIO_ID) as { best_score: number; xp_awarded: number } | undefined;
    return r ? { bestScore: r.best_score, xpTotal: r.xp_awarded } : null;
  } catch (err) {
    // Bonus d'affichage : si la lecture échoue, la simulation reste jouable.
    console.error("[academy-simulation] lecture du meilleur score impossible", err);
    return null;
  }
}
