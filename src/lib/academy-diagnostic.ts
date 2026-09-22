import fs from "node:fs";
import path from "node:path";

const DIAGNOSTIC_DIRECTORY = path.join(
  process.cwd(),
  "content",
  "academy",
  "module-00-diagnostic",
);

const QUESTION_FILES = [
  "questions.json",
  "questions-batch-02.json",
  "questions-batch-03.json",
  "questions-batch-04.json",
];

export const DIAGNOSTIC_SECTION_LABELS: Record<
  string,
  string
> = {
  "legal-reading": "Lecture juridique",
  contracts: "Contrats et mandats",
  "sport-environment": "Écosystème sportif",
  "football-regulations": "Règlements du football",
  "practical-cases": "Cas pratiques",
  "exam-method": "Méthode d’examen",
};

export const DIAGNOSTIC_SECTION_ORDER = [
  "legal-reading",
  "contracts",
  "sport-environment",
  "football-regulations",
  "practical-cases",
  "exam-method",
] as const;

type RawOption =
  | string
  | {
      id?: string | number;
      value?: string | number;
      label?: string;
      text?: string;
    };

type RawQuestion = {
  id?: string;
  section?: string;
  skill?: string;
  difficulty?: string | number;
  type?: string;
  title?: string;
  statement?: string;
  options?: RawOption[];
  correctAnswerIds?: Array<string | number>;
  correctAnswerId?: string | number;
  answer?: string | number | Array<string | number>;
  explanation?: string;
  trap?: string;
  errorTypeIfWrong?: string;
  points?: number;
  estimatedSeconds?: number;
  confidenceRequired?: boolean;
};

export type DiagnosticOption = {
  id: string;
  label: string;
};

export type DiagnosticPublicQuestion = {
  id: string;
  section: string;
  sectionLabel: string;
  skill: string;
  difficulty: string;
  type: string;
  title: string;
  statement: string;
  options: DiagnosticOption[];
  isMultiple: boolean;
  estimatedSeconds: number;
};

export type DiagnosticPrivateQuestion =
  DiagnosticPublicQuestion & {
    correctAnswerIds: string[];
    explanation: string;
    trap: string;
    errorTypeIfWrong: string;
    points: number;
  };

function extractQuestions(parsed: unknown): RawQuestion[] {
  if (Array.isArray(parsed)) {
    return parsed as RawQuestion[];
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "questions" in parsed &&
    Array.isArray(
      (parsed as { questions?: unknown }).questions,
    )
  ) {
    return (
      parsed as { questions: RawQuestion[] }
    ).questions;
  }

  return [];
}

function normalizeOption(
  option: RawOption,
  index: number,
): DiagnosticOption {
  if (typeof option === "string") {
    return {
      id: `option-${index + 1}`,
      label: option,
    };
  }

  const explicitId =
    option.id !== undefined
      ? String(option.id)
      : option.value !== undefined
        ? String(option.value)
        : `option-${index + 1}`;

  return {
    id: explicitId,
    label:
      option.label ??
      option.text ??
      (option.value !== undefined
        ? String(option.value)
        : `Réponse ${index + 1}`),
  };
}

function resolveAnswerId(
  answer: string | number,
  options: DiagnosticOption[],
): string | null {
  const token = String(answer).trim();

  const directMatch = options.find(
    (option) => option.id === token,
  );

  if (directMatch) {
    return directMatch.id;
  }

  const labelMatch = options.find(
    (option) => option.label === token,
  );

  if (labelMatch) {
    return labelMatch.id;
  }

  if (/^[A-Z]$/i.test(token)) {
    const letterIndex =
      token.toUpperCase().charCodeAt(0) -
      "A".charCodeAt(0);

    return options[letterIndex]?.id ?? null;
  }

  if (/^\d+$/.test(token)) {
    const numericValue = Number(token);

    return (
      options[numericValue]?.id ??
      options[numericValue - 1]?.id ??
      null
    );
  }

  return null;
}

function normalizeCorrectAnswerIds(
  question: RawQuestion,
  options: DiagnosticOption[],
): string[] {
  let rawAnswers: Array<string | number> = [];

  if (Array.isArray(question.correctAnswerIds)) {
    rawAnswers = question.correctAnswerIds;
  } else if (
    question.correctAnswerId !== undefined
  ) {
    rawAnswers = [question.correctAnswerId];
  } else if (Array.isArray(question.answer)) {
    rawAnswers = question.answer;
  } else if (question.answer !== undefined) {
    rawAnswers = [question.answer];
  }

  return Array.from(
    new Set(
      rawAnswers
        .map((answer) =>
          resolveAnswerId(answer, options),
        )
        .filter(
          (answerId): answerId is string =>
            typeof answerId === "string",
        ),
    ),
  );
}

function normalizeQuestion(
  question: RawQuestion,
): DiagnosticPrivateQuestion | null {
  if (
    typeof question.id !== "string" ||
    !/^diag-\d{3}$/.test(question.id)
  ) {
    return null;
  }

  const options = (question.options ?? []).map(
    normalizeOption,
  );

  if (options.length < 2) {
    return null;
  }

  const correctAnswerIds =
    normalizeCorrectAnswerIds(question, options);

  return {
    id: question.id,
    section: question.section ?? "unknown",
    sectionLabel:
      DIAGNOSTIC_SECTION_LABELS[
        question.section ?? ""
      ] ?? "Compétence générale",
    skill: question.skill ?? "",
    difficulty: String(
      question.difficulty ?? "standard",
    ),
    type: question.type ?? "single-choice",
    title:
      question.title ??
      `Question ${question.id.replace("diag-", "")}`,
    statement:
      question.statement ??
      "Énoncé indisponible.",
    options,
    isMultiple:
      correctAnswerIds.length > 1 ||
      String(question.type)
        .toLowerCase()
        .includes("multiple"),
    estimatedSeconds:
      typeof question.estimatedSeconds === "number"
        ? question.estimatedSeconds
        : 60,
    correctAnswerIds,
    explanation: question.explanation ?? "",
    trap: question.trap ?? "",
    errorTypeIfWrong:
      question.errorTypeIfWrong ?? "knowledge",
    points:
      typeof question.points === "number"
        ? question.points
        : 1,
  };
}

export function loadPrivateDiagnosticQuestions(): DiagnosticPrivateQuestion[] {
  const questionsById = new Map<
    string,
    DiagnosticPrivateQuestion
  >();

  for (const filename of QUESTION_FILES) {
    const filePath = path.join(
      DIAGNOSTIC_DIRECTORY,
      filename,
    );

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const parsed = JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    ) as unknown;

    for (const rawQuestion of extractQuestions(parsed)) {
      const question = normalizeQuestion(rawQuestion);

      if (
        question &&
        !questionsById.has(question.id)
      ) {
        questionsById.set(question.id, question);
      }
    }
  }

  return Array.from(questionsById.values())
    .sort((first, second) =>
      first.id.localeCompare(second.id),
    )
    .slice(0, 40);
}

export function loadPublicDiagnosticQuestions(): DiagnosticPublicQuestion[] {
  return loadPrivateDiagnosticQuestions().map(
    ({
      correctAnswerIds: _correctAnswerIds,
      explanation: _explanation,
      trap: _trap,
      errorTypeIfWrong: _errorTypeIfWrong,
      points: _points,
      ...publicQuestion
    }) => publicQuestion,
  );
}
