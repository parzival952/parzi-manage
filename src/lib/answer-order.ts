// Ordre d'affichage des réponses aux QCM (leçons et examens PARZI Academy).
//
// Dans les banques de questions, la bonne réponse est presque toujours la 2e.
// Sans mélange, cocher toujours la 2e réponse suffisait à valider la plupart
// des leçons et des examens. On mélange donc les réponses À L'AFFICHAGE, de
// façon déterministe (même ordre à chaque affichage, sans rien stocker), et le
// serveur remet la réponse cochée dans l'ordre d'origine avant de corriger.
// Les clés de correction (contenu et base) ne changent pas.

/** Petit générateur pseudo-aléatoire déterministe (FNV-1a + xorshift32). */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(list: T[], random: () => number): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

type OrderedQuestion = { options: unknown[]; answer: number };

/**
 * Ordre d'affichage de chaque question d'une série (une leçon).
 * `order[i][d]` = indice d'origine de la réponse affichée en position `d`.
 *
 * Les positions de la bonne réponse sont RÉPARTIES entre les questions de la
 * série (jamais toutes au même endroit quand il y a assez de questions) : aucune
 * stratégie « toujours la même case » ne permet de tout réussir.
 */
export function balancedOrders(seed: string, questions: OrderedQuestion[]): number[][] {
  const random = seededRandom(seed);
  const maxOptions = Math.max(1, ...questions.map((q) => q.options.length));
  const targets = shuffleInPlace(
    questions.map((_, i) => i % maxOptions),
    random,
  );

  return questions.map((question, i) => {
    const count = question.options.length;
    const original = Array.from({ length: count }, (_, k) => k);
    const answer = question.answer;
    if (!Number.isInteger(answer) || answer < 0 || answer >= count) {
      return shuffleInPlace(original, random);
    }
    const others = shuffleInPlace(
      original.filter((k) => k !== answer),
      random,
    );
    const target = targets[i] % count;
    others.splice(target, 0, answer);
    return others;
  });
}

/** Réponses dans l'ordre affiché, avec l'indice de la bonne réponse recalculé. */
export function reorderQuestion<Q extends OrderedQuestion>(
  question: Q,
  order: number[],
): Q {
  return {
    ...question,
    options: order.map((k) => question.options[k]),
    answer: order.indexOf(question.answer),
  };
}

/** Réponse cochée (position affichée) → indice d'origine. -1 si invalide. */
export function displayedToOriginal(order: number[], displayed: unknown): number {
  if (!Number.isInteger(displayed)) return -1;
  const d = displayed as number;
  return d >= 0 && d < order.length ? order[d] : -1;
}
