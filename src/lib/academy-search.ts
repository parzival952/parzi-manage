// Recherche PARZI Academy — pure (aucune I/O) : leçons (titre, intro,
// paragraphes), glossaire et notes de l'élève (passées par l'appelant).
// Insensible aux accents et à la casse ; tous les mots doivent apparaître.
import { COURSE } from "./academy-course";
import { GLOSSAIRE } from "./academy-glossaire";

export type SearchHit = {
  kind: "lecon" | "glossaire" | "note";
  title: string;
  context: string; // chapitre, catégorie…
  snippet: string;
  href: string;
  score: number;
};

export type SearchNote = { lessonId: string; body: string };

/** Minuscules, sans accents ni ponctuation superflue. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ");
}

export function slugify(text: string): string {
  return normalize(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const STOP = new Set(["le", "la", "les", "de", "des", "du", "un", "une", "et", "a", "au", "aux", "en", "l", "d", "sur", "pour"]);

export function queryTerms(query: string): string[] {
  const terms = normalize(query)
    .split(/[^a-z0-9%€]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
  return [...new Set(terms)].slice(0, 8);
}

function allTerms(haystack: string, terms: string[]): boolean {
  return terms.every((t) => haystack.includes(t));
}

/** Extrait ~220 caractères autour du premier terme trouvé (texte d'origine). */
export function makeSnippet(text: string, terms: string[], radius = 110): string {
  const clean = text.replace(/^(⚠️|🎯)\s*/u, "");
  const norm = normalize(clean);
  let at = -1;
  for (const t of terms) {
    const i = norm.indexOf(t);
    if (i >= 0 && (at < 0 || i < at)) at = i;
  }
  if (at < 0) return clean.length > radius * 2 ? clean.slice(0, radius * 2).trimEnd() + "…" : clean;
  const start = Math.max(0, at - radius);
  const end = Math.min(clean.length, at + radius);
  return (start > 0 ? "…" : "") + clean.slice(start, end).trim() + (end < clean.length ? "…" : "");
}

/**
 * Découpe un extrait en segments { texte, trouvé } pour surligner les termes.
 * La correspondance se fait sur le texte normalisé (même longueur que l'original
 * pour le français courant : les accents composés sont retirés un pour un).
 */
export function highlight(text: string, terms: string[]): { text: string; hit: boolean }[] {
  if (terms.length === 0) return [{ text, hit: false }];
  const norm = normalize(text);
  if (norm.length !== text.length) return [{ text, hit: false }];
  const marks = new Array<boolean>(text.length).fill(false);
  for (const t of terms) {
    let i = norm.indexOf(t);
    while (i >= 0) {
      for (let k = i; k < i + t.length; k++) marks[k] = true;
      i = norm.indexOf(t, i + t.length);
    }
  }
  const out: { text: string; hit: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = out[out.length - 1];
    if (last && last.hit === marks[i]) last.text += text[i];
    else out.push({ text: text[i], hit: marks[i] });
  }
  return out;
}

export function searchAcademy(query: string, notes: SearchNote[] = [], limit = 40): { terms: string[]; hits: SearchHit[] } {
  const terms = queryTerms(query);
  if (terms.length === 0) return { terms, hits: [] };
  const hits: SearchHit[] = [];

  for (const chapter of COURSE.chapters) {
    for (const lesson of chapter.lessons) {
      const titleN = normalize(lesson.title);
      const introN = normalize(lesson.intro);
      const base = `/academy/lecon/${lesson.id}`;
      const inTitle = allTerms(titleN, terms);
      if (inTitle || allTerms(introN, terms)) {
        hits.push({
          kind: "lecon",
          title: lesson.title,
          context: chapter.title,
          snippet: makeSnippet(lesson.intro, terms),
          href: base,
          score: inTitle ? 100 : 60,
        });
        continue;
      }
      // Meilleur paragraphe de la leçon (un seul résultat par leçon).
      let best = -1;
      let bestCount = 0;
      lesson.blocks.forEach((block, i) => {
        const n = normalize(block);
        if (!allTerms(n, terms)) return;
        const count = terms.reduce((s, t) => s + n.split(t).length - 1, 0);
        if (count > bestCount) {
          best = i;
          bestCount = count;
        }
      });
      if (best >= 0) {
        hits.push({
          kind: "lecon",
          title: lesson.title,
          context: chapter.title,
          snippet: makeSnippet(lesson.blocks[best], terms),
          href: `${base}#bloc-${best}`,
          score: 30 + Math.min(20, bestCount * 4),
        });
      }
    }
  }

  for (const cat of GLOSSAIRE) {
    for (const t of cat.termes) {
      const termN = normalize(t.terme);
      const inTerm = allTerms(termN, terms);
      if (inTerm || allTerms(normalize(`${t.terme} ${t.def}`), terms)) {
        hits.push({
          kind: "glossaire",
          title: t.terme,
          context: `Glossaire · ${cat.titre}`,
          snippet: makeSnippet(t.def, terms),
          href: `/academy/glossaire#${slugify(t.terme)}`,
          score: inTerm ? 90 : 40,
        });
      }
    }
  }

  const titles = new Map(COURSE.chapters.flatMap((c) => c.lessons.map((l) => [l.id, l.title] as const)));
  for (const note of notes) {
    if (!allTerms(normalize(note.body), terms)) continue;
    hits.push({
      kind: "note",
      title: titles.get(note.lessonId) ?? note.lessonId,
      context: "Mes notes",
      snippet: makeSnippet(note.body, terms),
      href: `/academy/lecon/${note.lessonId}`,
      score: 70,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "fr"));
  return { terms, hits: hits.slice(0, limit) };
}
