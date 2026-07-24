import { cookies } from "next/headers";

import {
  levelFromXp,
} from "@/lib/progression";

export type SecureLessonResult = {
  already: boolean;
  xpGained: number;
  score: number;
  previousXp: number;
  totalXp: number;
  streak: number;
  leveledUp: boolean;
  newLevel: number;
};

type RpcLessonResult = {
  already: boolean;
  xpGained: number;
  score: number;
  previousXp: number;
  totalXp: number;
  streak: number;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY;

export async function completeSecureLesson(
  lessonId: string,
  answers: number[],
): Promise<SecureLessonResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "La connexion Supabase Academy est inactive.",
    );
  }

  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get("pm_at")?.value;

  if (!accessToken) {
    throw new Error(
      "Ta session a expiré. Reconnecte-toi.",
    );
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/complete_academy_lesson`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_lesson_id: lessonId,
        p_answers: answers,
      }),
      cache: "no-store",
    },
  );

  const body = (await response.json()) as
    | RpcLessonResult
    | {
        message?: string;
        error?: string;
      };

  if (!response.ok) {
    const message =
      "message" in body
        ? body.message
        : "error" in body
          ? body.error
          : null;

    throw new Error(
      message ||
        "La validation sécurisée a échoué.",
    );
  }

  const result = body as RpcLessonResult;
  const previousLevel = levelFromXp(
    result.previousXp,
  );
  const newLevel = levelFromXp(
    result.totalXp,
  );

  return {
    ...result,
    newLevel,
    leveledUp: newLevel > previousLevel,
  };
}
