// Domaines réservés à PARZI Academy. Sur ces hôtes, seule l'Academy est
// accessible (filtre dans src/proxy.ts) et l'interface masque tout lien vers
// Parzi Manage. Les autres hôtes (vercel.app, localhost…) ne changent pas.
//
// ACADEMY_HOSTS (optionnel, séparés par des virgules) ajoute des hôtes — utile
// pour tester le mode Academy en local, ex. ACADEMY_HOSTS=127.0.0.1

const DEFAULT_ACADEMY_HOSTS = ["parziacademy.fr", "www.parziacademy.fr"];

/** Adresse publique officielle de PARZI Academy (liens des e-mails de confirmation). */
export const ACADEMY_ORIGIN = "https://www.parziacademy.fr";

function stripPort(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, "");
}

export function isAcademyHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const extra = (process.env.ACADEMY_HOSTS ?? "")
    .split(",")
    .map(stripPort)
    .filter(Boolean);
  return [...DEFAULT_ACADEMY_HOSTS, ...extra].includes(stripPort(host));
}

/**
 * En-tête interne posé par src/proxy.ts sur toute requête /academy (quel que
 * soit le domaine). Le proxy supprime toujours la valeur fournie par le client
 * avant de le poser : il ne peut pas être falsifié depuis le navigateur.
 * Sert à envoyer un visiteur non connecté vers la connexion Academy.
 */
export const SURFACE_HEADER = "x-parzi-surface";
