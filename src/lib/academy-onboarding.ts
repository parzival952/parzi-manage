// Inscription progressive PARZI Academy : lecture / enregistrement des
// réponses « Faisons connaissance » (table academy_member_profiles).
// Dual-mode : Postgres (DATABASE_URL, rôle parzi_app) en prod, SQLite en démo.
// Chaque étape est enregistrée dès qu'elle est validée : un élève qui s'arrête
// en route reprend là où il en était.
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { ONBOARDING_STEPS, type Step1, type Step2, type Step3 } from "./academy-onboarding-fields";

export type MemberProfile = {
  first_name: string | null;
  last_name: string | null;
  age_range: string | null;
  country: string | null;
  region: string | null;
  phone: string | null;
  goal: string | null;
  exam_horizon: string | null;
  referral_source: string | null;
  step: number;
  completed_at: string | null;
};

const DONE = ONBOARDING_STEPS + 1;

export async function getMemberProfile(uid: string): Promise<MemberProfile | null> {
  if (usePostgres()) {
    const rows = (await pg()`SELECT first_name, last_name, age_range, country, region, phone, goal,
      exam_horizon, referral_source, step, completed_at FROM academy_member_profiles WHERE user_id = ${uid}`) as unknown as MemberProfile[];
    return rows[0] ?? null;
  }
  const row = db()
    .prepare(`SELECT first_name, last_name, age_range, country, region, phone, goal, exam_horizon,
      referral_source, step, completed_at FROM academy_member_profiles WHERE user_id = ?`)
    .get(uid) as MemberProfile | undefined;
  return row ?? null;
}

export const onboardingDone = (p: MemberProfile | null) => Boolean(p?.completed_at);

/** Prochaine étape atteinte (1 à 3), en ne reculant jamais. */
const nextStep = (current: number | undefined, after: number) => Math.max(current ?? 1, after + 1);

export async function saveStep1(uid: string, d: Step1): Promise<void> {
  const region = d.region || null;
  if (usePostgres()) {
    // Passer à moins de 18 ans efface un éventuel téléphone (contrainte en base).
    await pg()`INSERT INTO academy_member_profiles (user_id, first_name, last_name, age_range, country, region, step)
      VALUES (${uid}, ${d.firstName}, ${d.lastName}, ${d.ageRange}, ${d.country}, ${region}, 2)
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, age_range = EXCLUDED.age_range,
        country = EXCLUDED.country, region = EXCLUDED.region,
        phone = CASE WHEN EXCLUDED.age_range = 'moins-18' THEN NULL ELSE academy_member_profiles.phone END,
        step = GREATEST(academy_member_profiles.step, 2), updated_at = now()`;
    return;
  }
  const prev = await getMemberProfile(uid);
  db().prepare(`INSERT INTO academy_member_profiles (user_id, first_name, last_name, age_range, country, region, step)
      VALUES (?, ?, ?, ?, ?, ?, 2)
      ON CONFLICT (user_id) DO UPDATE SET first_name = excluded.first_name, last_name = excluded.last_name,
        age_range = excluded.age_range, country = excluded.country, region = excluded.region,
        phone = CASE WHEN excluded.age_range = 'moins-18' THEN NULL ELSE academy_member_profiles.phone END,
        step = ?, updated_at = datetime('now')`)
    .run(uid, d.firstName, d.lastName, d.ageRange, d.country, region, nextStep(prev?.step, 1));
}

export async function saveStep2(uid: string, d: Step2): Promise<void> {
  if (usePostgres()) {
    await pg()`UPDATE academy_member_profiles SET goal = ${d.goal}, exam_horizon = ${d.examHorizon},
      step = GREATEST(step, 3), updated_at = now() WHERE user_id = ${uid}`;
    return;
  }
  const prev = await getMemberProfile(uid);
  db().prepare(`UPDATE academy_member_profiles SET goal = ?, exam_horizon = ?, step = ?, updated_at = datetime('now')
      WHERE user_id = ?`).run(d.goal, d.examHorizon, nextStep(prev?.step, 2), uid);
}

/** Dernière étape (facultative) : `d` vide = « Passer cette étape ». */
export async function finishOnboarding(uid: string, d: Step3): Promise<void> {
  const phone = d.phone || null;
  const source = d.referralSource || null;
  if (usePostgres()) {
    await pg()`UPDATE academy_member_profiles SET phone = ${phone}, referral_source = ${source},
      step = ${DONE}, completed_at = COALESCE(completed_at, now()), updated_at = now() WHERE user_id = ${uid}`;
    return;
  }
  db().prepare(`UPDATE academy_member_profiles SET phone = ?, referral_source = ?, step = ?,
      completed_at = COALESCE(completed_at, datetime('now')), updated_at = datetime('now') WHERE user_id = ?`)
    .run(phone, source, DONE, uid);
}
