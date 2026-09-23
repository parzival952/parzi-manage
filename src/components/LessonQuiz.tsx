"use client";

import Link from "next/link";
import { useState } from "react";

import ConfidenceGauge from "@/components/ConfidenceGauge";
import type { ConfidenceValue } from "@/lib/academy-confidence";
import AcademyIcon, { IconTile } from "@/components/AcademyIcon";

type Question = {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
};

type Result = {
  already: boolean;
  xpGained: number;
  score: number;
  previousXp: number;
  totalXp: number;
  leveledUp: boolean;
  newLevel: number;
  streak: number;
};

export default function LessonQuiz({
  questions,
  onComplete,
  isMission = false,
}: {
  questions: Question[];
  onComplete: (
    answers: number[],
    confidences: ConfidenceValue[],
  ) => Promise<Result>;
  isMission?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<
    Array<number | null>
  >(
    () => questions.map(() => null),
  );
  const [confidences, setConfidences] = useState<
    Array<ConfidenceValue | 0>
  >(() => questions.map(() => 0));
  const [locked, setLocked] =
    useState(false);
  const [result, setResult] =
    useState<Result | null>(null);
  const [saving, setSaving] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const question = questions[step];
  const picked = answers[step];
  const confidence = confidences[step];
  const canValidate =
    picked !== null && confidence !== 0;
  const isLast =
    step === questions.length - 1;

  function choose(optionIndex: number) {
    if (locked) {
      return;
    }

    setAnswers((previous) => {
      const next = [...previous];
      next[step] = optionIndex;
      return next;
    });

    setErrorMessage("");
  }

  function chooseConfidence(value: ConfidenceValue) {
    if (locked) {
      return;
    }

    setConfidences((previous) => {
      const next = [...previous];
      next[step] = value;
      return next;
    });
  }

  // La correction ne s'affiche qu'une fois la réponse ET l'assurance données :
  // sinon la jauge n'aurait aucun sens.
  function validateStep() {
    if (!canValidate) {
      return;
    }

    setLocked(true);
  }

  async function next() {
    if (picked === null) {
      return;
    }

    if (!isLast) {
      setStep((current) => current + 1);
      setLocked(false);
      return;
    }

    const completedAnswers =
      answers.map((answer) =>
        answer === null ? -1 : answer,
      );
    const completedConfidences =
      confidences.map((value) =>
        value === 0 ? 3 : value,
      ) as ConfidenceValue[];

    setSaving(true);
    setErrorMessage("");

    try {
      const response =
        await onComplete(
          completedAnswers,
          completedConfidences,
        );

      setResult(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer la leçon.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    return (
      <div className="pz-card p-6 text-center pz-rise">
        <div className="mb-3 flex justify-center">
          <IconTile
            size={56}
            name={
              result.leveledUp
                ? "medal"
                : result.already
                  ? "book"
                  : result.score >= 70
                    ? "check"
                    : "revision"
            }
            tone={result.leveledUp ? "var(--or)" : result.score >= 70 ? "var(--vert)" : "var(--argent)"}
          />
        </div>

        <h2 className="text-[20px] font-extrabold mb-1">
          {result.already
            ? "Leçon révisée"
            : result.leveledUp
              ? `Niveau ${result.newLevel} atteint !`
              : result.score >= 70
                ? "Mission validée"
                : "Entraînement terminé"}
        </h2>

        <p className="text-[13.5px] pz-muted">
          Score vérifié par PARZI Academy :
        </p>

        <strong
          className="block text-[34px] font-black mt-2"
          style={{
            color:
              result.score >= 70
                ? "var(--vert)"
                : "var(--ambre)",
          }}
        >
          {result.score} %
        </strong>

        {result.already ? (
          <p className="text-[12px] leading-5 pz-muted mt-3">
            Cette leçon avait déjà été validée. La
            révision reste utile, mais aucun nouvel XP
            n’est attribué.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div
              className="rounded-2xl p-3"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              <strong className="block text-[19px] pz-red">
                +{result.xpGained}
              </strong>

              <span className="text-[9px] pz-muted">
                XP gagnés
              </span>
            </div>

            <div
              className="rounded-2xl p-3"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              <strong className="block text-[19px]">
                {result.totalXp}
              </strong>

              <span className="text-[9px] pz-muted">
                XP total
              </span>
            </div>

            <div
              className="rounded-2xl p-3"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              <strong className="flex items-center justify-center gap-1.5 text-[19px] pz-mono">
                <AcademyIcon name="flame" size={16} style={{ color: "var(--rouge-vif)" }} /> {result.streak}
              </strong>

              <span className="text-[9px] pz-muted">
                jours de série
              </span>
            </div>
          </div>
        )}

        {result.score < 70 ? (
          <div
            className="rounded-2xl p-4 mt-5 text-left"
            style={{
              background:
                "rgba(240,179,92,.07)",
              border:
                "1px solid rgba(240,179,92,.22)",
            }}
          >
            <strong className="text-[12px]">
              Mission à consolider
            </strong>

            <p className="text-[10.5px] leading-5 pz-muted mt-1">
              Relis les explications puis refais le quiz.
              Ton premier passage est enregistré, mais la
              maîtrise réelle demande au moins 70 %.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 mt-6">
          <Link
            href="/academy"
            className="pz-btn w-full"
          >
            Continuer mon parcours
          </Link>

          {isMission ? (
            <Link
              href="/academy/diagnostic/resultats#plan-revision"
              className="min-h-[48px] rounded-2xl flex items-center justify-center text-[12px] font-bold"
              style={{
                background:
                  "rgba(var(--ink-rgb),.035)",
                border:
                  "1px solid var(--ligne)",
              }}
            >
              Retour à mon plan de 14 jours
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="pz-card p-6 pz-rise">
      <div className="flex items-center gap-2 mb-4">
        {questions.map(
          (_, questionIndex) => (
            <div
              key={questionIndex}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  questionIndex <= step
                    ? "var(--rouge)"
                    : "rgba(var(--ink-rgb),.1)",
              }}
            />
          ),
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] pz-muted">
          Question {step + 1} /{" "}
          {questions.length}
        </span>

        <span className="text-[10px] pz-muted">
          Score vérifié côté serveur
        </span>
      </div>

      <h3 className="text-[16.5px] font-bold mb-4">
        {question.q}
      </h3>

      <div className="flex flex-col gap-2.5">
        {question.options.map(
          (option, optionIndex) => {
            let className = "pz-opt";

            if (
              locked &&
              optionIndex === question.answer
            ) {
              className += " correct";
            } else if (
              locked &&
              optionIndex === picked
            ) {
              className += " wrong";
            }

            const pendingPick =
              !locked && optionIndex === picked;

            return (
              <button
                key={optionIndex}
                type="button"
                className={className}
                onClick={() =>
                  choose(optionIndex)
                }
                disabled={locked}
                style={
                  pendingPick
                    ? {
                        borderColor: "var(--rouge)",
                        background: "rgba(194,24,51,.10)",
                      }
                    : undefined
                }
              >
                {option}
              </button>
            );
          },
        )}
      </div>

      <ConfidenceGauge
        value={confidence}
        onChange={chooseConfidence}
        disabled={locked}
      />

      {locked ? (
        <div
          className="rounded-2xl p-4 mt-4 pz-rise"
          style={{
            background:
              picked === question.answer
                ? "rgba(37,194,110,.07)"
                : "rgba(194,24,51,.06)",
            border:
              picked === question.answer
                ? "1px solid rgba(37,194,110,.2)"
                : "1px solid rgba(194,24,51,.18)",
          }}
        >
          <strong
            className="text-[12px]"
            style={{
              color:
                picked === question.answer
                  ? "var(--vert)"
                  : "var(--rouge-clair)",
            }}
          >
            {picked === question.answer
              ? "Bonne réponse"
              : "Réponse incorrecte"}
          </strong>

          <p className="text-[12px] leading-5 pz-muted mt-1">
            {question.explain ??
              (picked === question.answer
                ? "Tu as correctement identifié la règle attendue."
                : `La bonne réponse était : ${question.options[question.answer]}.`)}
          </p>

          {picked !== question.answer && confidence === 5 ? (
            <p className="text-[11.5px] leading-5 mt-2" style={{ color: "var(--ambre)" }}>
              <AcademyIcon name="alert" size={13} style={{ marginRight: 5 }} />
              {"Fausse certitude : tu étais certain (5/5). C'est l'erreur la plus coûteuse sur le terrain — elle part en priorité dans ton carnet de révision."}
            </p>
          ) : null}
          {picked === question.answer && confidence <= 2 ? (
            <p className="text-[11.5px] leading-5 pz-muted mt-2">
              {"Bonne réponse, mais peu assurée : ta compétence sera remise plus tôt en révision pour la consolider."}
            </p>
          ) : null}
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="rounded-2xl p-4 mt-4 text-[11px]"
          style={{
            color: "var(--ambre)",
            background:
              "rgba(240,179,92,.07)",
            border:
              "1px solid rgba(240,179,92,.22)",
          }}
        >
          <AcademyIcon name="alert" size={13} style={{ marginRight: 5 }} />
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        className="pz-btn w-full mt-5"
        onClick={locked ? next : validateStep}
        disabled={
          saving || (!locked && !canValidate)
        }
      >
        {saving
          ? "Vérification sécurisée…"
          : !locked
            ? picked === null
              ? "Choisis une réponse"
              : confidence === 0
                ? "Indique ton niveau d’assurance"
                : "Valider ma réponse"
            : isLast
              ? "Terminer et vérifier la mission"
              : "Question suivante"}
      </button>
    </div>
  );
}
