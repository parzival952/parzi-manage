export const dynamic = "force-dynamic";
import Link from "next/link";
import CollectibleGlyph from "@/components/CollectibleGlyph";
import { redirect } from "next/navigation";

import {
  academyStateToProgress,
  loadAcademyState,
} from "@/lib/academy-state";
import { requireUser } from "@/lib/auth";
import {
  chaptersCompleted,
  computeAttributes,
  LESSON_COUNT,
} from "@/lib/academy";
import { attributeBonusesForCerts, getMyCerts } from "@/lib/certifications";
import { evaluateBadges, sortBadges, TIER_TONE, type BadgeStats } from "@/lib/badges";
import { evaluateTrophies, RARITY_TONE, type TrophyStats } from "@/lib/trophies";
import { RANKS } from "@/lib/progression";
import AcademyProgressHeader from "@/components/AcademyProgressHeader";
import AcademyIcon from "@/components/AcademyIcon";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import { adminPreviewState, maxedLevelInfo, maxedStats } from "@/lib/academy-admin-preview";

export default async function AcademyProfil({
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

  const progress =
    academyStateToProgress(academyState);

  const { info } = progress;
  const initial = (user.email[0] ?? "P").toUpperCase();
  const displayName = user.email.split("@")[0];

  const myCerts = await getMyCerts(user.id);
  const certBonuses = attributeBonusesForCerts(new Set(myCerts.keys()));
  const { ovr, attrs } = computeAttributes(progress.done, info.level, certBonuses);

  // Les 2 meilleurs attributs sont mis en avant.
  const topTwo = [...attrs].sort((a, b) => b.score - a.score).slice(0, 2).map((a) => a.key);

  // Badges réels
  // Aperçu admin : statistiques « tout débloqué » pour l'affichage seulement.
  const stats: BadgeStats = preview
    ? maxedStats()
    : {
        level: info.level, xp: info.xp, streak: progress.streak, best: progress.best_streak,
        lessons: progress.done.size, chapters: chaptersCompleted(progress.done), perfect: progress.perfect,
      };
  const shownInfo = preview ? maxedLevelInfo() : info;
  const badges = sortBadges(evaluateBadges(stats));
  const earnedCount = badges.filter((b) => b.earned).length;
  const showcase = badges.slice(0, 6);

  const trophyStats: TrophyStats = { ...stats, totalLessons: LESSON_COUNT };
  const trophies = evaluateTrophies(trophyStats);
  const trophyEarned = trophies.filter((t) => t.earned);
  const trophyShowcase = [...trophyEarned].slice(0, 5);

  return (
    <div className="pz-wide flex flex-col gap-6 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-10 lg:items-start">
      {admin ? (
        <div className="lg:col-span-2">
          <AdminPreviewBanner admin={admin} preview={preview} path="/academy/profil" />
        </div>
      ) : null}
      <div className="flex flex-col gap-6 lg:sticky lg:top-24">
      {/* Carte agent collector */}
      <div className="pzc-wrap pz-rise">
        <div className="pzc-sheen" />
        <div className="pzc">
          <div className="pzc-in">
            <div className="pzc-top">
              <div className="pzc-ovr">
                <div className="n">{ovr}</div>
                <div className="l">OVR</div>
                <div className="r">Agent</div>
              </div>
              <div className="pzc-crest" style={{ borderColor: `${shownInfo.rank.tone}66` }} title={shownInfo.rank.name}>
                <span style={{ color: shownInfo.rank.tone }}>◆</span><small>RANG</small>
              </div>
            </div>
            <div className="pzc-portrait"><div className="pzc-mono">{initial}</div></div>
            <div className="pzc-name">{displayName}</div>
            <div className="pzc-sub">{shownInfo.rank.name} · Niveau {shownInfo.level}</div>
            <div className="pzc-div" />
            <div className="pzc-attrs">
              {attrs.map((a) => (
                <div key={a.key} className={"pzc-attr" + (topTwo.includes(a.key) ? " hi" : "")}>
                  <b>{a.score}</b><span>{a.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {myCerts.size > 0 ? (
        <div className="text-[11px] pz-muted -mt-3 text-center">
          ▲ Carte boostée par {myCerts.size} certification
          {myCerts.size > 1 ? "s" : ""} obtenue
          {myCerts.size > 1 ? "s" : ""}
        </div>
      ) : null}
      </div>
      <div className="flex flex-col gap-6 min-w-0">

      <AcademyProgressHeader progress={progress} doneCount={progress.done.size} total={LESSON_COUNT} />

      {/* Stats */}
      <div className="pz-rise pz-d1">
        <div className="pz-eyebrow pz-red mb-3">Statistiques</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="pz-card p-4 text-center"><div className="text-[22px] font-black pz-mono inline-flex items-center gap-1.5" style={{ color: "var(--rouge-vif)" }}><AcademyIcon name="flame" size={18} /> {progress.streak}</div><div className="text-[11px] pz-muted">Série (j)</div></div>
          <div className="pz-card p-4 text-center"><div className="text-[22px] font-black pz-mono">{progress.done.size}</div><div className="text-[11px] pz-muted">Leçons</div></div>
          <div className="pz-card p-4 text-center"><div className="text-[22px] font-black pz-mono">{progress.best_streak}</div><div className="text-[11px] pz-muted">Record série</div></div>
        </div>
      </div>

      {/* Badges réels */}
      <div className="pz-rise pz-d2">
        <div className="flex items-center justify-between mb-3">
          <div className="pz-eyebrow pz-red">BADGES · {earnedCount}/{badges.length}</div>
          <Link href={preview ? "/academy/badges?apercu=1" : "/academy/badges"} className="text-[11.5px] pz-muted hover:text-white">Tout voir →</Link>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {showcase.map((b) => (
            <div
              key={b.id}
              className="pzc-badge"
              title={`${b.name} — ${b.desc}`}
              style={{
                opacity: b.earned ? 1 : 0.45,
                background: b.earned ? "linear-gradient(180deg,#2a2a32,#131317)" : undefined,
                borderColor: b.earned ? TIER_TONE[b.tier] + "88" : undefined,
                boxShadow: b.earned ? "inset 0 1px 0 rgba(255,255,255,.10)" : "none",
              }}
            >
              <CollectibleGlyph icon={b.icon} color={b.earned ? TIER_TONE[b.tier] : "var(--gris)"} />
            </div>
          ))}
        </div>
        <p className="text-[12px] pz-muted mt-2.5">
          {earnedCount === 0
            ? "Valide des leçons, garde ta série, réussis des quiz — tes badges se débloquent tout seuls."
            : "Chaque badge est gagné par ton travail réel. Continue pour les faire briller."}
        </p>
      </div>

      {/* Trophées */}
      <div className="pz-rise pz-d2">
        <div className="flex items-center justify-between mb-3">
          <div className="pz-eyebrow pz-red">TROPHÉES · {trophyEarned.length}/{trophies.length}</div>
          <Link href={preview ? "/academy/trophees?apercu=1" : "/academy/trophees"} className="text-[11.5px] pz-muted hover:text-white">Tout voir →</Link>
        </div>
        {trophyShowcase.length > 0 ? (
          <div className="flex gap-2.5 flex-wrap">
            {trophyShowcase.map((t) => (
              <div key={t.id} className="pzc-badge" title={`${t.name} — ${t.desc}`}
                style={{ background: "linear-gradient(180deg,#2a2a32,#131317)", borderColor: RARITY_TONE[t.rarity] + "aa", boxShadow: "inset 0 1px 0 rgba(255,255,255,.10)" }}>
                <CollectibleGlyph icon={t.icon} color={RARITY_TONE[t.rarity]} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] pz-muted">Aucun trophée encore — les plus beaux se méritent. Certains sont secrets.</p>
        )}
      </div>

      {/* Échelle des rangs */}
      <div className="pz-rise pz-d3">
        <div className="pz-eyebrow pz-red mb-3">LES 12 RANGS PARZI</div>
        <div className="pz-card p-4 flex flex-col gap-1.5">
          {RANKS.map((r) => {
            const reached = shownInfo.level >= r.min;
            return (
              <div key={r.name} className="flex items-center gap-3 py-1">
                <span className="text-[13px]" style={{ color: reached ? r.tone : "rgba(var(--ink-rgb),.2)" }}>◆</span>
                <span className="text-[13.5px] font-semibold" style={{ color: reached ? "var(--blanc)" : "rgba(var(--ink-rgb),.32)" }}>{r.name}</span>
                <span className="text-[11px] pz-muted ml-auto">Niv. {r.min}{r.max > r.min ? `–${r.max}` : ""}</span>
                {shownInfo.rank.name === r.name && <span className="text-[10px] font-bold pz-red">ACTUEL</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mon compte : données personnelles */}
      <div className="pz-card p-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div>
          <div className="font-bold">Mon compte</div>
          <div className="pz-muted text-[12.5px]">
            Tes données : <Link href="/academy/confidentialite" className="hover:underline">confidentialité</Link>
          </div>
        </div>
        <Link href="/academy/compte/supprimer" className="text-[12.5px] font-bold pz-muted hover:underline">
          Supprimer mon compte
        </Link>
      </div>
      </div>
    </div>
  );
}
