import { cookies } from "next/headers";

import {
  DIAGNOSTIC_SECTION_LABELS,
  DIAGNOSTIC_SECTION_ORDER,
  loadPrivateDiagnosticQuestions,
} from "@/lib/academy-diagnostic";

export type Competency = {
  id: string;
  label: string;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  earnedPoints: number;
  possiblePoints: number;
  score: number;
  status: {
    id: string;
    label: string;
  };
};

export type Strength = {
  rank: number;
  sectionId: string;
  label: string;
  score: number;
  status: string;
};

export type Priority = {
  rank: number;
  sectionId: string;
  label: string;
  score: number;
  status: string;
  reason: string;
};

export type RiskSignal = {
  id: string;
  label: string;
  value: number;
  severity: string;
};

export type ErrorProfileItem = {
  id: string;
  label: string;
  count: number;
};

export type Trophy = {
  id: string;
  name: string;
  description: string;
  rarity: string;
  visibility: string;
};

export type StudyDay = {
  day: number;
  focus: string;
  activity: string;
};

export type DiagnosticReport = {
  reportId: string;
  version: string;
  generatedAt: string;
  summary: {
    scorePercent: number;
    pointsEarned: number;
    pointsPossible: number;
    completionRatePercent: number;
    initialLevel: {
      id: string;
      label: string;
    };
  };
  competencies: Competency[];
  strengths: Strength[];
  priorities: Priority[];
  riskSignals: {
    overconfidenceErrors: number;
    slowAnswers: number;
    unansweredQuestions: number;
    highRiskSignals: RiskSignal[];
  };
  errorProfile: ErrorProfileItem[];
  progression: {
    xpEarned: number;
    maximumModuleXp: number;
    level: number;
    levelName: string;
    xpRequiredForNextLevel: number;
    progressToNextLevelPercent: number;
    levelUpReady: boolean;
  };
  trophies: {
    unlockedCount: number;
    unlocked: Trophy[];
  };
  studyPlan: {
    durationDays: number;
    recommendedSessionMinutes: number;
    sessionsPerWeek: number;
    days: StudyDay[];
  };
};

type StoredAnswer = {
  questionId?: string;
  selectedAnswerIds?: string[];
  confidence?: number;
  elapsedSeconds?: number;
};

type StoredSection = {
  id?: string;
  label?: string;
  correctCount?: number;
  questionCount?: number;
  scorePercent?: number;
};

type StoredAttempt = {
  id: string;
  score_percent: number;
  correct_count: number;
  question_count: number;
  points_earned: number;
  points_possible: number;
  elapsed_seconds: number;
  overconfidence_errors: number;
  slow_answers: number;
  unanswered_questions: number;
  section_results: StoredSection[];
  answers: StoredAnswer[];
  xp_awarded: number;
  created_at: string;
};

type StoredTrophy = {
  id: string;
  metadata?: {
    name?: string;
    description?: string;
  };
  unlockedAt?: string;
};

type LatestReportResponse = {
  found: boolean;
  attempt: StoredAttempt | null;
  totalXp: number;
  trophies: StoredTrophy[];
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY;

const ERROR_LABELS: Record<string, string> = {
  knowledge: "Manque de connaissances",
  comprehension: "Erreur de compréhension",
  method: "Erreur de méthode",
  source: "Mauvaise utilisation des sources",
  attention: "Manque d’attention",
  time: "Gestion du temps",
  overconfidence: "Excès de confiance",
};

function arraysMatch(
  first: string[],
  second: string[],
): boolean {
  const normalizedFirst = Array.from(
    new Set(first),
  ).sort();

  const normalizedSecond = Array.from(
    new Set(second),
  ).sort();

  return (
    normalizedFirst.length ===
      normalizedSecond.length &&
    normalizedFirst.every(
      (value, index) =>
        value === normalizedSecond[index],
    )
  );
}

function getStatus(score: number) {
  if (score < 25) {
    return {
      id: "critical",
      label: "Niveau critique",
    };
  }

  if (score < 45) {
    return {
      id: "fragile",
      label: "Niveau fragile",
    };
  }

  if (score < 65) {
    return {
      id: "progressing",
      label: "Niveau intermédiaire",
    };
  }

  if (score < 80) {
    return {
      id: "operational",
      label: "Niveau solide",
    };
  }

  return {
    id: "mastered",
    label: "Niveau maîtrisé",
  };
}

function getInitialLevel(score: number) {
  if (score < 25) {
    return {
      id: "discovery",
      label: "Niveau découverte",
    };
  }

  if (score < 50) {
    return {
      id: "foundation",
      label: "Bases à consolider",
    };
  }

  if (score < 75) {
    return {
      id: "intermediate",
      label: "Niveau intermédiaire",
    };
  }

  return {
    id: "advanced",
    label: "Niveau avancé",
  };
}

function getPriorityReason(
  label: string,
  score: number,
): string {
  if (score < 25) {
    return `${label} constitue actuellement une zone de risque importante. Commence par revoir les fondamentaux et refaire des exercices guidés.`;
  }

  if (score < 50) {
    return `${label} doit être consolidé avec des explications simples, des cas pratiques et des corrections détaillées.`;
  }

  return `${label} est en progression, mais nécessite encore des entraînements chronométrés pour devenir fiable à l’examen.`;
}

function buildStudyPlan(
  priorities: Priority[],
): StudyDay[] {
  const fallback = {
    label: "Méthode générale",
  };

  return Array.from(
    { length: 14 },
    (_, index) => {
      const day = index + 1;
      const priority =
        priorities[index % priorities.length] ??
        fallback;

      const activities = [
        "Comprendre la règle et reformuler avec tes propres mots.",
        "Étudier deux exemples corrects et un contre-exemple.",
        "Résoudre un cas pratique guidé.",
        "Faire un quiz court puis analyser chaque erreur.",
        "Refaire les questions difficiles sans consulter la correction.",
        "Travailler sous chronomètre et vérifier la méthode utilisée.",
        "Effectuer une révision espacée et résumer les acquis.",
      ];

      return {
        day,
        focus: priority.label,
        activity:
          activities[(day - 1) % activities.length],
      };
    },
  );
}

export async function loadLatestDiagnosticReport():
  Promise<DiagnosticReport | null> {
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
    `${SUPABASE_URL}/rest/v1/rpc/get_latest_academy_diagnostic_report`,
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
    return null;
  }

  const stored =
    (await response.json()) as LatestReportResponse;

  if (!stored.found || !stored.attempt) {
    return null;
  }

  const attempt = stored.attempt;
  const privateQuestions =
    loadPrivateDiagnosticQuestions();

  const answersByQuestion = new Map(
    (attempt.answers ?? []).map((answer) => [
      answer.questionId ?? "",
      answer,
    ]),
  );

  const competencyStats = new Map<
    string,
    {
      questionCount: number;
      answeredCount: number;
      correctCount: number;
      earnedPoints: number;
      possiblePoints: number;
    }
  >();

  const errors = new Map<string, number>();

  for (const question of privateQuestions) {
    const answer =
      answersByQuestion.get(question.id);

    const selectedAnswerIds =
      answer?.selectedAnswerIds ?? [];

    const isAnswered =
      selectedAnswerIds.length > 0;

    const isCorrect = arraysMatch(
      selectedAnswerIds,
      question.correctAnswerIds,
    );

    const current =
      competencyStats.get(question.section) ?? {
        questionCount: 0,
        answeredCount: 0,
        correctCount: 0,
        earnedPoints: 0,
        possiblePoints: 0,
      };

    current.questionCount += 1;
    current.possiblePoints += question.points;

    if (isAnswered) {
      current.answeredCount += 1;
    }

    if (isCorrect) {
      current.correctCount += 1;
      current.earnedPoints += question.points;
    } else {
      const errorId =
        question.errorTypeIfWrong || "knowledge";

      errors.set(
        errorId,
        (errors.get(errorId) ?? 0) + 1,
      );
    }

    competencyStats.set(
      question.section,
      current,
    );
  }

  const competencies: Competency[] =
    DIAGNOSTIC_SECTION_ORDER.map((sectionId) => {
      const stats =
        competencyStats.get(sectionId) ?? {
          questionCount: 0,
          answeredCount: 0,
          correctCount: 0,
          earnedPoints: 0,
          possiblePoints: 0,
        };

      const score =
        stats.possiblePoints > 0
          ? Math.round(
              (stats.earnedPoints /
                stats.possiblePoints) *
                100,
            )
          : 0;

      return {
        id: sectionId,
        label:
          DIAGNOSTIC_SECTION_LABELS[sectionId],
        ...stats,
        score,
        status: getStatus(score),
      };
    });

  const sortedBest = [...competencies].sort(
    (first, second) =>
      second.score - first.score,
  );

  const sortedWeakest = [...competencies].sort(
    (first, second) =>
      first.score - second.score,
  );

  const strengths: Strength[] = sortedBest
    .filter((competency) => competency.score >= 40)
    .slice(0, 3)
    .map((competency, index) => ({
      rank: index + 1,
      sectionId: competency.id,
      label: competency.label,
      score: competency.score,
      status: competency.status.label,
    }));

  const priorities: Priority[] = sortedWeakest
    .slice(0, 3)
    .map((competency, index) => ({
      rank: index + 1,
      sectionId: competency.id,
      label: competency.label,
      score: competency.score,
      status: competency.status.label,
      reason: getPriorityReason(
        competency.label,
        competency.score,
      ),
    }));

  const highRiskSignals: RiskSignal[] = [];

  if (attempt.overconfidence_errors > 0) {
    highRiskSignals.push({
      id: "overconfidence",
      label: "Fausses certitudes",
      value: attempt.overconfidence_errors,
      severity:
        attempt.overconfidence_errors >= 5
          ? "élevée"
          : "modérée",
    });
  }

  if (attempt.slow_answers > 0) {
    highRiskSignals.push({
      id: "time",
      label: "Réponses trop lentes",
      value: attempt.slow_answers,
      severity:
        attempt.slow_answers >= 5
          ? "élevée"
          : "modérée",
    });
  }

  if (attempt.unanswered_questions > 0) {
    highRiskSignals.push({
      id: "unanswered",
      label: "Questions sans réponse",
      value: attempt.unanswered_questions,
      severity: "élevée",
    });
  }

  const errorProfile: ErrorProfileItem[] =
    Array.from(errors.entries())
      .map(([id, count]) => ({
        id,
        label:
          ERROR_LABELS[id] ??
          "Erreur non classée",
        count,
      }))
      .sort(
        (first, second) =>
          second.count - first.count,
      );

  const totalXp = stored.totalXp ?? 0;
  const maximumModuleXp = 300;
  const level =
    Math.floor(totalXp / maximumModuleXp) + 1;

  const xpInsideLevel =
    totalXp % maximumModuleXp;

  const progressToNextLevelPercent =
    Math.round(
      (xpInsideLevel / maximumModuleXp) * 100,
    );

  const trophies: Trophy[] = (
    stored.trophies ?? []
  ).map((trophy) => ({
    id: trophy.id,
    name:
      trophy.metadata?.name ??
      (trophy.id === "starting-point"
        ? "Point de départ"
        : trophy.id),
    description:
      trophy.metadata?.description ??
      (trophy.id === "starting-point"
        ? "Terminer honnêtement son diagnostic initial."
        : "Récompense obtenue dans PARZI Academy."),
    rarity:
      trophy.id === "starting-point"
        ? "COMMON"
        : "UNCOMMON",
    visibility: "private",
  }));

  return {
    reportId: attempt.id,
    version: "1.0.0",
    generatedAt: attempt.created_at,
    summary: {
      scorePercent: attempt.score_percent,
      pointsEarned: attempt.points_earned,
      pointsPossible: attempt.points_possible,
      completionRatePercent:
        attempt.question_count > 0
          ? Math.round(
              ((attempt.question_count -
                attempt.unanswered_questions) /
                attempt.question_count) *
                100,
            )
          : 0,
      initialLevel: getInitialLevel(
        attempt.score_percent,
      ),
    },
    competencies,
    strengths,
    priorities,
    riskSignals: {
      overconfidenceErrors:
        attempt.overconfidence_errors,
      slowAnswers: attempt.slow_answers,
      unansweredQuestions:
        attempt.unanswered_questions,
      highRiskSignals,
    },
    errorProfile,
    progression: {
      xpEarned: totalXp,
      maximumModuleXp,
      level,
      levelName:
        level === 1
          ? "Découverte"
          : level < 5
            ? "Fondations"
            : "Progression",
      xpRequiredForNextLevel:
        maximumModuleXp,
      progressToNextLevelPercent,
      levelUpReady:
        progressToNextLevelPercent >= 100,
    },
    trophies: {
      unlockedCount: trophies.length,
      unlocked: trophies,
    },
    studyPlan: {
      durationDays: 14,
      recommendedSessionMinutes: 45,
      sessionsPerWeek: 5,
      days: buildStudyPlan(priorities),
    },
  };
}
