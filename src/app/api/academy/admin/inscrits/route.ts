import { NextResponse } from "next/server";

import { inscritsCsv, listInscrits } from "@/lib/academy-admin";
import { getUser } from "@/lib/auth";
import { isAdmin } from "@/lib/verification";

export const dynamic = "force-dynamic";

// Export CSV des inscrits (admin seulement ; 404 pour tout autre compte,
// comme la page /academy/admin/inscrits). Séparateur « ; » et BOM UTF-8 pour
// une ouverture directe dans Excel en français.
export async function GET() {
  const user = await getUser();
  if (!user || !isAdmin(user.email)) return new NextResponse(null, { status: 404 });
  const csv = inscritsCsv(await listInscrits());
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscrits-parzi-academy-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
