import { NextResponse, type NextRequest } from "next/server";

import { isAcademyHost, landingRewrite, SURFACE_HEADER } from "@/lib/academy-host";

// Sur parziacademy.fr : uniquement PARZI Academy.
// Autorisé : l'Academy (dont sa connexion /academy/connexion), les API de
// l'Academy et les crons Vercel (protégés par leur propre secret).
const ACADEMY_ALLOWED = [
  /^\/academy(\/|$)/,
  /^\/api\/academy\//,
  /^\/api\/cron\//,
];

/** Laisse passer la requête en marquant (ou non) la surface Academy. */
function pass(request: NextRequest, academy: boolean) {
  const headers = new Headers(request.headers);
  headers.delete(SURFACE_HEADER); // jamais la valeur envoyée par le client
  if (academy) headers.set(SURFACE_HEADER, "academy");
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAcademyPath = /^\/academy(\/|$)/.test(pathname);

  if (!isAcademyHost(request.headers.get("host"))) {
    return pass(request, isAcademyPath);
  }

  // Domaine Academy. La racine = la vitrine (pour tous) ; /academy sans session = la vitrine.
  const hasSession = request.cookies.has("pm_at") || request.cookies.has("pm_rt");
  const landing = landingRewrite(pathname, hasSession);
  if (landing) {
    const headers = new Headers(request.headers);
    headers.set(SURFACE_HEADER, "academy");
    const url = request.nextUrl.clone();
    url.pathname = landing;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (ACADEMY_ALLOWED.some((rule) => rule.test(pathname))) {
    return pass(request, isAcademyPath);
  }

  // Les autres API de Parzi Manage n'existent pas sur ce domaine.
  if (pathname.startsWith("/api/")) {
    return new NextResponse(null, { status: 404 });
  }

  // L'ancienne connexion commune → la connexion Academy (on garde la query).
  if (pathname === "/connexion") {
    const url = request.nextUrl.clone();
    url.pathname = "/academy/connexion";
    return NextResponse.redirect(url, 307);
  }

  // Toute autre page (dashboard, CRM, joueurs, admin, accueil…) → l'Academy.
  const url = request.nextUrl.clone();
  url.pathname = "/academy";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Tout sauf les fichiers techniques (JS/CSS, images optimisées, fichiers avec extension).
  matcher: ["/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
