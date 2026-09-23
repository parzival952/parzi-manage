import { NextResponse, type NextRequest } from "next/server";

import { isAcademyHost } from "@/lib/academy-host";

// Sur parziacademy.fr : uniquement PARZI Academy.
// Autorisé : l'Academy, la connexion (nécessaire pour y accéder), les API de
// l'Academy et les crons Vercel (protégés par leur propre secret).
const ACADEMY_ALLOWED = [
  /^\/academy(\/|$)/,
  /^\/connexion(\/|$)/,
  /^\/api\/academy\//,
  /^\/api\/cron\//,
];

export function proxy(request: NextRequest) {
  if (!isAcademyHost(request.headers.get("host"))) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (ACADEMY_ALLOWED.some((rule) => rule.test(pathname))) {
    return NextResponse.next();
  }

  // Les autres API de Parzi Manage n'existent pas sur ce domaine.
  if (pathname.startsWith("/api/")) {
    return new NextResponse(null, { status: 404 });
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
