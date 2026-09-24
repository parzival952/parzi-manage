// Route vers la licence — organisation du programme en 4 phases, jalonnées par
// les certifications. Pur (aucune I/O) : l'appelant fournit les leçons validées
// et les certifications obtenues.
import { ATTR_DEFS, attrForLesson, COURSE, type AttrKey, type Chapter } from "./academy-course";

export type Phase = {
  id: string;
  title: string;
  subtitle: string;
  chapterIds: string[];
  /** Certification qui clôt la phase (jalon). */
  milestone?: { certId: string; label: string; unlockAfterChapters: number };
};

// Les jalons suivent les prérequis réels des certifications (lib/certifications) :
// Agent Ready après 2 chapitres terminés, Agent Confirmé après 6, Agent Expert
// et l'examen blanc après tout le programme.
export const PHASES: Phase[] = [
  {
    id: "bases",
    title: "Les bases du métier",
    subtitle: "Comprendre le rôle, le cadre et les règles avant d'agir.",
    chapterIds: ["fondamentaux", "cadre-juridique"],
    milestone: { certId: "agent-ready", label: "Agent Ready", unlockAfterChapters: 2 },
  },
  {
    id: "terrain",
    title: "Sur le terrain",
    subtitle: "Mandats, détection, carrière, négociation : le cœur du travail.",
    chapterIds: ["contrats-mandats", "scouting-evaluation", "gestion-carriere", "art-negociation"],
    milestone: { certId: "agent-confirme", label: "Agent Confirmé", unlockAfterChapters: 6 },
  },
  {
    id: "complet",
    title: "L'agent complet",
    subtitle: "Business, facteur humain, international, image : voir plus large.",
    chapterIds: ["business-reseau", "psychologie-humain", "transferts-internationaux", "medias-communication"],
  },
  {
    id: "pro",
    title: "Passer pro",
    subtitle: "Statut, fiscalité, méthode d'examen : prêt pour la licence.",
    chapterIds: ["fiscalite-statut", "methode-pro"],
    milestone: { certId: "agent-expert", label: "Agent Expert", unlockAfterChapters: COURSE.chapters.length },
  },
];

export type ChapterStatus = "done" | "active" | "started" | "todo";

export type ChapterView = {
  chapter: Chapter;
  number: number; // 1-based dans le programme
  done: number;
  total: number;
  minutes: number;
  status: ChapterStatus;
  nextLesson: { id: string; title: string } | null;
  domains: { key: AttrKey; label: string }[];
};

export type PhaseView = Phase & {
  number: number;
  chapters: ChapterView[];
  done: number;
  total: number;
  status: "done" | "active" | "todo";
  milestoneState?: "earned" | "available" | "locked";
  chaptersMissing?: number;
};

export function chapterView(chapter: Chapter, done: Set<string>, currentLessonId: string | null): ChapterView {
  const number = COURSE.chapters.findIndex((c) => c.id === chapter.id) + 1;
  const doneCount = chapter.lessons.filter((l) => done.has(l.id)).length;
  const next = chapter.lessons.find((l) => !done.has(l.id)) ?? null;
  const isActive = chapter.lessons.some((l) => l.id === currentLessonId);
  const status: ChapterStatus =
    doneCount === chapter.lessons.length ? "done" : isActive ? "active" : doneCount > 0 ? "started" : "todo";
  const keys = [...new Set(chapter.lessons.map((l) => attrForLesson(l.id)).filter(Boolean))] as AttrKey[];
  return {
    chapter,
    number,
    done: doneCount,
    total: chapter.lessons.length,
    minutes: chapter.lessons.reduce((n, l) => n + l.minutes, 0),
    status,
    nextLesson: next ? { id: next.id, title: next.title } : null,
    domains: ATTR_DEFS.filter((d) => keys.includes(d.key)),
  };
}

export function buildRoadmap(
  done: Set<string>,
  currentLessonId: string | null,
  earnedCerts: Set<string>,
  /** Certifications dont les prérequis réels sont remplis (CERTS[].prereq). */
  unlockedCerts: Set<string>,
): { phases: PhaseView[]; chaptersDone: number } {
  const byId = new Map(COURSE.chapters.map((c) => [c.id, c]));
  const chaptersDone = COURSE.chapters.filter((c) => c.lessons.every((l) => done.has(l.id))).length;

  const phases = PHASES.map((phase, i) => {
    const chapters = phase.chapterIds
      .map((id) => byId.get(id))
      .filter((c): c is Chapter => Boolean(c))
      .map((c) => chapterView(c, done, currentLessonId));
    const d = chapters.reduce((n, c) => n + c.done, 0);
    const t = chapters.reduce((n, c) => n + c.total, 0);
    const status: PhaseView["status"] =
      d === t ? "done" : chapters.some((c) => c.status === "active" || c.status === "started") ? "active" : "todo";

    let milestoneState: PhaseView["milestoneState"];
    let chaptersMissing: number | undefined;
    if (phase.milestone) {
      const need = phase.milestone.unlockAfterChapters;
      milestoneState = earnedCerts.has(phase.milestone.certId)
        ? "earned"
        : unlockedCerts.has(phase.milestone.certId)
          ? "available"
          : "locked";
      chaptersMissing = Math.max(0, need - chaptersDone);
    }
    return { ...phase, number: i + 1, chapters, done: d, total: t, status, milestoneState, chaptersMissing };
  });

  return { phases, chaptersDone };
}

/** Phase d'un chapitre (pour la page chapitre). */
export function phaseOfChapter(chapterId: string): { phase: Phase; number: number } | null {
  const i = PHASES.findIndex((p) => p.chapterIds.includes(chapterId));
  return i >= 0 ? { phase: PHASES[i], number: i + 1 } : null;
}
