export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { canTakeCert, findCert, getMyCerts, submitExam } from "@/lib/certifications";
import CertExam from "@/components/CertExam";

export default async function CertExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const cert = findCert(id);
  if (!cert) notFound();

  const mine = await getMyCerts(user.id);
  if (mine.has(id)) redirect(`/academy/certifications/${id}/diplome`);

  const unlocked = await canTakeCert(user.id, cert);

  async function submit(answers: number[]) {
    "use server";
    const u = await requireUser();
    let correct = 0;
    cert!.exam.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    const score = Math.round((correct / cert!.exam.length) * 100);
    const res = await submitExam(u.id, id, score);
    revalidatePath("/academy/certifications");
    revalidatePath("/academy/profil");
    return res;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="pz-rise">
        <Link href="/academy/certifications" className="text-[12.5px] pz-muted hover:text-white">← Certifications</Link>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-2">{cert.name}</h1>
        <p className="text-[13.5px] pz-muted mt-1">{cert.subtitle} · seuil {cert.passScore}%</p>
      </div>

      {unlocked ? (
        <CertExam certId={id} questions={cert.exam.map((q) => ({ q: q.q, options: q.options }))} onSubmit={submit} />
      ) : (
        <div className="pz-card p-6 text-center">
          <div className="text-[36px] mb-2">🔒</div>
          <h2 className="text-[17px] font-bold mb-1">Certification verrouillée</h2>
          <p className="text-[13.5px] pz-muted mb-4">Prérequis : {cert.prereqLabel}.</p>
          <Link href="/academy" className="pz-btn w-full">Continuer le parcours</Link>
        </div>
      )}
    </div>
  );
}
