// Tableau de bord admin des inscrits PARZI Academy : liste des élèves (profil
// « Faisons connaissance », progression) et répartitions. Réservé à l'admin
// (voir requireAdminRole). Dual-mode : Postgres en prod, SQLite en démo.
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import {
  AGE_RANGES,
  EXAM_HORIZONS,
  GOALS,
  REFERRAL_SOURCES,
  type Option,
} from "./academy-onboarding-fields";

export type Inscrit = {
  user_id: string;
  email: string;
  created_at: string | Date | null;
  first_name: string | null;
  last_name: string | null;
  age_range: string | null;
  country: string | null;
  region: string | null;
  phone: string | null;
  goal: string | null;
  exam_horizon: string | null;
  referral_source: string | null;
  step: number | null;
  completed_at: string | Date | null;
  xp: number;
  lessons: number;
  last_active: string | Date | null;
};

// Élèves de l'Academy : parcours « aspirant », ou déjà un profil d'inscription
// ou une progression (un agent Manage qui suit aussi la formation).
export async function listInscrits(): Promise<Inscrit[]> {
  if (usePostgres()) {
    const rows = (await pg()`WITH ids AS (
        SELECT user_id FROM profiles WHERE path = 'aspirant'
        UNION SELECT user_id FROM academy_member_profiles
        UNION SELECT user_id FROM academy_progress
      )
      SELECT ids.user_id, COALESCE(p.email, '') AS email, COALESCE(p.created_at, m.created_at) AS created_at,
        m.first_name, m.last_name, m.age_range, m.country, m.region, m.phone, m.goal, m.exam_horizon,
        m.referral_source, m.step, m.completed_at,
        COALESCE(ap.xp, 0)::int AS xp, ap.last_active,
        (SELECT COUNT(*)::int FROM academy_done d WHERE d.user_id = ids.user_id) AS lessons
      FROM ids
      LEFT JOIN profiles p ON p.user_id = ids.user_id
      LEFT JOIN academy_member_profiles m ON m.user_id = ids.user_id
      LEFT JOIN academy_progress ap ON ap.user_id = ids.user_id
      ORDER BY COALESCE(p.created_at, m.created_at) DESC NULLS LAST
      LIMIT 1000`) as unknown as Inscrit[];
    return rows;
  }
  return db()
    .prepare(`WITH ids AS (
        SELECT user_id FROM profiles WHERE path = 'aspirant'
        UNION SELECT user_id FROM academy_member_profiles
        UNION SELECT user_id FROM academy_progress
      )
      SELECT ids.user_id, COALESCE(p.email, '') AS email, m.created_at AS created_at,
        m.first_name, m.last_name, m.age_range, m.country, m.region, m.phone, m.goal, m.exam_horizon,
        m.referral_source, m.step, m.completed_at,
        COALESCE(ap.xp, 0) AS xp, ap.last_active,
        (SELECT COUNT(*) FROM academy_done d WHERE d.user_id = ids.user_id) AS lessons
      FROM ids
      LEFT JOIN profiles p ON p.user_id = ids.user_id
      LEFT JOIN academy_member_profiles m ON m.user_id = ids.user_id
      LEFT JOIN academy_progress ap ON ap.user_id = ids.user_id
      ORDER BY m.created_at DESC
      LIMIT 1000`)
    .all() as Inscrit[];
}

export type Repartition = { label: string; count: number }[];

export type Synthese = {
  total: number;
  profilCommence: number; // étape 1 remplie
  projetRenseigne: number; // étape 2 remplie
  termine: number;
  actifs7j: number;
  lecons: number;
  objectif: Repartition;
  echeance: Repartition;
  source: Repartition;
  age: Repartition;
  pays: Repartition;
};

const DAY = 24 * 60 * 60 * 1000;

/** Répartition selon une liste d'options (ordre de la liste), + « Non renseigné ». */
function repartir(rows: Inscrit[], pick: (r: Inscrit) => string | null, options?: Option[]): Repartition {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = pick(r) || "";
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const out: Repartition = [];
  if (options) {
    for (const o of options) out.push({ label: o.label, count: counts.get(o.value) ?? 0 });
  } else {
    for (const [v, n] of [...counts.entries()].filter(([v]) => v).sort((a, b) => b[1] - a[1])) {
      out.push({ label: v, count: n });
    }
  }
  const none = counts.get("") ?? 0;
  if (none) out.push({ label: "Non renseigné", count: none });
  return out;
}

export function syntheseInscrits(rows: Inscrit[], now: Date): Synthese {
  const recent = (d: string | Date | null) => {
    if (!d) return false;
    const t = new Date(d).getTime();
    return !Number.isNaN(t) && now.getTime() - t <= 7 * DAY;
  };
  return {
    total: rows.length,
    profilCommence: rows.filter((r) => r.first_name).length,
    projetRenseigne: rows.filter((r) => r.goal).length,
    termine: rows.filter((r) => r.completed_at).length,
    actifs7j: rows.filter((r) => recent(r.last_active)).length,
    lecons: rows.reduce((s, r) => s + Number(r.lessons || 0), 0),
    objectif: repartir(rows, (r) => r.goal, GOALS),
    echeance: repartir(rows, (r) => r.exam_horizon, EXAM_HORIZONS),
    source: repartir(rows, (r) => r.referral_source, REFERRAL_SOURCES),
    age: repartir(rows, (r) => r.age_range, AGE_RANGES),
    pays: repartir(rows, (r) => r.country),
  };
}

/** Libellé lisible d'un code (objectif, échéance…), ou « — ». */
export function labelOf(options: Option[], value: string | null): string {
  return options.find((o) => o.value === value)?.label ?? "—";
}

/**
 * Cellule CSV sûre : guillemets doublés, et neutralisation des formules
 * (une valeur qui commence par = + - @ ne doit pas s'exécuter dans Excel).
 */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

export function inscritsCsv(rows: Inscrit[]): string {
  const head = [
    "Prénom", "Nom", "E-mail", "Âge", "Pays", "Ville ou région", "Objectif", "Échéance examen",
    "Source", "Téléphone", "XP", "Leçons", "Inscrit le", "Inscription terminée le", "Dernière activité",
  ];
  const lines = rows.map((r) =>
    [
      r.first_name, r.last_name, r.email, labelOf(AGE_RANGES, r.age_range), r.country, r.region,
      labelOf(GOALS, r.goal), labelOf(EXAM_HORIZONS, r.exam_horizon), labelOf(REFERRAL_SOURCES, r.referral_source),
      r.phone, r.xp, r.lessons, r.created_at, r.completed_at, r.last_active,
    ].map(csvCell).join(";"),
  );
  return "﻿" + [head.join(";"), ...lines].join("\r\n") + "\r\n";
}
