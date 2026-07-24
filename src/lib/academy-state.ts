import { cookies } from "next/headers";

import type { Progress } from "@/lib/academy";
import { levelInfo } from "@/lib/progression";

type AcademyCompletedLesson = {
  lessonId: string;
  score: number;
  createdAt: string;
};

export type AcademyState = {
  xp: number;
  streak: number;
  bestStreak: number;
  lastActive: string;
  done: AcademyCompletedLesson[];
  todayLessons: number;
  todayPerfect: number;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY;

export async function loadAcademyState():
  Promise<AcademyState | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("pm_at")?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/get_academy_state`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error(
      "academy state:",
      await response.text(),
    );

    return null;
  }

  return (await response.json()) as AcademyState;
}

export function academyStateToProgress(
  state: AcademyState,
): Progress {
  const completedLessonIds = new Set(
    state.done.map((lesson) => lesson.lessonId),
  );

  const perfectLessons = state.done.filter(
    (lesson) => lesson.score >= 100,
  ).length;

  return {
    xp: state.xp,
    streak: state.streak,
    best_streak: state.bestStreak,
    last_active: state.lastActive,
    done: completedLessonIds,
    perfect: perfectLessons,
    info: levelInfo(state.xp),
  };
}
