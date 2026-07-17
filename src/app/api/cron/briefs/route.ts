// Cron du matin — génère le brief IA du jour pour tous les comptes actifs.
// Déclenché par Vercel Cron (vercel.json). Si CRON_SECRET est définie,
// Vercel l'envoie automatiquement en Authorization: Bearer.
import { NextResponse } from "next/server";
import { generateAllBriefs } from "@/lib/ai";

export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    // Sans secret configuré : on n'accepte que l'agent officiel de Vercel Cron.
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua.includes("vercel-cron")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const result = await generateAllBriefs();
  return NextResponse.json({ ok: true, ...result });
}
