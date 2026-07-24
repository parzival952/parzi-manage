import type { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

import styles from "./resultats.module.css";

export const metadata: Metadata = {
  title: "Résultats du diagnostic | PARZI Academy",
  description:
    "Rapport personnalisé du diagnostic initial PARZI Academy.",
};

type Competency = {
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

type Strength = {
  rank: number;
  sectionId: string;
  label: string;
  score: number;
  status: string;
};

type Priority = {
  rank: number;
  sectionId: string;
  label: string;
  score: number;
  status: string;
  reason: string;
};

type RiskSignal = {
  id: string;
  label: string;
  value: number;
  severity: string;
};

type ErrorProfileItem = {
  id: string;
  label: string;
  count: number;
};

type Trophy = {
  id: string;
  name: string;
  description: string;
  rarity: string;
  visibility: string;
};

type StudyDay = {
  day: number;
  focus: string;
  activity: string;
};

type DiagnosticReport = {
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

function readDiagnosticReport(): DiagnosticReport {
  const reportPath = path.join(
    process.cwd(),
    "content",
    "academy",
    "module-00-diagnostic",
    "report-preview.json",
  );

  if (!fs.existsSync(reportPath)) {
    throw new Error(
      "Le rapport de diagnostic est introuvable. Exécute le générateur de rapport avant d’ouvrir cette page.",
    );
  }

  return JSON.parse(
    fs.readFileSync(reportPath, "utf8"),
  ) as DiagnosticReport;
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getStatusClass(statusId: string): string {
  const statusClasses: Record<string, string> = {
    critical: styles.statusCritical,
    fragile: styles.statusFragile,
    progressing: styles.statusProgressing,
    operational: styles.statusOperational,
    mastered: styles.statusMastered,
    advanced: styles.statusAdvanced,
  };

  return statusClasses[statusId] ?? styles.statusProgressing;
}

function formatGenerationDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function DiagnosticResultsPage() {
  const report = readDiagnosticReport();

  const score = clampPercentage(
    report.summary.scorePercent,
  );

  const xpProgress = clampPercentage(
    report.progression.progressToNextLevelPercent,
  );

  const competencies = report.competencies ?? [];
  const strengths = report.strengths ?? [];
  const priorities = report.priorities ?? [];
  const riskSignals =
    report.riskSignals?.highRiskSignals ?? [];
  const errorProfile = report.errorProfile ?? [];
  const trophies = report.trophies?.unlocked ?? [];
  const studyDays = report.studyPlan?.days ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              PARZI ACADEMY · MODULE 0
            </p>

            <h1 className={styles.title}>
              Ton rapport de diagnostic
            </h1>

            <p className={styles.subtitle}>
              Voici ton niveau initial, tes forces, tes
              faiblesses prioritaires et ton premier plan de
              progression.
            </p>

            <p className={styles.generatedAt}>
              Rapport généré le{" "}
              {formatGenerationDate(report.generatedAt)}
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link
              href="/academy"
              className={styles.secondaryButton}
            >
              ← Retour à l’Academy
            </Link>

            <a
              href="#plan-revision"
              className={styles.primaryButton}
            >
              Commencer mon parcours
            </a>
          </div>
        </header>

        <section
          className={styles.heroGrid}
          aria-label="Résumé du diagnostic"
        >
          <article className={styles.scoreCard}>
            <div
              className={styles.scoreRing}
              style={{
                background: `conic-gradient(
                  #35d07f ${score}%,
                  rgba(255, 255, 255, 0.08) ${score}% 100%
                )`,
              }}
              role="progressbar"
              aria-label="Score global"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <div className={styles.scoreRingInner}>
                <strong>{score}%</strong>
                <span>Score global</span>
              </div>
            </div>

            <div className={styles.scoreDetails}>
              <span>
                {report.summary.pointsEarned} /{" "}
                {report.summary.pointsPossible} points
              </span>

              <span>
                {report.summary.completionRatePercent}% terminé
              </span>
            </div>

            <div className={styles.levelBadge}>
              {report.summary.initialLevel.label}
            </div>
          </article>

          <article className={styles.xpCard}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.cardLabel}>
                  PROGRESSION ACADEMY
                </p>

                <h2>
                  Niveau {report.progression.level} ·{" "}
                  {report.progression.levelName}
                </h2>
              </div>

              <span className={styles.xpAmount}>
                {report.progression.xpEarned} XP
              </span>
            </div>

            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Progression vers le niveau suivant"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xpProgress}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${xpProgress}%` }}
              />
            </div>

            <div className={styles.progressFooter}>
              <span>{xpProgress}% du niveau complété</span>

              <span>
                Objectif :{" "}
                {report.progression.xpRequiredForNextLevel}{" "}
                XP
              </span>
            </div>

            <div className={styles.xpRule}>
              L’XP récompense ton travail utile, pas seulement
              le temps passé sur la plateforme.
            </div>
          </article>

          <article className={styles.trophyCard}>
            <div className={styles.trophyIcon}>🏆</div>

            <p className={styles.cardLabel}>
              TROPHÉES DÉBLOQUÉS
            </p>

            <strong className={styles.trophyCount}>
              {report.trophies.unlockedCount}
            </strong>

            <span className={styles.trophyText}>
              récompense
              {report.trophies.unlockedCount > 1 ? "s" : ""}{" "}
              obtenue
              {report.trophies.unlockedCount > 1 ? "s" : ""}
            </span>

            <div className={styles.trophyMiniList}>
              {trophies.slice(0, 2).map((trophy) => (
                <div
                  key={trophy.id}
                  className={styles.trophyMini}
                >
                  <strong>{trophy.name}</strong>
                  <span>{trophy.description}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                CARTE DE COMPÉTENCES
              </p>

              <h2>Tes six domaines évalués</h2>
            </div>

            <p>
              Les scores servent à personnaliser la suite de
              ta formation. Ils ne remplacent pas une
              validation officielle.
            </p>
          </div>

          <div className={styles.competencyGrid}>
            {competencies.map((competency) => {
              const competencyScore = clampPercentage(
                competency.score,
              );

              return (
                <article
                  key={competency.id}
                  className={styles.competencyCard}
                >
                  <div className={styles.competencyHeader}>
                    <h3>{competency.label}</h3>

                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        competency.status.id,
                      )}`}
                    >
                      {competency.status.label}
                    </span>
                  </div>

                  <div className={styles.competencyScore}>
                    <strong>{competencyScore}%</strong>

                    <span>
                      {competency.correctCount} bonne
                      {competency.correctCount > 1
                        ? "s"
                        : ""}{" "}
                      réponse
                      {competency.correctCount > 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div
                    className={styles.smallProgressTrack}
                    role="progressbar"
                    aria-label={`Score en ${competency.label}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={competencyScore}
                  >
                    <div
                      className={styles.smallProgressFill}
                      style={{
                        width: `${competencyScore}%`,
                      }}
                    />
                  </div>

                  <div className={styles.competencyFooter}>
                    <span>
                      {competency.earnedPoints} /{" "}
                      {competency.possiblePoints} points
                    </span>

                    <span>
                      {competency.answeredCount} /{" "}
                      {competency.questionCount} traitées
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.twoColumns}>
          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <span className={styles.panelIcon}>⚡</span>

              <div>
                <p className={styles.cardLabel}>
                  POINTS FORTS
                </p>
                <h2>Ce que tu maîtrises déjà</h2>
              </div>
            </div>

            <div className={styles.rankingList}>
              {strengths.map((strength) => (
                <div
                  key={strength.sectionId}
                  className={styles.rankingItem}
                >
                  <span className={styles.rankingNumber}>
                    {strength.rank}
                  </span>

                  <div>
                    <strong>{strength.label}</strong>
                    <span>{strength.status}</span>
                  </div>

                  <b>{strength.score}%</b>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <span className={styles.panelIcon}>🎯</span>

              <div>
                <p className={styles.cardLabel}>
                  PRIORITÉS
                </p>
                <h2>Les trois domaines à renforcer</h2>
              </div>
            </div>

            <div className={styles.priorityList}>
              {priorities.map((priority) => (
                <div
                  key={priority.sectionId}
                  className={styles.priorityItem}
                >
                  <div className={styles.priorityTop}>
                    <span>
                      Priorité {priority.rank}
                    </span>

                    <strong>{priority.score}%</strong>
                  </div>

                  <h3>{priority.label}</h3>
                  <p>{priority.reason}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.twoColumns}>
          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <span className={styles.panelIcon}>⚠️</span>

              <div>
                <p className={styles.cardLabel}>
                  SIGNAUX DE RISQUE
                </p>
                <h2>Ce qui peut provoquer un échec</h2>
              </div>
            </div>

            {riskSignals.length > 0 ? (
              <div className={styles.alertList}>
                {riskSignals.map((risk) => (
                  <div
                    key={risk.id}
                    className={styles.alertItem}
                  >
                    <div>
                      <strong>{risk.label}</strong>
                      <span>
                        Niveau de vigilance :{" "}
                        {risk.severity}
                      </span>
                    </div>

                    <b>{risk.value}</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Aucun signal de risque critique détecté.
              </div>
            )}

            <div className={styles.riskStats}>
              <div>
                <strong>
                  {report.riskSignals.overconfidenceErrors}
                </strong>
                <span>fausses certitudes</span>
              </div>

              <div>
                <strong>{report.riskSignals.slowAnswers}</strong>
                <span>réponses trop lentes</span>
              </div>

              <div>
                <strong>
                  {report.riskSignals.unansweredQuestions}
                </strong>
                <span>questions sans réponse</span>
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeading}>
              <span className={styles.panelIcon}>🧠</span>

              <div>
                <p className={styles.cardLabel}>
                  CARNET D’ERREURS
                </p>
                <h2>Pourquoi tu t’es trompé</h2>
              </div>
            </div>

            <div className={styles.errorList}>
              {errorProfile.map((error) => (
                <div
                  key={error.id}
                  className={styles.errorItem}
                >
                  <span>{error.label}</span>

                  <div>
                    <div
                      className={styles.errorBar}
                      style={{
                        width: `${Math.min(
                          100,
                          error.count * 14,
                        )}%`,
                      }}
                    />
                  </div>

                  <strong>{error.count}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>RÉCOMPENSES</p>
              <h2>Tes premiers trophées Academy</h2>
            </div>

            <p>
              Les trophées importants sont liés à une preuve
              de progression. Ils ne peuvent pas être achetés.
            </p>
          </div>

          <div className={styles.trophiesGrid}>
            {trophies.map((trophy) => (
              <article
                key={trophy.id}
                className={styles.fullTrophyCard}
              >
                <div className={styles.fullTrophyIcon}>🏅</div>

                <div>
                  <span className={styles.rarity}>
                    {trophy.rarity}
                  </span>

                  <h3>{trophy.name}</h3>
                  <p>{trophy.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.section}
          id="plan-revision"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                PLAN PERSONNALISÉ
              </p>

              <h2>
                Ton programme de révision sur{" "}
                {report.studyPlan.durationDays} jours
              </h2>
            </div>

            <p>
              {report.studyPlan.sessionsPerWeek} séances par
              semaine · Environ{" "}
              {report.studyPlan.recommendedSessionMinutes}{" "}
              minutes par séance.
            </p>
          </div>

          <div className={styles.studyPlan}>
            {studyDays.map((studyDay) => (
              <article
                key={studyDay.day}
                className={styles.studyDay}
              >
                <div className={styles.dayNumber}>
                  <span>Jour</span>
                  <strong>{studyDay.day}</strong>
                </div>

                <div className={styles.dayContent}>
                  <h3>{studyDay.focus}</h3>
                  <p>{studyDay.activity}</p>
                </div>

                <span className={styles.dayStatus}>
                  À faire
                </span>
              </article>
            ))}
          </div>

          <div className={styles.finalCallout}>
            <div>
              <p className={styles.eyebrow}>
                PREMIÈRE MISSION
              </p>

              <h2>
                Commence par ta priorité numéro 1
              </h2>

              <p>
                {priorities[0]?.label ??
                  "Ton premier module personnalisé"}{" "}
                sera placé en tête de ton parcours.
              </p>
            </div>

            <Link
              href="/academy"
              className={styles.primaryButton}
            >
              Accéder à mon parcours
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
