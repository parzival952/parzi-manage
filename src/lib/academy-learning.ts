// PARZI Academy — moteur de révision (lecture).
// Appelle le RPC serveur get_academy_learning_state (migration-021), qui renvoie,
// pour l'utilisateur authentifié : sa maîtrise par compétence, sa file de révision
// (répétition espacée) et son carnet d'erreurs. Tout est calculé côté serveur ;
// ici on ne fait que lire l'état en présentant le jeton de l'utilisateur.
import { cookies } from "next/headers";

export type LearningCompetency = {
  competencyId: string;
  title: string;
  domain: string;
  criticality: string;
  masteryScore: number;
  status:
    | "not_started"
    | "fragile"
    | "developing"
    | "operational"
    | "mastered"
    | "review_due";
  attemptsCount: number;
  nextReviewAt: string | null;
};

export type LearningReview = {
  reviewId: string;
  competencyId: string;
  title: string;
  scheduledFor: string;
  priority: number;
  intervalDays: number;
};

export type LearningError = {
  errorId: string;
  lessonId: string;
  questionIndex: number;
  competencyId: string | null;
  competencyTitle: string | null;
  mistakeType: string;
  recurrenceCount: number;
  status: "open" | "reviewing" | "resolved";
  nextReviewAt: string | null;
};

export type AcademyLearningState = {
  competencies: LearningCompetency[];
  reviews: LearningReview[];
  errors: LearningError[];
  dueReviewCount: number;
  openErrorCount: number;
  generatedAt: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export async function loadAcademyLearningState():
  Promise<AcademyLearningState | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("pm_at")?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/get_academy_learning_state`,
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
      "academy learning state:",
      await response.text(),
    );

    return null;
  }

  return (await response.json()) as AcademyLearningState;
}
