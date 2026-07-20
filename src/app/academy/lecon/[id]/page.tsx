export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { completeLesson, findLesson } from "@/lib/academy";
import LessonQuiz from "@/components/LessonQuiz";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const found = findLesson(id);
  if (!found) notFound();
  const { chapter, lesson, index } = found;

  async function complete(score: number) {
    "use server";
    const u = await requireUser();
    const res = await completeLesson(u.id, lesson.id, score);
    revalidatePath("/academy");
    revalidatePath("/academy/profil");
    return { already: res.already, xpGained: res.xpGained, leveledUp: res.leveledUp, newLevel: res.newLevel, streak: res.streak };
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="pz-rise">
        <Link href="/academy" className="text-[12.5px] pz-muted hover:text-white">← {chapter.title}</Link>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[12px] font-bold pz-red">LEÇON {index + 1}</span>
          <span className="text-[12px] pz-muted">· {lesson.minutes} min</span>
        </div>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-1">{lesson.title}</h1>
        <p className="text-[14px] pz-muted mt-1.5">{lesson.intro}</p>
      </div>

      <div className="pz-card p-6 flex flex-col gap-4 pz-rise pz-d1">
        {lesson.blocks.map((b, i) => (
          <p key={i} className="text-[14.5px] leading-relaxed" style={{ color: "#D8DADF" }}>{b}</p>
        ))}
      </div>

      <div className="pz-rise pz-d2">
        <div className="text-[11px] font-bold tracking-wider pz-red mb-3">QUIZ — VALIDE TA LEÇON</div>
        <LessonQuiz questions={lesson.quiz} onComplete={complete} />
      </div>
    </div>
  );
}
