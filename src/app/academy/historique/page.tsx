export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  loadAcademyHistory,
  type AcademyHistoryEvent,
} from "@/lib/academy-history";
import { findLesson } from "@/lib/academy";
import { requireUser } from "@/lib/auth";

function formatEventDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getEventTitle(
  event: AcademyHistoryEvent,
): string {
  if (event.type === "diagnostic") {
    return "Diagnostic initial";
  }

  if (!event.lessonId) {
    return "Leçon Academy";
  }

  return (
    findLesson(event.lessonId)?.lesson.title ??
    event.lessonId
  );
}

function getEventIcon(
  event: AcademyHistoryEvent,
): string {
  if (event.type === "diagnostic") {
    return "🧭";
  }

  if (event.score >= 100) {
    return "🎯";
  }

  if (event.score >= 70) {
    return "✅";
  }

  return "📝";
}

function getScoreTone(score: number): string {
  if (score >= 100) {
    return "var(--vert)";
  }

  if (score >= 70) {
    return "#e9c36a";
  }

  return "#ff6b78";
}

export default async function AcademyHistoryPage() {
  await requireUser();

  const history = await loadAcademyHistory();

  if (!history) {
    redirect("/academy");
  }

  return (
    <main className="flex flex-col gap-6">
      <header className="pz-rise">
        <Link
          href="/academy"
          className="text-[12px] pz-muted hover:text-white"
        >
          ← Retour à PARZI Academy
        </Link>

        <div className="mt-5">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: "var(--vert)" }}
          >
            ACTIVITÉ PERSONNELLE
          </div>

          <h1 className="text-[27px] font-black tracking-tight mt-2">
            Mon historique Academy
          </h1>

          <p className="text-[13px] leading-6 pz-muted mt-2 max-w-[650px]">
            Retrouve tes diagnostics, tes tentatives,
            tes scores, les XP obtenus et les journées
            validées dans ton plan personnalisé.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 pz-rise pz-d1 md:grid-cols-4">
        <article className="pz-card p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
            XP TOTAL
          </div>

          <strong
            className="block text-[24px] mt-2"
            style={{ color: "#e9c36a" }}
          >
            {history.xp}
          </strong>

          <span className="text-[10px] pz-muted">
            progression cumulée
          </span>
        </article>

        <article className="pz-card p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
            LEÇONS VALIDÉES
          </div>

          <strong className="block text-[24px] mt-2">
            {history.completedLessons}
          </strong>

          <span className="text-[10px] pz-muted">
            sur le parcours actuel
          </span>
        </article>

        <article className="pz-card p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
            JOURS DU PLAN
          </div>

          <strong
            className="block text-[24px] mt-2"
            style={{ color: "var(--vert)" }}
          >
            {history.completedPlanDays}/14
          </strong>

          <span className="text-[10px] pz-muted">
            missions terminées
          </span>
        </article>

        <article className="pz-card p-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
            SÉRIE ACTUELLE
          </div>

          <strong className="block text-[24px] mt-2">
            🔥 {history.streak}
          </strong>

          <span className="text-[10px] pz-muted">
            meilleur : {history.bestStreak} jour
            {history.bestStreak > 1 ? "s" : ""}
          </span>
        </article>
      </section>

      <section
        className="pz-card p-5 pz-rise pz-d2"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(228,0,43,.13), transparent 45%), rgba(255,255,255,.02)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.13em] pz-red">
              BILAN DES QUIZ
            </div>

            <h2 className="text-[18px] font-black mt-2">
              Tes performances
            </h2>
          </div>

          <Link
            href="/academy/plan"
            className="text-[11px] font-bold pz-red"
          >
            Voir le plan →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,.035)",
              border: "1px solid var(--ligne)",
            }}
          >
            <strong className="block text-[18px]">
              {history.totalAttempts}
            </strong>

            <span className="text-[9px] pz-muted">
              tentatives
            </span>
          </div>

          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,.035)",
              border: "1px solid var(--ligne)",
            }}
          >
            <strong
              className="block text-[18px]"
              style={{ color: "var(--vert)" }}
            >
              {history.perfectLessons}
            </strong>

            <span className="text-[9px] pz-muted">
              scores parfaits
            </span>
          </div>

          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,.035)",
              border: "1px solid var(--ligne)",
            }}
          >
            <strong className="block text-[18px]">
              {history.events.length}
            </strong>

            <span className="text-[9px] pz-muted">
              événements affichés
            </span>
          </div>
        </div>
      </section>

      <section className="pz-rise pz-d3">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[19px] font-black">
              Chronologie
            </h2>

            <p className="text-[11px] pz-muted mt-1">
              Les activités les plus récentes apparaissent
              en premier.
            </p>
          </div>

          <span className="text-[10px] pz-muted">
            Données sécurisées Supabase
          </span>
        </div>

        {history.events.length === 0 ? (
          <div className="pz-card p-7 text-center">
            <div className="text-[40px]">📚</div>

            <h3 className="text-[18px] font-black mt-3">
              Aucun historique pour le moment
            </h3>

            <p className="text-[12px] pz-muted mt-2">
              Termine ton diagnostic ou une première leçon
              pour commencer à remplir cette page.
            </p>

            <Link
              href="/academy"
              className="pz-btn inline-flex mt-5"
            >
              Commencer mon parcours
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.events.map((event) => {
              const title = getEventTitle(event);
              const icon = getEventIcon(event);
              const scoreTone = getScoreTone(
                event.score,
              );

              return (
                <article
                  key={`${event.type}-${event.id}`}
                  className="pz-card p-4"
                  style={{
                    borderColor:
                      event.planDayNumber !== null
                        ? "rgba(37,194,110,.24)"
                        : undefined,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl grid place-items-center text-[21px] shrink-0"
                      style={{
                        background:
                          "rgba(255,255,255,.045)",
                        border:
                          "1px solid var(--ligne)",
                      }}
                    >
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.13em] pz-muted">
                              {event.type === "diagnostic"
                                ? "DIAGNOSTIC"
                                : event.isRetry
                                  ? "NOUVELLE TENTATIVE"
                                  : "LEÇON"}
                            </span>

                            {event.planDayNumber !== null ? (
                              <span
                                className="rounded-full px-2 py-1 text-[8px] font-bold"
                                style={{
                                  color: "var(--vert)",
                                  background:
                                    "rgba(37,194,110,.08)",
                                  border:
                                    "1px solid rgba(37,194,110,.22)",
                                }}
                              >
                                JOUR {event.planDayNumber} VALIDÉ
                              </span>
                            ) : null}
                          </div>

                          <h3 className="text-[15px] font-extrabold mt-2">
                            {title}
                          </h3>

                          {event.planFocus ? (
                            <p className="text-[11px] pz-muted mt-1">
                              Mission : {event.planFocus}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-right shrink-0">
                          <strong
                            className="block text-[18px]"
                            style={{ color: scoreTone }}
                          >
                            {event.score} %
                          </strong>

                          <span className="text-[9px] pz-muted">
                            {event.correctCount}/
                            {event.questionCount}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] pz-muted">
                        <span>
                          🕒 {formatEventDate(event.createdAt)}
                        </span>

                        <span
                          style={{
                            color:
                              event.xpGained > 0
                                ? "#e9c36a"
                                : undefined,
                          }}
                        >
                          ✦ +{event.xpGained} XP
                        </span>

                        {event.isRetry ? (
                          <span>
                            Révision sans double récompense
                          </span>
                        ) : null}
                      </div>

                      {event.type === "lesson" &&
                      event.lessonId ? (
                        <Link
                          href={`/academy/lecon/${event.lessonId}`}
                          className="inline-flex mt-4 text-[11px] font-bold pz-red"
                        >
                          Revoir cette leçon →
                        </Link>
                      ) : event.type === "diagnostic" ? (
                        <Link
                          href="/academy/diagnostic/resultats"
                          className="inline-flex mt-4 text-[11px] font-bold pz-red"
                        >
                          Voir mon rapport →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
