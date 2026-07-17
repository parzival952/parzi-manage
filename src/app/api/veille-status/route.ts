// Statut public des sources de veille (aucune donnée sensible) — sert au monitoring.
import { NextResponse } from "next/server";
import { getVeille } from "@/lib/veille";

export async function GET() {
  const v = await getVeille();
  return NextResponse.json({
    sourcesOk: v.sourcesOk,
    sourcesTotal: v.sourcesTotal,
    items: v.items.length,
    latest: v.items[0]?.title ?? null,
  });
}
