// PARZI Academy — jauge d'assurance commune (1 à 5), identique au diagnostic.
// Utilisable côté serveur comme côté client (aucune dépendance).

export type ConfidenceValue = 1 | 2 | 3 | 4 | 5;

export const CONFIDENCE_LEVELS: { value: ConfidenceValue; label: string }[] = [
  { value: 1, label: "Au hasard" },
  { value: 2, label: "Peu sûr" },
  { value: 3, label: "Moyen" },
  { value: 4, label: "Confiant" },
  { value: 5, label: "Certain" },
];

export function isConfidenceValue(v: unknown): v is ConfidenceValue {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

/** Traduction vers le vocabulaire du moteur de révision (base). */
export function confidenceToEngine(
  v: ConfidenceValue,
): "certain" | "rather_certain" | "hesitant" | "guess" {
  if (v === 5) return "certain";
  if (v === 4) return "rather_certain";
  if (v === 1) return "guess";
  return "hesitant";
}
