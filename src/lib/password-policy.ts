// Règles des mots de passe (inscription et changement de mot de passe).
// Alignées sur le réglage Supabase Auth → Email : longueur minimale 8,
// exigence « lettres et chiffres ». La connexion n'applique PAS ces règles :
// les comptes créés avant (6 caractères) continuent de se connecter.
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_HINT = "8 caractères min., lettres et chiffres";

/** Problème du mot de passe choisi, ou null s'il respecte les règles. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}
