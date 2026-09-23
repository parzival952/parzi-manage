// Domaines réservés à PARZI Academy. Sur ces hôtes, seule l'Academy est
// accessible (filtre dans src/proxy.ts) et l'interface masque tout lien vers
// Parzi Manage. Les autres hôtes (vercel.app, localhost…) ne changent pas.
//
// ACADEMY_HOSTS (optionnel, séparés par des virgules) ajoute des hôtes — utile
// pour tester le mode Academy en local, ex. ACADEMY_HOSTS=127.0.0.1

const DEFAULT_ACADEMY_HOSTS = ["parziacademy.fr", "www.parziacademy.fr"];

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
