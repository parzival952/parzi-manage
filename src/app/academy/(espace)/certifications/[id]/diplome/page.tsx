export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findCert, getMyCerts } from "@/lib/certifications";
import PrintButton from "@/components/PrintButton";

export const metadata = { title: "Diplôme" };

export default async function DiplomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const cert = findCert(id);
  if (!cert) notFound();
  const mine = await getMyCerts(user.id);
  const earned = mine.get(id);
  if (!earned) redirect(`/academy/certifications/${id}`);

  const name = user.email.split("@")[0];
  const date = new Date(earned.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between no-print pz-rise">
        <Link href="/academy/certifications" className="text-[12.5px] pz-muted hover:text-white">← Certifications</Link>
        <PrintButton />
      </div>

      {/* Diplôme */}
      <div id="diplome" className="pz-rise" style={{
        borderRadius: 20, padding: 3,
        background: "linear-gradient(150deg,#E9C36A,#7a5a1e 40%,#7a5a1e 60%,#E9C36A)",
        boxShadow: "0 24px 60px rgba(0,0,0,.5)",
      }}>
        <div style={{
          borderRadius: 18, padding: "34px 28px", textAlign: "center",
          background: "radial-gradient(120% 80% at 50% 0,rgba(233,195,106,.12),transparent 55%),linear-gradient(180deg,#16161b,#0c0c10)",
          border: "1px solid rgba(233,195,106,.25)",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", fontFamily: "Oswald", fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#E4002B,#8f0018)" }}>P</span>
            <span style={{ fontFamily: "Oswald", fontWeight: 700, letterSpacing: 1, fontSize: 17 }}>PARZI ACADEMY</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#E9C36A", marginBottom: 6 }}>Certificat de compétences</div>
          <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 30, letterSpacing: 1 }}>{cert.name}</div>
          <div style={{ fontSize: 12.5, color: "#8A8F98", marginBottom: 22 }}>{cert.subtitle}</div>

          <div style={{ fontSize: 12.5, color: "#8A8F98" }}>Décerné à</div>
          <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 26, textTransform: "uppercase", letterSpacing: 1, margin: "2px 0 18px" }}>{name}</div>

          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(233,195,106,.4),transparent)", margin: "0 auto 18px", maxWidth: 280 }} />

          <div style={{ display: "flex", justifyContent: "center", gap: 34, flexWrap: "wrap", fontSize: 12.5 }}>
            <div><div style={{ color: "#8A8F98" }}>Date</div><div style={{ fontWeight: 700 }}>{date}</div></div>
            <div><div style={{ color: "#8A8F98" }}>Score</div><div style={{ fontWeight: 700, color: "#E9C36A" }}>{earned.score}%</div></div>
            <div><div style={{ color: "#8A8F98" }}>Identifiant</div><div style={{ fontWeight: 700, fontFamily: "monospace" }}>{earned.code}</div></div>
          </div>

          <div style={{ fontSize: 10.5, color: "#5a5a62", marginTop: 24, lineHeight: 1.5, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
            Vérifiable via l&apos;identifiant ci-dessus. PARZI certifie des compétences, pas la licence officielle d&apos;agent (FFF/FIFA).
          </div>
        </div>
      </div>

      <p className="text-[12px] pz-muted text-center no-print">Partage-le ou enregistre-le en PDF avec le bouton Imprimer.</p>
    </div>
  );
}
