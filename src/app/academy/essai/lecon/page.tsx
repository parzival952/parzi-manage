import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import AcademyPublicShell from "@/components/AcademyPublicShell";
import { vitrineHref } from "@/lib/academy-host";
import LessonReader from "@/components/LessonReader";
import { findLesson } from "@/lib/academy-course";
import { SIGNUP_HREF, TRIAL_LESSON_ID, freeChapter } from "@/lib/academy-offer";
import { getAcademyTheme } from "@/lib/academy-theme";

// Essai sans compte : la première leçon du module gratuit, en lecture seule.
// Le quiz, les notes et la suite du module sont dans l'espace élève.
export const metadata = {
  title: "Essai gratuit · leçon",
  description: "Lis une leçon de PARZI Academy sans compte : le rôle réel d'un agent de joueur.",
};

export default async function EssaiLeconPage() {
  const theme = await getAcademyTheme();
  const home = vitrineHref((await headers()).get("host"));
  const found = findLesson(TRIAL_LESSON_ID);
  if (!found) notFound();
  const { lesson } = found;
  const free = freeChapter();
  const others = free.lessons.filter((l) => l.id !== lesson.id);

  return (
    <AcademyPublicShell theme={theme}>
      <div className="px-4 md:px-8 py-8 md:py-10">
        <article className="max-w-[760px] mx-auto flex flex-col gap-6">
          <header className="pz-rise">
            <Link href={home} className="text-[12.5px] pz-muted hover:text-white">
              ← PARZI Academy
            </Link>
            <div className="pz-eyebrow mt-4" style={{ color: "var(--vert)" }}>
              Essai gratuit · Module 1 · {lesson.minutes} min
            </div>
            <h1 className="text-[28px] font-black tracking-tight mt-2">{lesson.title}</h1>
            <p className="text-[15px] leading-7 pz-muted mt-2">{lesson.intro}</p>
          </header>

          <LessonReader blocks={lesson.blocks} />

          <section
            className="rounded-3xl p-6 md:p-7"
            style={{ background: "rgba(194,24,51,.08)", border: "1px solid rgba(194,24,51,.35)" }}
            aria-labelledby="essai-suite"
          >
            <h2 id="essai-suite" className="text-[22px] font-black tracking-tight">
              La suite du module 1 est offerte
            </h2>
            <p className="text-[14px] leading-6 pz-muted mt-2">
              Crée ton compte gratuit pour faire le quiz de cette leçon et continuer «&nbsp;{free.title}&nbsp;» :
            </p>
            <ul className="flex flex-col gap-1.5 mt-3 text-[13.5px]">
              {others.map((l) => (
                <li key={l.id}>
                  · {l.title} <span className="pz-muted pz-mono text-[12px]">· {l.minutes} min</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href={SIGNUP_HREF} className="pz-btn">
                Créer mon compte gratuit →
              </Link>
              <Link href="/academy/essai/simulation" className="pz-btn ghost">
                Essayer une simulation
              </Link>
            </div>
          </section>
        </article>
      </div>
    </AcademyPublicShell>
  );
}
