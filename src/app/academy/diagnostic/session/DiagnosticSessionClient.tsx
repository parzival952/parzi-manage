"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  DiagnosticPublicQuestion,
} from "@/lib/academy-diagnostic";

type QuestionAttempt = {
  selectedAnswerIds: string[];
  confidence: number;
  elapsedSeconds: number;
};

type AttemptsByQuestion = Record<
  string,
  QuestionAttempt
>;

type SectionResult = {
  id: string;
  label: string;
  correctCount: number;
  questionCount: number;
  scorePercent: number;
};

type DiagnosticResult = {
  scorePercent: number;
  correctCount: number;
  questionCount: number;
  pointsEarned: number;
  pointsPossible: number;
  elapsedSeconds: number;
  overconfidenceErrors: number;
  slowAnswers: number;
  unansweredQuestions: number;
  sectionResults: SectionResult[];
  generatedAt: string;
};

type SavedDiagnostic = {
  currentIndex: number;
  attempts: AttemptsByQuestion;
};

const STORAGE_KEY =
  "parzi-academy-diagnostic-v1";

const CONFIDENCE_LEVELS = [
  {
    value: 1,
    shortLabel: "1",
    label: "Au hasard",
  },
  {
    value: 2,
    shortLabel: "2",
    label: "Peu sûr",
  },
  {
    value: 3,
    shortLabel: "3",
    label: "Moyen",
  },
  {
    value: 4,
    shortLabel: "4",
    label: "Confiant",
  },
  {
    value: 5,
    shortLabel: "5",
    label: "Certain",
  },
];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

function createEmptyAttempt(): QuestionAttempt {
  return {
    selectedAnswerIds: [],
    confidence: 0,
    elapsedSeconds: 0,
  };
}

export default function DiagnosticSessionClient({
  questions,
}: {
  questions: DiagnosticPublicQuestion[];
}) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [attempts, setAttempts] =
    useState<AttemptsByQuestion>({});

  const [isRestored, setIsRestored] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [result, setResult] =
    useState<DiagnosticResult | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const currentQuestion =
    questions[currentIndex] ?? null;

  const currentAttempt = currentQuestion
    ? attempts[currentQuestion.id] ??
      createEmptyAttempt()
    : createEmptyAttempt();

  const completedCount = useMemo(
    () =>
      questions.filter((question) => {
        const attempt = attempts[question.id];

        return (
          attempt &&
          attempt.selectedAnswerIds.length > 0 &&
          attempt.confidence > 0
        );
      }).length,
    [attempts, questions],
  );

  const totalElapsedSeconds = useMemo(
    () =>
      Object.values(attempts).reduce(
        (total, attempt) =>
          total + attempt.elapsedSeconds,
        0,
      ),
    [attempts],
  );

  const progressPercent =
    questions.length > 0
      ? Math.round(
          ((currentIndex + 1) /
            questions.length) *
            100,
        )
      : 0;

  useEffect(() => {
    try {
      const savedValue =
        window.localStorage.getItem(STORAGE_KEY);

      if (savedValue) {
        const saved = JSON.parse(
          savedValue,
        ) as SavedDiagnostic;

        if (
          saved &&
          typeof saved.currentIndex === "number" &&
          saved.attempts
        ) {
          setCurrentIndex(
            Math.min(
              Math.max(saved.currentIndex, 0),
              Math.max(questions.length - 1, 0),
            ),
          );
          setAttempts(saved.attempts);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsRestored(true);
    }
  }, [questions.length]);

  useEffect(() => {
    if (!isRestored || result) {
      return;
    }

    const saved: SavedDiagnostic = {
      currentIndex,
      attempts,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(saved),
    );
  }, [
    attempts,
    currentIndex,
    isRestored,
    result,
  ]);

  useEffect(() => {
    if (!currentQuestion || result) {
      return;
    }

    const interval = window.setInterval(() => {
      setAttempts((previousAttempts) => {
        const existingAttempt =
          previousAttempts[currentQuestion.id] ??
          createEmptyAttempt();

        return {
          ...previousAttempts,
          [currentQuestion.id]: {
            ...existingAttempt,
            elapsedSeconds:
              existingAttempt.elapsedSeconds + 1,
          },
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentQuestion, result]);

  function updateCurrentAttempt(
    update: Partial<QuestionAttempt>,
  ) {
    if (!currentQuestion) {
      return;
    }

    setAttempts((previousAttempts) => {
      const existingAttempt =
        previousAttempts[currentQuestion.id] ??
        createEmptyAttempt();

      return {
        ...previousAttempts,
        [currentQuestion.id]: {
          ...existingAttempt,
          ...update,
        },
      };
    });
  }

  function toggleAnswer(answerId: string) {
    if (!currentQuestion) {
      return;
    }

    if (!currentQuestion.isMultiple) {
      updateCurrentAttempt({
        selectedAnswerIds: [answerId],
      });
      return;
    }

    const selected =
      currentAttempt.selectedAnswerIds.includes(
        answerId,
      );

    updateCurrentAttempt({
      selectedAnswerIds: selected
        ? currentAttempt.selectedAnswerIds.filter(
            (id) => id !== answerId,
          )
        : [
            ...currentAttempt.selectedAnswerIds,
            answerId,
          ],
    });
  }

  function goToPreviousQuestion() {
    setErrorMessage("");
    setCurrentIndex((index) =>
      Math.max(0, index - 1),
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToNextQuestion() {
    if (
      currentAttempt.selectedAnswerIds.length ===
      0
    ) {
      setErrorMessage(
        "Sélectionne au moins une réponse.",
      );
      return;
    }

    if (currentAttempt.confidence === 0) {
      setErrorMessage(
        "Indique ton niveau de confiance.",
      );
      return;
    }

    setErrorMessage("");
    setCurrentIndex((index) =>
      Math.min(
        questions.length - 1,
        index + 1,
      ),
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function submitDiagnostic() {
    if (
      currentAttempt.selectedAnswerIds.length ===
      0
    ) {
      setErrorMessage(
        "Sélectionne au moins une réponse.",
      );
      return;
    }

    if (currentAttempt.confidence === 0) {
      setErrorMessage(
        "Indique ton niveau de confiance.",
      );
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/academy/diagnostic/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: questions.map((question) => {
              const attempt =
                attempts[question.id] ??
                createEmptyAttempt();

              return {
                questionId: question.id,
                selectedAnswerIds:
                  attempt.selectedAnswerIds,
                confidence: attempt.confidence,
                elapsedSeconds:
                  attempt.elapsedSeconds,
              };
            }),
          }),
        },
      );

      const body = (await response.json()) as
        | DiagnosticResult
        | { error: string };

      if (!response.ok || "error" in body) {
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "Impossible de corriger le diagnostic.",
        );
      }

      setResult(body);
      window.localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function restartDiagnostic() {
    const confirmed = window.confirm(
      "Recommencer le diagnostic depuis la première question ?",
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setAttempts({});
    setCurrentIndex(0);
    setResult(null);
    setErrorMessage("");
  }

  if (questions.length === 0) {
    return (
      <section className="pz-card p-6">
        <h1 className="text-[24px] font-black">
          Questions indisponibles
        </h1>

        <p className="pz-muted mt-3">
          Le moteur n’a trouvé aucune question valide.
        </p>

        <Link
          href="/academy/diagnostic"
          className="inline-flex mt-5 pz-red font-bold"
        >
          ← Retour au diagnostic
        </Link>
      </section>
    );
  }

  if (result) {
    return (
      <div
        className="flex flex-col gap-5"
        style={{
          paddingBottom:
            "calc(8rem + env(safe-area-inset-bottom))",
        }}
      >
        <section
          className="pz-card p-6 pz-rise text-center"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(37,194,110,.18), transparent 45%), var(--carte)",
          }}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full grid place-items-center text-[25px] font-black"
            style={{
              color: "var(--vert)",
              background: "rgba(37,194,110,.09)",
              border:
                "2px solid rgba(37,194,110,.32)",
            }}
          >
            {result.scorePercent}%
          </div>

          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.15em] mt-5"
            style={{ color: "var(--vert)" }}
          >
            Diagnostic terminé
          </div>

          <h1 className="text-[28px] font-black mt-2">
            Ton premier résultat réel
          </h1>

          <p className="pz-muted text-[13px] leading-6 mt-3">
            Cette correction vient directement de tes
            réponses. Le rapport détaillé et l’attribution
            réelle des XP seront connectés ensuite.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="pz-card p-4 text-center">
            <strong className="block text-[25px]">
              {result.correctCount}/
              {result.questionCount}
            </strong>
            <span className="pz-muted text-[10px]">
              bonnes réponses
            </span>
          </div>

          <div className="pz-card p-4 text-center">
            <strong className="block text-[25px]">
              {result.pointsEarned}/
              {result.pointsPossible}
            </strong>
            <span className="pz-muted text-[10px]">
              points
            </span>
          </div>

          <div className="pz-card p-4 text-center">
            <strong className="block text-[25px]">
              {formatDuration(
                result.elapsedSeconds,
              )}
            </strong>
            <span className="pz-muted text-[10px]">
              temps total
            </span>
          </div>

          <div className="pz-card p-4 text-center">
            <strong
              className="block text-[25px]"
              style={{
                color:
                  result.overconfidenceErrors > 0
                    ? "#f0b35c"
                    : "var(--vert)",
              }}
            >
              {result.overconfidenceErrors}
            </strong>
            <span className="pz-muted text-[10px]">
              fausses certitudes
            </span>
          </div>
        </section>

        <section className="pz-card p-5">
          <div className="text-[11px] font-bold tracking-wider pz-red">
            RÉSULTATS PAR DOMAINE
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {result.sectionResults.map(
              (section) => (
                <div
                  key={section.id}
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      "rgba(255,255,255,.035)",
                    border:
                      "1px solid var(--ligne)",
                  }}
                >
                  <div className="flex justify-between gap-4">
                    <strong className="text-[12px]">
                      {section.label}
                    </strong>

                    <span className="text-[12px] font-black">
                      {section.scorePercent}%
                    </span>
                  </div>

                  <div className="pz-xpbar mt-3">
                    <div
                      className="pz-xpfill"
                      style={{
                        width: `${section.scorePercent}%`,
                      }}
                    />
                  </div>

                  <div className="pz-muted text-[10px] mt-2">
                    {section.correctCount}/
                    {section.questionCount} réponses
                    correctes
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section
          className="pz-card p-5"
          style={{
            borderColor:
              result.overconfidenceErrors > 0
                ? "rgba(240,179,92,.3)"
                : undefined,
          }}
        >
          <h2 className="text-[17px] font-extrabold">
            Signaux détectés
          </h2>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center">
              <strong className="block">
                {result.overconfidenceErrors}
              </strong>
              <span className="pz-muted text-[9px]">
                fausses certitudes
              </span>
            </div>

            <div className="text-center">
              <strong className="block">
                {result.slowAnswers}
              </strong>
              <span className="pz-muted text-[9px]">
                réponses lentes
              </span>
            </div>

            <div className="text-center">
              <strong className="block">
                {result.unansweredQuestions}
              </strong>
              <span className="pz-muted text-[9px]">
                sans réponse
              </span>
            </div>
          </div>
        </section>

        <Link
          href="/academy/diagnostic/resultats"
          className="min-h-[56px] rounded-2xl flex items-center justify-center text-[14px] font-black"
          style={{
            color: "#06130c",
            background:
              "linear-gradient(135deg, #44dc8c, #20b968)",
          }}
        >
          Voir le modèle du rapport détaillé
        </Link>

        <button
          type="button"
          onClick={restartDiagnostic}
          className="min-h-[52px] rounded-2xl text-[13px] font-bold"
          style={{
            border: "1px solid var(--ligne)",
            background: "rgba(255,255,255,.035)",
          }}
        >
          Recommencer le diagnostic
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const canContinue =
    currentAttempt.selectedAnswerIds.length > 0 &&
    currentAttempt.confidence > 0;

  const isLastQuestion =
    currentIndex === questions.length - 1;

  return (
    <div
      className="flex flex-col gap-4"
      style={{
        paddingBottom:
          "calc(9rem + env(safe-area-inset-bottom))",
      }}
    >
      <section className="pz-card p-4 pz-rise">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div
              className="text-[10px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: "var(--vert)" }}
            >
              {currentQuestion.sectionLabel}
            </div>

            <div className="text-[12px] font-bold mt-1">
              Question {currentIndex + 1} sur{" "}
              {questions.length}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[15px] font-black">
              {formatDuration(
                currentAttempt.elapsedSeconds,
              )}
            </div>

            <div className="pz-muted text-[9px]">
              temps sur cette question
            </div>
          </div>
        </div>

        <div className="pz-xpbar mt-4">
          <div
            className="pz-xpfill"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

        <div className="flex justify-between mt-2 text-[9px] pz-muted">
          <span>{progressPercent}% du diagnostic</span>
          <span>
            {completedCount}/{questions.length} validées
          </span>
        </div>
      </section>

      <section className="pz-card p-5 pz-rise pz-d1">
        <div className="flex items-center justify-between gap-3">
          <span
            className="rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider"
            style={{
              color: "var(--vert)",
              background: "rgba(37,194,110,.08)",
            }}
          >
            {currentQuestion.isMultiple
              ? "Plusieurs réponses possibles"
              : "Une seule réponse"}
          </span>

          <span className="pz-muted text-[10px]">
            ≈{" "}
            {Math.ceil(
              currentQuestion.estimatedSeconds / 60,
            )}{" "}
            min
          </span>
        </div>

        <h1 className="text-[20px] leading-7 font-black mt-5">
          {currentQuestion.title}
        </h1>

        <p className="text-[14px] leading-6 mt-3">
          {currentQuestion.statement}
        </p>

        <div className="flex flex-col gap-3 mt-6">
          {currentQuestion.options.map(
            (option, optionIndex) => {
              const selected =
                currentAttempt.selectedAnswerIds.includes(
                  option.id,
                );

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    toggleAnswer(option.id)
                  }
                  className="w-full flex items-start gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[.99]"
                  style={{
                    background: selected
                      ? "rgba(37,194,110,.1)"
                      : "rgba(255,255,255,.035)",
                    border: selected
                      ? "1px solid rgba(37,194,110,.45)"
                      : "1px solid var(--ligne)",
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-xl grid place-items-center shrink-0 text-[11px] font-black"
                    style={{
                      color: selected
                        ? "#06130c"
                        : "var(--gris)",
                      background: selected
                        ? "var(--vert)"
                        : "rgba(255,255,255,.05)",
                    }}
                  >
                    {String.fromCharCode(
                      65 + optionIndex,
                    )}
                  </span>

                  <span className="text-[13px] leading-5 font-semibold pt-1">
                    {option.label}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </section>

      <section className="pz-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-wider pz-red">
              NIVEAU DE CONFIANCE
            </div>

            <h2 className="text-[16px] font-extrabold mt-1">
              À quel point es-tu sûr ?
            </h2>
          </div>

          <span className="pz-muted text-[10px]">
            Obligatoire
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-5">
          {CONFIDENCE_LEVELS.map((level) => {
            const selected =
              currentAttempt.confidence ===
              level.value;

            return (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  updateCurrentAttempt({
                    confidence: level.value,
                  })
                }
                className="rounded-xl py-3 text-center"
                style={{
                  color: selected
                    ? "#06130c"
                    : "var(--blanc)",
                  background: selected
                    ? "var(--vert)"
                    : "rgba(255,255,255,.04)",
                  border: selected
                    ? "1px solid var(--vert)"
                    : "1px solid var(--ligne)",
                }}
                title={level.label}
              >
                <strong className="block text-[14px]">
                  {level.shortLabel}
                </strong>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 mt-2 text-[9px] pz-muted">
          <span>Au hasard</span>
          <span className="text-center">Moyen</span>
          <span className="text-right">Certain</span>
        </div>
      </section>

      {errorMessage ? (
        <div
          className="rounded-2xl p-4 text-[12px] font-semibold"
          style={{
            color: "#ffc27d",
            background: "rgba(240,179,92,.08)",
            border:
              "1px solid rgba(240,179,92,.24)",
          }}
        >
          ⚠️ {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={goToPreviousQuestion}
          disabled={currentIndex === 0}
          className="min-h-[54px] rounded-2xl text-[13px] font-bold disabled:opacity-35"
          style={{
            color: "var(--blanc)",
            background: "rgba(255,255,255,.035)",
            border: "1px solid var(--ligne)",
          }}
        >
          ← Précédente
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={
            isLastQuestion
              ? submitDiagnostic
              : goToNextQuestion
          }
          className="min-h-[54px] rounded-2xl text-[13px] font-black disabled:opacity-50"
          style={{
            color: "#06130c",
            background: canContinue
              ? "linear-gradient(135deg, #44dc8c, #20b968)"
              : "rgba(120,140,129,.7)",
          }}
        >
          {isSubmitting
            ? "Correction..."
            : isLastQuestion
              ? "Terminer"
              : "Suivante →"}
        </button>
      </div>

      <div className="text-center pz-muted text-[9px]">
        Temps total actuel :{" "}
        {formatDuration(totalElapsedSeconds)}
        {" · "}
        Sauvegarde automatique activée
      </div>
    </div>
  );
}
