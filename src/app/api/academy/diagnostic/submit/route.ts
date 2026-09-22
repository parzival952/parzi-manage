import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  DIAGNOSTIC_SECTION_LABELS,
  DIAGNOSTIC_SECTION_ORDER,
  loadPrivateDiagnosticQuestions,
} from "@/lib/academy-diagnostic";
import {
  saveDiagnosticCompletion,
} from "@/lib/academy-diagnostic-store";
import { getUser } from "@/lib/auth";

type SubmittedAnswer = {
  questionId?: string;
  selectedAnswerIds?: string[];
  confidence?: number;
  elapsedSeconds?: number;
};

type SubmitBody = {
  answers?: SubmittedAnswer[];
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

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Ta session a expiré. Reconnecte-toi.",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as
      SubmitBody;

    if (!Array.isArray(body.answers)) {
      return NextResponse.json(
        {
          error:
            "Les réponses envoyées sont invalides.",
        },
        { status: 400 },
      );
    }

    const questions =
      loadPrivateDiagnosticQuestions();

    const answersByQuestionId = new Map(
      body.answers
        .filter(
          (answer) =>
            typeof answer.questionId === "string",
        )
        .map((answer) => [
          answer.questionId as string,
          answer,
        ]),
    );

    let correctCount = 0;
    let pointsEarned = 0;
    let pointsPossible = 0;
    let elapsedSeconds = 0;
    let overconfidenceErrors = 0;
    let slowAnswers = 0;
    let unansweredQuestions = 0;

    const sectionStats = new Map<
      string,
      {
        correctCount: number;
        questionCount: number;
      }
    >();

    for (const question of questions) {
      const answer =
        answersByQuestionId.get(question.id);

      const selectedAnswerIds = Array.isArray(
        answer?.selectedAnswerIds,
      )
        ? answer.selectedAnswerIds.filter(
            (answerId): answerId is string =>
              typeof answerId === "string",
          )
        : [];

      const confidence =
        typeof answer?.confidence === "number"
          ? Math.min(
              5,
              Math.max(0, answer.confidence),
            )
          : 0;

      const questionElapsedSeconds =
        typeof answer?.elapsedSeconds === "number"
          ? Math.max(0, answer.elapsedSeconds)
          : 0;

      const isCorrect = arraysMatch(
        selectedAnswerIds,
        question.correctAnswerIds,
      );

      pointsPossible += question.points;
      elapsedSeconds += questionElapsedSeconds;

      if (isCorrect) {
        correctCount += 1;
        pointsEarned += question.points;
      } else if (confidence >= 4) {
        overconfidenceErrors += 1;
      }

      if (selectedAnswerIds.length === 0) {
        unansweredQuestions += 1;
      }

      if (
        questionElapsedSeconds >
        question.estimatedSeconds * 1.25
      ) {
        slowAnswers += 1;
      }

      const existingSection =
        sectionStats.get(question.section) ?? {
          correctCount: 0,
          questionCount: 0,
        };

      existingSection.questionCount += 1;

      if (isCorrect) {
        existingSection.correctCount += 1;
      }

      sectionStats.set(
        question.section,
        existingSection,
      );
    }

    const sectionResults =
      DIAGNOSTIC_SECTION_ORDER.map(
        (sectionId) => {
          const stats =
            sectionStats.get(sectionId) ?? {
              correctCount: 0,
              questionCount: 0,
            };

          return {
            id: sectionId,
            label:
              DIAGNOSTIC_SECTION_LABELS[
                sectionId
              ],
            correctCount: stats.correctCount,
            questionCount: stats.questionCount,
            scorePercent:
              stats.questionCount > 0
                ? Math.round(
                    (stats.correctCount /
                      stats.questionCount) *
                      100,
                  )
                : 0,
          };
        },
      );

    const scorePercent =
      pointsPossible > 0
        ? Math.round(
            (pointsEarned / pointsPossible) *
              100,
          )
        : 0;

    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get("pm_at")?.value;

    const persistence = accessToken
      ? await saveDiagnosticCompletion({
          accessToken,
          scorePercent,
          correctCount,
          questionCount: questions.length,
          pointsEarned,
          pointsPossible,
          elapsedSeconds,
          overconfidenceErrors,
          slowAnswers,
          unansweredQuestions,
          sectionResults,
          answers: body.answers,
        })
      : {
          persisted: false,
          attemptId: null,
          xpAwarded: 0,
          totalXp: null,
          trophyUnlocked: null,
        };

    return NextResponse.json({
      scorePercent,
      correctCount,
      questionCount: questions.length,
      pointsEarned,
      pointsPossible,
      elapsedSeconds,
      overconfidenceErrors,
      slowAnswers,
      unansweredQuestions,
      sectionResults,
      generatedAt: new Date().toISOString(),
      ...persistence,
    });
  } catch (error) {
    console.error(
      "academy diagnostic submission:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La correction du diagnostic a échoué.",
      },
      { status: 500 },
    );
  }
}
