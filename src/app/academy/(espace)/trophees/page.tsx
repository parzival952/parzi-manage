export const dynamic = "force-dynamic";
import Link from "next/link";
import CollectibleGlyph from "@/components/CollectibleGlyph";
import { redirect } from "next/navigation";

import {
  academyStateToProgress,
  loadAcademyState,
} from "@/lib/academy-state";
import {
  chaptersCompleted,
  LESSON_COUNT,
} from "@/lib/academy";
import { requireUser } from "@/lib/auth";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import { adminPreviewState, maxedStats } from "@/lib/academy-admin-preview";
import { evaluateTrophies, sortTrophies, RARITY_TONE, RARITY_LABEL, type TrophyStats } from "@/lib/trophies";
import AcademyIcon from "@/components/AcademyIcon";

export const metadata = { title: "Trophées" };

export default async function TropheesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const { admin, preview } = adminPreviewState(user.email, await searchParams);

  const academyState = await loadAcademyState();

  if (!academyState) {
    redirect("/academy");
  }

  const p = academyStateToProgress(
    academyState,
  );
  // Aperçu admin : statistiques « tout débloqué » pour l'affichage seulement.
  const stats: TrophyStats = preview
    ? maxedStats()
    : {
        level: p.info.level, xp: p.xp, streak: p.streak, best: p.best_streak,
        lessons: p.done.size, chapters: chaptersCompleted(p.done), perfect: p.perfect,
        totalLessons: LESSON_COUNT,
      };
  const trophies = sortTrophies(evaluateTrophies(stats));
  const earned = trophies.filter((t) => t.earned).length;
  const secretsLocked = trophies.filter((t) => t.secret && !t.earned).length;

  return (
    <div className="flex flex-col gap-5">
      <AdminPreviewBanner admin={admin} preview={preview} path="/academy/trophees" />
      <div className="pz-rise">
        <Link href="/academy/profil" className="text-[12.5px] pz-muted hover:text-white">← Profil</Link>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-2">Trophées</h1>
        <p className="text-[13.5px] pz-muted mt-1">
          <b className="pz-red">{earned}</b> / {trophies.length} débloqués{secretsLocked > 0 ? ` · ${secretsLocked} secret${secretsLocked > 1 ? "s" : ""} à découvrir` : ""}.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pz-rise pz-d1">
        {trophies.map((t) => {
          const tone = RARITY_TONE[t.rarity];
          const hidden = t.secret && !t.earned;
          return (
            <div key={t.id} className="pz-card p-4" style={{ borderColor: t.earned ? tone + "55" : undefined }}>
              <div className="flex items-start gap-3">
                <div
                  className="grid place-items-center text-[22px] shrink-0"
                  style={{
                    width: 48, height: 52,
                    clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)",
                    background: t.earned ? "linear-gradient(180deg,#2a2a32,#131317)" : "var(--anthracite)",
                    border: `1px solid ${t.earned ? tone + "aa" : "rgba(var(--ink-rgb),.06)"}`,
                    boxShadow: t.earned ? "inset 0 1px 0 rgba(255,255,255,.10)" : "none",
                  }}
                >
                  {hidden ? <AcademyIcon name="help" size={20} style={{ color: "var(--gris)", opacity: 0.6 }} /> : <span style={{ opacity: t.earned ? 1 : 0.45, display: "grid" }}><CollectibleGlyph icon={t.icon} color={t.earned ? tone : "var(--gris)"} /></span>}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[13.5px] leading-tight" style={{ color: t.earned ? "var(--blanc)" : "var(--gris)" }}>
                    {hidden ? "Trophée secret" : t.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: t.earned ? tone : "var(--gris)" }}>
                    {RARITY_LABEL[t.rarity]}{t.secret ? " · secret" : ""}
                  </div>
                </div>
              </div>
              <p className="text-[11.5px] pz-muted mt-2.5 leading-snug">
                {hidden ? "Continue à jouer pour le révéler…" : t.desc}
              </p>
              {t.earned ? (
                <div className="text-[10.5px] font-bold mt-2" style={{ color: tone }}>✓ Débloqué</div>
              ) : !hidden ? (
                <div className="mt-2"><div className="pz-xpbar" style={{ height: 5 }}><div className="pz-xpfill" style={{ width: `${Math.round(t.pct * 100)}%` }} /></div></div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="pz-card p-5 text-center pz-rise pz-d2">
        <div className="text-[13px] pz-muted">Communs, rares, épiques, légendaires, mythiques — et des secrets qui ne se révèlent qu&apos;à l&apos;obtention. La collection s&apos;agrandit à chaque mise à jour.</div>
      </div>
    </div>
  );
}
