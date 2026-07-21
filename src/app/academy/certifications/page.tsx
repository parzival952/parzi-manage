export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { chaptersCompleted, getProgress } from "@/lib/academy";
import { CERTS, getMyCerts } from "@/lib/certifications";

export const metadata = { title: "Certifications" };

export default async function CertificationsPage() {
  const user = await requireUser();
  const [p, mine] = await Promise.all([getProgress(user.id), getMyCerts(user.id)]);
  const ctx = { chapters: chaptersCompleted(p.done), lessons: p.done.size, level: p.info.level };

  return (
    <div className="flex flex-col gap-5">
      <div className="pz-rise">
        <h1 className="text-[22px] font-extrabold tracking-tight">Certifications</h1>
        <p className="text-[13.5px] pz-muted mt-1">Prouve tes compétences. Chaque certification délivre un <b className="pz-red">diplôme numérique vérifiable</b>.</p>
      </div>

      {CERTS.map((c) => {
        const earned = mine.get(c.id);
        const unlocked = c.prereq(ctx);
        return (
          <div key={c.id} className="pz-card p-5 pz-rise pz-d1" style={{ borderColor: earned ? "rgba(233,195,106,.4)" : undefined }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-extrabold text-[17px]">{c.name}</div>
                <div className="text-[12.5px] pz-muted">{c.subtitle}</div>
              </div>
              {earned ? (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(233,195,106,.15)", color: "var(--or)" }}>✓ OBTENUE</span>
              ) : unlocked ? (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(228,0,43,.15)", color: "var(--rougeclair)" }}>DISPONIBLE</span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full pz-muted" style={{ border: "1px solid var(--ligne)" }}>🔒 VERROUILLÉE</span>
              )}
            </div>
            <p className="text-[13px] pz-muted mt-3 leading-relaxed">{c.desc}</p>
            <div className="text-[12px] pz-muted mt-2">Examen : {c.exam.length} questions · seuil {c.passScore}% · +{c.bonusXp} XP</div>

            {earned ? (
              <Link href={`/academy/certifications/${c.id}/diplome`} className="pz-btn w-full mt-4" style={{ background: "linear-gradient(90deg,#b8902f,var(--or))", color: "#1a1a1a" }}>🎓 Voir mon diplôme</Link>
            ) : unlocked ? (
              <Link href={`/academy/certifications/${c.id}`} className="pz-btn w-full mt-4">Passer l&apos;examen</Link>
            ) : (
              <div className="mt-4 text-[12px] pz-muted" style={{ borderLeft: "2px solid var(--rouge)", paddingLeft: 10 }}>Prérequis : {c.prereqLabel}</div>
            )}
          </div>
        );
      })}

      <div className="pz-card p-5 pz-rise pz-d2">
        <p className="text-[12px] pz-muted leading-relaxed">
          <b className="text-white">Intégrité :</b> PARZI certifie tes <b className="text-white">compétences</b>, pas la licence officielle d&apos;agent (FFF/FIFA). Le module « Réglementation » te prépare aux exigences réelles, sans s&apos;y substituer.
        </p>
      </div>
    </div>
  );
}
