import { cookies } from "next/headers";

export type AcademyStudyPlanDay = {
  day: number;
  focusSectionId: string;
  focus: string;
  recommendedLessonId: string;
  activity: string;
  scheduledDate: string;
  status: "pending" | "completed";
  completedAt: string | null;
  xpAwarded: number;
  isUnlocked: boolean;
  isCurrent: boolean;
};

export type AcademyStudyPlan = {
  found: boolean;
  diagnosticAttemptId: string | null;
  completedCount: number;
  currentDay: number | null;
  totalDays: number;
  days: AcademyStudyPlanDay[];
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY;

export async function loadAcademyStudyPlan():
  Promise<AcademyStudyPlan | null> {
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
    `${SUPABASE_URL}/rest/v1/rpc/get_academy_study_plan`,
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
      "academy study plan:",
      await response.text(),
    );

    return null;
  }

  return (await response.json()) as AcademyStudyPlan;
}
