// PARZI Academy — « Rejouer mes erreurs » (écriture).
// Appelle le RPC serveur retry_academy_error (migration-024) : correction 100 %
// côté base contre la clé (jamais envoyée au navigateur avant la réponse),
// trace avec niveau de certitude, et résolution de l'erreur si la réponse est juste.
import { cookies } from "next/headers";

export type RetryConfidence =
  | "certain"
  | "rather_certain"
  | "hesitant"
  | "guess";

export const RETRY_CONFIDENCES: RetryConfidence[] = [
  "certain",
  "rather_certain",
  "hesitant",
  "guess",
];

export type RetryResult = {
  correct: boolean;
  correctAnswer: number;
  resolved: boolean;
  remainingErrors: number;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export function retryAvailable(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function retryAcademyError(
  lessonId: string,
  questionIndex: number,
  answer: number,
  confidence: RetryConfidence,
): Promise<RetryResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("La connexion Supabase Academy est inactive.");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("pm_at")?.value;

  if (!accessToken) {
    throw new Error("Ta session a expiré. Reconnecte-toi.");
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/retry_academy_error`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_lesson_id: lessonId,
        p_question_index: questionIndex,
        p_answer: answer,
        p_confidence: confidence,
      }),
      cache: "no-store",
    },
  );

  const body = (await response.json()) as
    | RetryResult
    | { message?: string; error?: string };

  if (!response.ok) {
    const message =
      "message" in body ? body.message : "error" in body ? body.error : null;
    throw new Error(message || "La correction sécurisée a échoué.");
  }

  return body as RetryResult;
}
