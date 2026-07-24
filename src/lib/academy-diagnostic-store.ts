import { randomUUID } from "node:crypto";

export type DiagnosticAnswerForStorage = {
  questionId?: string;
  selectedAnswerIds?: string[];
  confidence?: number;
  elapsedSeconds?: number;
};

export type DiagnosticSectionForStorage = {
  id: string;
  label: string;
  correctCount: number;
  questionCount: number;
  scorePercent: number;
};

type SaveDiagnosticInput = {
  accessToken: string;
  scorePercent: number;
  correctCount: number;
  questionCount: number;
  pointsEarned: number;
  pointsPossible: number;
  elapsedSeconds: number;
  overconfidenceErrors: number;
  slowAnswers: number;
  unansweredQuestions: number;
  sectionResults: DiagnosticSectionForStorage[];
  answers: DiagnosticAnswerForStorage[];
};

export type SavedDiagnosticResult = {
  persisted: boolean;
  attemptId: string | null;
  xpAwarded: number;
  totalXp: number | null;
  trophyUnlocked: string | null;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY;

export async function saveDiagnosticCompletion(
  input: SaveDiagnosticInput,
): Promise<SavedDiagnosticResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      persisted: false,
      attemptId: null,
      xpAwarded: 0,
      totalXp: null,
      trophyUnlocked: null,
    };
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/complete_academy_diagnostic`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_attempt_id: randomUUID(),
        p_score_percent: input.scorePercent,
        p_correct_count: input.correctCount,
        p_question_count: input.questionCount,
        p_points_earned: input.pointsEarned,
        p_points_possible: input.pointsPossible,
        p_elapsed_seconds: input.elapsedSeconds,
        p_overconfidence_errors:
          input.overconfidenceErrors,
        p_slow_answers: input.slowAnswers,
        p_unanswered_questions:
          input.unansweredQuestions,
        p_section_results: input.sectionResults,
        p_answers: input.answers,
      }),
      cache: "no-store",
    },
  );

  const body = (await response.json()) as
    | SavedDiagnosticResult
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
        "La sauvegarde Supabase du diagnostic a échoué.",
    );
  }

  return body as SavedDiagnosticResult;
}
