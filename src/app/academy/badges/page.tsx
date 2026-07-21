export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { chaptersCompleted, getProgress } from "@/lib/academy";
import { evaluateBadges, sortBadges, TIER_TONE, type BadgeStats } from "@/lib/badges";

export const metadata = { title: "Badges" };

export default async function BadgesPage() {
  const user = await requireUser();
  const p = await getProgress(user.id);
  const stats: BadgeStats = {
    level: p.info.level, xp: p.xp, streak: p.streak, best: p.best_streak,
    lessons: p.done.size, chapters: chaptersCompleted(p.done), perfect: p.perfect,
  };
  const badges = sortBadges(evaluateBadges(stats));
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="pz-rise">
        <Link href="/academy/profil" className="text-[12.5px] pz-muted hover:text-white">← Profil</Link>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-2">Badges &amp; trophées</h1>
        <p className="text-[13.5px] pz-muted mt-1">
          <b className="pz-red">{earned}</b> / {badges.length} obtenus. Chaque badge se gagne par ton travail réel — jamais offert.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pz-rise pz-d1">
        {badges.map((b) => {
          const tone = TIER_TONE[b.tier];
          return (
            <div key={b.id} className="pz-card p-4" style={{ opacity: b.earned ? 1 : 0.9 }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-13 grid place-items-center text-[22px] shrink-0"
                  style={{
                    clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)",
                    height: "3.1rem",
                    background: b.earned ? "linear-gradient(180deg,#26262f,#141419)" : "#17171b",
                    border: `1px solid ${b.earned ? tone + "88" : "rgba(255,255,255,.06)"}`,
                    filter: b.earned ? "none" : "grayscale(1)",
                    boxShadow: b.earned ? `0 0 14px ${tone}33` : "none",
                  }}
                >
                  <span style={{ opacity: b.earned ? 1 : 0.4 }}>{b.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[13.5px] leading-tight" style={{ color: b.earned ? "var(--blanc)" : "var(--gris)" }}>{b.name}</div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: b.earned ? tone : "var(--gris2)" }}>{b.tier} · {b.family}</div>
                </div>
              </div>
              <p className="text-[11.5px] pz-muted mt-2.5 leading-snug">{b.desc}</p>
              {!b.earned && (
                <div className="mt-2">
                  <div className="pz-xpbar" style={{ height: 5 }}><div className="pz-xpfill" style={{ width: `${Math.round(b.pct * 100)}%` }} /></div>
                </div>
              )}
              {b.earned && <div className="text-[10.5px] font-bold mt-2" style={{ color: tone }}>✓ Obtenu</div>}
            </div>
          );
        })}
      </div>

      <div className="pz-card p-5 text-center pz-rise pz-d2">
        <div className="text-[13px] pz-muted">Beaucoup d&apos;autres badges arrivent — Scouting, Négociation, Juridique, IA… jusqu&apos;aux rangs Obsidienne et Légende.</div>
      </div>
    </div>
  );
}
