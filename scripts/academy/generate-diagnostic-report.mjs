import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const repositoryRoot = path.resolve(currentDirectory, "../..");

const diagnosticDirectory = path.join(
  repositoryRoot,
  "content/academy/module-00-diagnostic"
);

const questionsPath = path.join(
  diagnosticDirectory,
  "questions.json"
);

const scoringPath = path.join(
  diagnosticDirectory,
  "scoring.json"
);

const rewardsPath = path.join(
  diagnosticDirectory,
  "rewards.json"
);

const reportConfigPath = path.join(
  diagnosticDirectory,
  "report-config.json"
);

const defaultOutputPath = path.join(
  diagnosticDirectory,
  "report-preview.json"
);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable : ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true
  });

  fs.writeFileSync(
    filePath,
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function getArgument(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function normalizeAnswers(answerIds) {
  if (!Array.isArray(answerIds)) {
    return [];
  }

  return [...new Set(answerIds)].sort();
}

function answersAreEqual(selectedAnswerIds, correctAnswerIds) {
  const selected = normalizeAnswers(selectedAnswerIds);
  const correct = normalizeAnswers(correctAnswerIds);

  return JSON.stringify(selected) === JSON.stringify(correct);
}

function round(value, decimals = 0) {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}

function percentage(earned, possible) {
  if (!possible) {
    return 0;
  }

  return round((earned / possible) * 100);
}

function findStatus(score, statuses) {
  return (
    statuses.find(
      status =>
        score >= status.minimum &&
        score <= status.maximum
    ) ?? statuses[0]
  );
}

function chooseWrongAnswer(question) {
  const correctAnswers = new Set(
    question.correctAnswerIds
  );

  const wrongOption = question.options.find(
    option => !correctAnswers.has(option.id)
  );

  return wrongOption ? [wrongOption.id] : [];
}

function createDemoAttempt(questions) {
  const answers = questions.map(
    (question, index) => {
      const questionNumber = index + 1;

      const shouldBeWrong =
        questionNumber % 4 === 0;

      const selectedAnswerIds = shouldBeWrong
        ? chooseWrongAnswer(question)
        : question.correctAnswerIds;

      const confidence =
        shouldBeWrong && questionNumber % 8 === 0
          ? 5
          : shouldBeWrong
            ? 2
            : 4;

      const estimatedSeconds =
        question.estimatedSeconds ?? 60;

      const responseTimeSeconds = Math.round(
        estimatedSeconds *
          (shouldBeWrong ? 1.35 : 0.8)
      );

      return {
        questionId: question.id,
        selectedAnswerIds,
        confidence,
        responseTimeSeconds
      };
    }
  );

  return {
    attemptId: "demo-diagnostic-attempt",
    userId: "demo-user",
    startedAt: new Date(
      Date.now() - 70 * 60 * 1000
    ).toISOString(),
    completedAt: new Date().toISOString(),
    completedActions: [
      "start_diagnostic",
      "complete_positioning_form",
      "complete_diagnostic",
      "review_results",
      "classify_errors",
      "create_first_study_plan"
    ],
    conditionsAchieved: [
      "diagnostic_completed",
      "first_error_review_completed"
    ],
    answers
  };
}

function createStudyPlan(
  priorities,
  reportConfig
) {
  const activities =
    reportConfig.studyPlan.activities;

  const priorityOne =
    priorities[0]?.label ?? "Compétence prioritaire";

  const priorityTwo =
    priorities[1]?.label ?? priorityOne;

  const priorityThree =
    priorities[2]?.label ?? priorityTwo;

  return [
    {
      day: 1,
      focus: priorityOne,
      activity: activities.understand
    },
    {
      day: 2,
      focus: priorityOne,
      activity: activities.apply
    },
    {
      day: 3,
      focus: priorityOne,
      activity: activities.correct
    },
    {
      day: 4,
      focus: priorityTwo,
      activity: activities.understand
    },
    {
      day: 5,
      focus: priorityTwo,
      activity: activities.apply
    },
    {
      day: 6,
      focus: priorityTwo,
      activity: activities.timed
    },
    {
      day: 7,
      focus: "Révision de la première semaine",
      activity: activities.review
    },
    {
      day: 8,
      focus: priorityThree,
      activity: activities.understand
    },
    {
      day: 9,
      focus: priorityThree,
      activity: activities.apply
    },
    {
      day: 10,
      focus: priorityThree,
      activity: activities.correct
    },
    {
      day: 11,
      focus: "Compétences mélangées",
      activity: activities.timed
    },
    {
      day: 12,
      focus: "Méthode du cas pratique",
      activity: activities.case
    },
    {
      day: 13,
      focus: "Carnet d’erreurs",
      activity: activities.review
    },
    {
      day: 14,
      focus: "Évaluation de progression",
      activity: activities.retest
    }
  ];
}

function generateReport({
  questionsData,
  scoringData,
  rewardsData,
  reportConfig,
  attempt
}) {
  const questions = questionsData.questions;

  if (!Array.isArray(questions)) {
    throw new Error(
      "Le fichier questions.json est invalide."
    );
  }

  const answersByQuestionId = new Map(
    (attempt.answers ?? []).map(answer => [
      answer.questionId,
      answer
    ])
  );

  const sections = {};
  const errorCounts = {};
  const detailedAnswers = [];

  let totalPossiblePoints = 0;
  let totalEarnedPoints = 0;
  let answeredQuestions = 0;
  let overconfidenceErrors = 0;
  let slowAnswers = 0;

  for (const question of questions) {
    const answer =
      answersByQuestionId.get(question.id);

    const possiblePoints =
      Number(question.points) || 1;

    totalPossiblePoints += possiblePoints;

    if (!sections[question.section]) {
      sections[question.section] = {
        id: question.section,
        label:
          reportConfig.sectionLabels[
            question.section
          ] ?? question.section,
        questionCount: 0,
        answeredCount: 0,
        correctCount: 0,
        earnedPoints: 0,
        possiblePoints: 0
      };
    }

    const section = sections[question.section];

    section.questionCount += 1;
    section.possiblePoints += possiblePoints;

    const selectedAnswerIds =
      answer?.selectedAnswerIds ?? [];

    const isAnswered =
      selectedAnswerIds.length > 0;

    const isCorrect =
      isAnswered &&
      answersAreEqual(
        selectedAnswerIds,
        question.correctAnswerIds
      );

    const earnedPoints = isCorrect
      ? possiblePoints
      : 0;

    if (isAnswered) {
      answeredQuestions += 1;
      section.answeredCount += 1;
    }

    if (isCorrect) {
      totalEarnedPoints += earnedPoints;
      section.correctCount += 1;
      section.earnedPoints += earnedPoints;
    }

    const confidence =
      Number(answer?.confidence) || null;

    const responseTimeSeconds =
      Number(answer?.responseTimeSeconds) ||
      null;

    const estimatedSeconds =
      Number(question.estimatedSeconds) || 60;

    const isSlow =
      responseTimeSeconds !== null &&
      responseTimeSeconds >
        estimatedSeconds *
          reportConfig.riskRules
            .slowAnswerMultiplier;

    if (isSlow) {
      slowAnswers += 1;
    }

    let errorType = null;

    if (!isCorrect) {
      errorType =
        question.errorTypeIfWrong ??
        "knowledge";

      errorCounts[errorType] =
        (errorCounts[errorType] ?? 0) + 1;

      const overconfidenceMinimum =
        reportConfig.riskRules
          .overconfidenceMinimum;

      if (
        confidence !== null &&
        confidence >= overconfidenceMinimum
      ) {
        overconfidenceErrors += 1;

        errorCounts.overconfidence =
          (errorCounts.overconfidence ?? 0) +
          1;
      }
    }

    detailedAnswers.push({
      questionId: question.id,
      section: question.section,
      skill: question.skill,
      difficulty: question.difficulty,
      answered: isAnswered,
      correct: isCorrect,
      earnedPoints,
      possiblePoints,
      confidence,
      responseTimeSeconds,
      estimatedSeconds,
      slow: isSlow,
      errorType
    });
  }

  const overallScore = percentage(
    totalEarnedPoints,
    totalPossiblePoints
  );

  const overallStatus = findStatus(
    overallScore,
    rewardsData.masteryLevels
  );

  const competencyResults = Object.values(
    sections
  ).map(section => {
    const score = percentage(
      section.earnedPoints,
      section.possiblePoints
    );

    const status = findStatus(
      score,
      reportConfig.sectionStatuses
    );

    return {
      ...section,
      score,
      status: {
        id: status.id,
        label: status.label
      }
    };
  });

  const sortedByScore = [
    ...competencyResults
  ].sort((a, b) => a.score - b.score);

  const priorities = sortedByScore
    .slice(
      0,
      reportConfig.riskRules
        .maximumPriorities
    )
    .map((section, index) => ({
      rank: index + 1,
      sectionId: section.id,
      label: section.label,
      score: section.score,
      status: section.status.label,
      reason:
        section.score <
        reportConfig.riskRules
          .criticalSectionScoreBelow
          ? "Score critique nécessitant une reprise immédiate."
          : section.score <
              reportConfig.riskRules
                .fragileSectionScoreBelow
            ? "Compétence fragile à renforcer rapidement."
            : "Compétence prioritaire par rapport aux autres résultats."
    }));

  const strengths = [...competencyResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((section, index) => ({
      rank: index + 1,
      sectionId: section.id,
      label: section.label,
      score: section.score,
      status: section.status.label
    }));

  const errorProfile = Object.entries(
    errorCounts
  )
    .map(([errorId, count]) => ({
      id: errorId,
      label:
        reportConfig.errorLabels[errorId] ??
        errorId,
      count
    }))
    .sort((a, b) => b.count - a.count);

  const completedActions = new Set(
    attempt.completedActions ?? []
  );

  const earnedXp = rewardsData.xpRules
    .filter(rule =>
      completedActions.has(rule.action)
    )
    .reduce(
      (total, rule) =>
        total + Number(rule.xp || 0),
      0
    );

  const maximumModuleXp =
    rewardsData.xpRules.reduce(
      (total, rule) =>
        total + Number(rule.xp || 0),
      0
    );

  const conditionsAchieved = new Set(
    attempt.conditionsAchieved ?? []
  );

  const unlockedTrophies =
    rewardsData.trophies
      .filter(trophy =>
        conditionsAchieved.has(
          trophy.condition
        )
      )
      .map(trophy => ({
        id: trophy.id,
        name: trophy.name,
        description: trophy.description,
        rarity: trophy.rarity,
        visibility: trophy.visibility
      }));

  const startingLevel =
    rewardsData.startingLevel;

  const progressToNextLevel =
    percentage(
      Math.min(
        earnedXp,
        startingLevel.xpRequiredForNextLevel
      ),
      startingLevel.xpRequiredForNextLevel
    );

  const studyPlan = createStudyPlan(
    priorities,
    reportConfig
  );

  const completionRate = percentage(
    answeredQuestions,
    questions.length
  );

  const highRiskSignals = [];

  if (overconfidenceErrors > 0) {
    highRiskSignals.push({
      id: "overconfidence",
      label: "Fausses certitudes détectées",
      value: overconfidenceErrors,
      severity: "high"
    });
  }

  if (slowAnswers >= 5) {
    highRiskSignals.push({
      id: "time",
      label: "Gestion du temps fragile",
      value: slowAnswers,
      severity: "medium"
    });
  }

  if (completionRate < 100) {
    highRiskSignals.push({
      id: "incomplete",
      label: "Diagnostic incomplet",
      value: 100 - completionRate,
      severity: "high"
    });
  }

  return {
    reportId: reportConfig.reportId,
    version: reportConfig.version,
    generatedAt: new Date().toISOString(),
    attempt: {
      attemptId: attempt.attemptId,
      userId: attempt.userId,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt
    },
    summary: {
      scorePercent: overallScore,
      pointsEarned: totalEarnedPoints,
      pointsPossible: totalPossiblePoints,
      completionRatePercent: completionRate,
      initialLevel: {
        id: overallStatus.label
          .toLowerCase()
          .replaceAll(" ", "-"),
        label: overallStatus.label
      }
    },
    competencies: competencyResults,
    strengths,
    priorities,
    riskSignals: {
      overconfidenceErrors,
      slowAnswers,
      unansweredQuestions:
        questions.length - answeredQuestions,
      highRiskSignals
    },
    errorProfile,
    progression: {
      xpEarned: earnedXp,
      maximumModuleXp,
      level: startingLevel.level,
      levelName: startingLevel.name,
      xpRequiredForNextLevel:
        startingLevel.xpRequiredForNextLevel,
      progressToNextLevelPercent:
        progressToNextLevel,
      levelUpReady:
        earnedXp >=
        startingLevel.xpRequiredForNextLevel
    },
    trophies: {
      unlockedCount:
        unlockedTrophies.length,
      unlocked: unlockedTrophies
    },
    studyPlan: {
      durationDays:
        reportConfig.studyPlan.durationDays,
      recommendedSessionMinutes:
        reportConfig.studyPlan
          .recommendedSessionMinutes,
      sessionsPerWeek:
        reportConfig.studyPlan
          .sessionsPerWeek,
      days: studyPlan
    },
    detailedAnswers
  };
}

function main() {
  const questionsData =
    readJson(questionsPath);

  const scoringData =
    readJson(scoringPath);

  const rewardsData =
    readJson(rewardsPath);

  const reportConfig =
    readJson(reportConfigPath);

  const demoMode =
    process.argv.includes("--demo");

  const attemptArgument =
    getArgument("--attempt");

  const outputArgument =
    getArgument("--output");

  if (!demoMode && !attemptArgument) {
    console.error(
      "Utilisation :\n" +
        "node scripts/academy/generate-diagnostic-report.mjs --demo\n" +
        "ou\n" +
        "node scripts/academy/generate-diagnostic-report.mjs " +
        "--attempt chemin/attempt.json"
    );

    process.exit(1);
  }

  const attempt = demoMode
    ? createDemoAttempt(
        questionsData.questions
      )
    : readJson(
        path.resolve(
          repositoryRoot,
          attemptArgument
        )
      );

  const outputPath = outputArgument
    ? path.resolve(
        repositoryRoot,
        outputArgument
      )
    : defaultOutputPath;

  const report = generateReport({
    questionsData,
    scoringData,
    rewardsData,
    reportConfig,
    attempt
  });

  writeJson(outputPath, report);

  console.log("✅ Rapport généré");
  console.log(
    "✅ Score global :",
    `${report.summary.scorePercent}%`
  );
  console.log(
    "✅ Progression :",
    `${report.progression.xpEarned} XP`
  );
  console.log(
    "✅ Trophées débloqués :",
    report.trophies.unlockedCount
  );
  console.log(
    "✅ Priorité principale :",
    report.priorities[0]?.label ??
      "Aucune"
  );
  console.log(
    "✅ Fichier créé :",
    path.relative(
      repositoryRoot,
      outputPath
    )
  );
}

try {
  main();
} catch (error) {
  console.error(
    "❌ Erreur :",
    error instanceof Error
      ? error.message
      : error
  );

  process.exit(1);
}
