import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnostic initial | PARZI Academy",
  description:
    "Évalue ton niveau initial et obtiens un parcours de formation personnalisé.",
};

type DiagnosticQuestion = {
  id?: string;
  section?: string;
  estimatedSeconds?: number;
};

const QUESTION_FILES = [
  "questions.json",
  "questions-batch-02.json",
  "questions-batch-03.json",
  "questions-batch-04.json",
];

const SECTION_LABELS: Record<string, string> = {
  "legal-reading": "Lecture juridique",
  contracts: "Contrats et mandats",
  "sport-environment": "Écosystème sportif",
  "football-regulations": "Règlements du football",
  "practical-cases": "Cas pratiques",
  "exam-method": "Méthode d’examen",
};

const SECTION_ORDER = [
  "legal-reading",
  "contracts",
  "sport-environment",
  "football-regulations",
  "practical-cases",
  "exam-method",
] as const;

function extractQuestions(filePath: string): DiagnosticQuestion[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const parsed = JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as unknown;

  if (Array.isArray(parsed)) {
    return parsed as DiagnosticQuestion[];
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
      parsed as { questions: DiagnosticQuestion[] }
    ).questions;
  }

  return [];
}

function getDiagnosticInformation() {
  const diagnosticDirectory = path.join(
    process.cwd(),
    "content",
    "academy",
    "module-00-diagnostic",
  );

  const loadedQuestions = QUESTION_FILES.flatMap(
    (filename) =>
      extractQuestions(
        path.join(diagnosticDirectory, filename),
      ),
  );

  const questionsById = new Map<
    string,
    DiagnosticQuestion
  >();

  for (const question of loadedQuestions) {
    if (
      typeof question.id === "string" &&
      !questionsById.has(question.id)
    ) {
      questionsById.set(question.id, question);
    }
  }

  const uniqueQuestions = Array.from(
    questionsById.values(),
  )
    .filter((question) =>
      /^diag-\\d{3}$/.test(question.id ?? ""),
    )
    .sort((first, second) =>
      (first.id ?? "").localeCompare(
        second.id ?? "",
      ),
    )
    .slice(0, 40);

  const sections = SECTION_ORDER.filter(
    (sectionId) =>
      uniqueQuestions.some(
        (question) =>
          question.section === sectionId,
      ),
  );

  const totalSeconds = uniqueQuestions.reduce(
    (total, question) =>
      total +
      (typeof question.estimatedSeconds === "number"
        ? question.estimatedSeconds
        : 0),
    0,
  );

  return {
    questionCount:
      uniqueQuestions.length > 0
        ? uniqueQuestions.length
        : 40,
    estimatedMinutes:
      totalSeconds > 0
        ? Math.ceil(totalSeconds / 60)
        : 46,
    sections:
      sections.length > 0
        ? sections
        : [...SECTION_ORDER],
  };
}

const RULES = [
  {
    icon: "🎯",
    title: "Réponds naturellement",
    text: "Le diagnostic cherche ton niveau réel, pas un score artificiel.",
  },
  {
    icon: "🧠",
    title: "Indique ton niveau de confiance",
    text: "Une mauvaise réponse donnée avec certitude révèle un risque prioritaire.",
  },
  {
    icon: "⏱️",
    title: "Travaille sans aide extérieure",
    text: "Le temps et la méthode font partie des compétences évaluées.",
  },
];

export default function DiagnosticStartPage() {
  const diagnostic = getDiagnosticInformation();

  return (
    <div
      className="flex flex-col gap-5"
      style={{
        paddingBottom:
          "calc(8rem + env(safe-area-inset-bottom))",
      }}
    >
      <section
        className="pz-card p-6 pz-rise overflow-hidden relative"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(37,194,110,.18), transparent 42%), var(--carte)",
        }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 mb-5 text-[10px] font-extrabold uppercase tracking-[0.16em]"
          style={{
            color: "var(--vert)",
            background: "rgba(37,194,110,.09)",
            border: "1px solid rgba(37,194,110,.22)",
          }}
        >
          <span>◆</span>
          Module 0 · Positionnement
        </div>

        <h1 className="text-[32px] leading-[1.05] font-black tracking-[-0.045em]">
          Découvre ton véritable niveau
        </h1>

        <p
          className="mt-4 text-[14px] leading-6"
          style={{ color: "var(--gris)" }}
        >
          Avant de commencer ta formation, PARZI Academy
          analyse tes connaissances, ta méthode, ton temps de
          réponse et tes fausses certitudes.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid var(--ligne)",
            }}
          >
            <strong className="block text-[20px]">
              {diagnostic.questionCount}
            </strong>
            <span
              className="text-[10px]"
              style={{ color: "var(--gris)" }}
            >
              questions
            </span>
          </div>

          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid var(--ligne)",
            }}
          >
            <strong className="block text-[20px]">
              ≈ {diagnostic.estimatedMinutes}
            </strong>
            <span
              className="text-[10px]"
              style={{ color: "var(--gris)" }}
            >
              minutes
            </span>
          </div>

          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid var(--ligne)",
            }}
          >
            <strong className="block text-[20px]">
              {diagnostic.sections.length}
            </strong>
            <span
              className="text-[10px]"
              style={{ color: "var(--gris)" }}
            >
              compétences
            </span>
          </div>
        </div>
      </section>

      <section className="pz-card p-5 pz-rise pz-d1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-wider pz-red">
              CE QUI SERA ÉVALUÉ
            </div>

            <h2 className="text-[20px] font-extrabold mt-1">
              Ton profil de candidat
            </h2>
          </div>

          <span
            className="text-[11px] font-bold rounded-full px-3 py-1.5"
            style={{
              color: "var(--vert)",
              background: "rgba(37,194,110,.08)",
            }}
          >
            {diagnostic.sections.length} domaines
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">
          {diagnostic.sections.map((sectionId, index) => (
            <div
              key={sectionId}
              className="rounded-2xl p-3.5"
              style={{
                background: "rgba(255,255,255,.035)",
                border: "1px solid var(--ligne)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg grid place-items-center text-[11px] font-black mb-3"
                style={{
                  color: "var(--vert)",
                  background: "rgba(37,194,110,.1)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <span className="text-[12px] font-semibold leading-5">
                {SECTION_LABELS[sectionId] ??
                  sectionId}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="pz-card p-5 pz-rise pz-d1">
        <div className="text-[11px] font-bold tracking-wider pz-red">
          RÈGLES DU DIAGNOSTIC
        </div>

        <h2 className="text-[20px] font-extrabold mt-1">
          Pour obtenir un résultat fiable
        </h2>

        <div className="flex flex-col gap-3 mt-5">
          {RULES.map((rule) => (
            <div
              key={rule.title}
              className="flex items-start gap-3 rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,.035)",
                border: "1px solid var(--ligne)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                style={{
                  background: "rgba(255,255,255,.05)",
                }}
              >
                {rule.icon}
              </div>

              <div>
                <h3 className="text-[13px] font-bold">
                  {rule.title}
                </h3>

                <p
                  className="text-[12px] leading-5 mt-1"
                  style={{ color: "var(--gris)" }}
                >
                  {rule.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="pz-card p-5 pz-rise pz-d1"
        style={{
          background:
            "linear-gradient(135deg, rgba(213,172,73,.1), rgba(37,194,110,.06)), var(--carte)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl grid place-items-center text-[24px] shrink-0"
            style={{
              background: "rgba(213,172,73,.12)",
              border: "1px solid rgba(213,172,73,.2)",
            }}
          >
            🏆
          </div>

          <div className="flex-1">
            <div
              className="text-[10px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: "#e4c264" }}
            >
              Récompense de démarrage
            </div>

            <h2 className="text-[17px] font-extrabold mt-1">
              100 XP + trophée Point de départ
            </h2>

            <p
              className="text-[11px] mt-1"
              style={{ color: "var(--gris)" }}
            >
              Attribués après la réalisation complète du
              diagnostic.
            </p>
          </div>
        </div>
      </section>

      <section
        className="rounded-3xl p-5"
        style={{
          background: "rgba(255,255,255,.025)",
          border: "1px solid var(--ligne)",
        }}
      >
        <div className="flex gap-3">
          <span className="text-[18px]">ℹ️</span>

          <p
            className="text-[11px] leading-5"
            style={{ color: "var(--gris)" }}
          >
            PARZI Academy est une plateforme indépendante.
            Ce diagnostic ne constitue pas une validation de
            la FFF ou de la FIFA et ne garantit pas la
            réussite à un examen officiel.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <Link
          href="/academy/diagnostic/session"
          className="min-h-[58px] rounded-2xl flex items-center justify-center text-[15px] font-black"
          style={{
            color: "#06130c",
            background:
              "linear-gradient(135deg, #44dc8c, #20b968)",
            boxShadow:
              "0 16px 40px rgba(37,194,110,.2)",
          }}
        >
          Commencer le diagnostic
        </Link>

        <Link
          href="/academy/diagnostic/resultats"
          className="min-h-[52px] rounded-2xl flex items-center justify-center text-[13px] font-bold"
          style={{
            color: "var(--blanc)",
            background: "rgba(255,255,255,.035)",
            border: "1px solid var(--ligne)",
          }}
        >
          Voir le rapport de démonstration
        </Link>
      </div>
    </div>
  );
}
