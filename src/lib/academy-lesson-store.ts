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
  confidences?: number[],
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

  const call = (withConfidences: boolean) =>
    fetch(
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
          ...(withConfidences
            ? { p_confidences: confidences }
            : {}),
        }),
        cache: "no-store",
      },
    );

  let response = await call(Boolean(confidences));

  // Base pas encore migrée (025) : la fonction à 3 arguments n'existe pas
  // (PGRST202). On retombe sur l'appel historique pour ne jamais bloquer
  // la validation d'une leçon.
  if (
    confidences &&
    response.status === 404
  ) {
    const probe = (await response
      .clone()
      .json()
      .catch(() => null)) as { code?: string } | null;

    if (probe?.code === "PGRST202") {
      response = await call(false);
    }
  }

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
