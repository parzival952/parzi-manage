// Notes personnelles par leçon (PARZI Academy).
// Dual-mode comme le reste de l'Academy : Postgres (DATABASE_URL) en prod,
// SQLite en démo. Toujours filtré sur l'utilisateur passé par le serveur.
import { db } from "./db";
import { pg, usePostgres } from "./pg";
import { findLesson } from "./academy";

export const NOTE_MAX_LENGTH = 4000;

export type LessonNote = { lessonId: string; body: string; updatedAt: string };

/**
 * Les notes sont un bonus : si leur lecture échoue (droits, base indisponible),
 * la leçon doit quand même s'afficher. On journalise et on continue sans notes.
 */
function logNotesError(where: string, err: unknown) {
  console.error(`[academy-notes] ${where} a échoué — page affichée sans notes`, err);
}

export async function getLessonNote(uid: string, lessonId: string): Promise<LessonNote | null> {
  if (usePostgres()) {
    try {
      const rows = (await pg()`SELECT lesson_id, body, updated_at::text AS updated_at
        FROM academy_lesson_notes WHERE user_id = ${uid} AND lesson_id = ${lessonId}`) as unknown as {
        lesson_id: string; body: string; updated_at: string;
      }[];
      const r = rows[0];
      return r ? { lessonId: r.lesson_id, body: r.body, updatedAt: r.updated_at } : null;
    } catch (err) {
      logNotesError("getLessonNote", err);
      return null;
    }
  }
  const r = db()
    .prepare("SELECT lesson_id, body, updated_at FROM academy_lesson_notes WHERE user_id = ? AND lesson_id = ?")
    .get(uid, lessonId) as { lesson_id: string; body: string; updated_at: string } | undefined;
  return r ? { lessonId: r.lesson_id, body: r.body, updatedAt: r.updated_at } : null;
}

/** Toutes les notes de l'élève, indexées par leçon (pour l'aide-mémoire). */
export async function getAllLessonNotes(uid: string): Promise<Map<string, LessonNote>> {
  type Row = { lesson_id: string; body: string; updated_at: string };
  let rows: Row[];
  if (usePostgres()) {
    try {
      rows = (await pg()`SELECT lesson_id, body, updated_at::text AS updated_at
        FROM academy_lesson_notes WHERE user_id = ${uid}`) as unknown as Row[];
    } catch (err) {
      logNotesError("getAllLessonNotes", err);
      return new Map();
    }
  } else {
    rows = db()
      .prepare("SELECT lesson_id, body, updated_at FROM academy_lesson_notes WHERE user_id = ?")
      .all(uid) as Row[];
  }
  return new Map(rows.map((r) => [r.lesson_id, { lessonId: r.lesson_id, body: r.body, updatedAt: r.updated_at }]));
}

/**
 * Enregistre (ou supprime si vide) la note d'une leçon.
 * Renvoie le texte réellement conservé (nettoyé et tronqué).
 */
export async function saveLessonNote(uid: string, lessonId: string, rawBody: string): Promise<string> {
  if (!findLesson(lessonId)) throw new Error("Leçon inconnue.");
  const body = rawBody.replace(/\r\n/g, "\n").trim().slice(0, NOTE_MAX_LENGTH);

  if (usePostgres()) {
    if (!body) {
      await pg()`DELETE FROM academy_lesson_notes WHERE user_id = ${uid} AND lesson_id = ${lessonId}`;
    } else {
      await pg()`INSERT INTO academy_lesson_notes (user_id, lesson_id, body, updated_at)
        VALUES (${uid}, ${lessonId}, ${body}, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET body = EXCLUDED.body, updated_at = now()`;
    }
    return body;
  }

  if (!body) {
    db().prepare("DELETE FROM academy_lesson_notes WHERE user_id = ? AND lesson_id = ?").run(uid, lessonId);
  } else {
    db()
      .prepare(`INSERT INTO academy_lesson_notes (user_id, lesson_id, body, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`)
      .run(uid, lessonId, body);
  }
  return body;
}
