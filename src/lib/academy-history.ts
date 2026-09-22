import { cookies } from "next/headers";

export type AcademyHistoryEvent = {
  type: "diagnostic" | "lesson";
  id: string;
  createdAt: string;
  lessonId: string | null;
  score: number;
  xpGained: number;
  planDayNumber: number | null;
  planFocus: string | null;
  isRetry: boolean;
  questionCount: number;
  correctCount: number;
};

export type AcademyHistory = {
  xp: number;
  streak: number;
  bestStreak: number;
  completedLessons: number;
  perfectLessons: number;
  completedPlanDays: number;
  totalAttempts: number;
  events: AcademyHistoryEvent[];
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY;

export async function loadAcademyHistory(
  limit = 50,
): Promise<AcademyHistory | null> {
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
    `${SUPABASE_URL}/rest/v1/rpc/get_academy_history`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_limit: limit,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error(
      "academy history:",
      await response.text(),
    );

    return null;
  }

  return (await response.json()) as AcademyHistory;
}
