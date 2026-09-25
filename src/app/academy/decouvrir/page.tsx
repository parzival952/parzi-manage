import Link from "next/link";
import type { ReactNode } from "react";

import AcademyIcon, { type AcademyIconName } from "@/components/AcademyIcon";
import AcademyPublicShell from "@/components/AcademyPublicShell";
import { COURSE, findLesson } from "@/lib/academy-course";
import {
  FREE_CHAPTER_ID,
  OFFER,
  SIGNUP_HREF,
  TRIAL_LESSON_ID,
  TRIAL_SCENARIO_ID,
  academyFigures,
  formatEur,
  freeChapter,
} from "@/lib/academy-offer";
import { getAcademyTheme } from "@/lib/academy-theme";
import { SCENARIOS, getScenario } from "@/lib/simulation";

// Page d'accueil publique de PARZI Academy. Sur parziacademy.fr, un visiteur
// sans session qui arrive sur /academy voit cette page (réécriture dans
// src/proxy.ts) ; les élèves connectés arrivent directement dans leur espace.
// Objectif : transformer une visite en inscription (module 1 offert), avec un
// essai sans compte pour convaincre par l'expérience plutôt que par la promesse.

export const metadata = {
  title: { absolute: "PARZI Academy — Deviens agent de joueur. Module 1 offert." },
  description:
    "Prépare la licence d'agent de joueur : leçons courtes, quiz, mises en situation réalistes et examens blancs. Le module 1 est offert, sans carte bancaire.",
  alternates: { canonical: "/academy" },
};

export default async function DecouvrirPage() {
  const theme = await getAcademyTheme();
  const f = academyFigures();
  const free = freeChapter();
  const trialLesson = findLesson(TRIAL_LESSON_ID)?.lesson;
  const trialSim = getScenario(TRIAL_SCENARIO_ID);
  const heures = Math.round(f.minutes / 60);

  return (
    <AcademyPublicShell theme={theme}>
      {/* 1. Promesse */}
      <section className="px-4 md:px-8 pt-12 md:pt-20 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div className="pz-rise">
            <span className="pz-rank" style={{ color: "var(--vert)", borderColor: "rgba(59,175,114,.4)" }}>
              <AcademyIcon name="sparkle" size={14} /> Module 1 offert · sans carte bancaire
            </span>
            <h1 className="text-[38px] md:text-[54px] leading-[1.05] font-black tracking-tight mt-5">
              Deviens agent de joueur.
              <br />
              <span className="pz-red">Commence gratuitement.</span>
            </h1>
            <p className="text-[16px] leading-7 pz-muted mt-5 max-w-[560px]">
              {`La formation pour préparer la licence d'agent : ${f.lessons} leçons courtes, ${f.simulations} mises en situation où tu prends les décisions, et des examens blancs. Le premier module, «\u00a0${free.title}\u00a0», est offert.`}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-7">
              <Link href={SIGNUP_HREF} className="pz-btn" style={{ padding: "14px 24px" }}>
                Créer mon compte gratuit →
              </Link>
              <Link href="/academy/essai/simulation" className="pz-btn ghost" style={{ padding: "14px 22px" }}>
                Essayer sans compte
              </Link>
            </div>
            <p className="text-[12.5px] pz-muted mt-3">Inscription en 30 secondes · aucune carte demandée</p>
          </div>

          {trialSim ? <SimulationTeaser title={trialSim.title} theme={trialSim.theme} /> : null}
        </div>
      </section>

      {/* 2. Les chiffres */}
      <section className="px-4 md:px-8 pb-12" aria-label="La formation en chiffres">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3">
          <Chiffre valeur={f.chapters} label="modules" />
          <Chiffre valeur={f.lessons} label="leçons" />
          <Chiffre valeur={f.questions} label="questions de quiz" />
          <Chiffre valeur={f.simulations} label="mises en situation" />
          <Chiffre valeur={f.certifications} label="certifications" className="col-span-2 md:col-span-1" />
        </div>
      </section>

      {/* 3. Essai sans compte */}
      <Bloc id="essai" eyebrow="Essaie maintenant" titre="Fais-toi un avis en 5 minutes, sans compte">
        <div className="grid md:grid-cols-2 gap-4">
          {trialSim ? (
            <CarteEssai
              icone="target"
              tag={`Mise en situation · ${trialSim.theme}`}
              titre={trialSim.title}
              texte={`${trialSim.pitch} Tu choisis ta préparation, puis chaque réponse. À la fin : ta note et un débrief décision par décision.`}
              href="/academy/essai/simulation"
              action="Jouer la simulation →"
            />
          ) : null}
          {trialLesson ? (
            <CarteEssai
              icone="book"
              tag={`Leçon · ${trialLesson.minutes} min · module 1`}
              titre={trialLesson.title}
              texte={`${trialLesson.intro} Une leçon comme les ${f.lessons} autres : un cas concret, l'erreur classique à éviter, l'essentiel à retenir.`}
              href="/academy/essai/lecon"
              action="Lire la leçon →"
            />
          ) : null}
        </div>
      </Bloc>

      {/* 4. Comment ça marche */}
      <Bloc eyebrow="Comment ça marche" titre="De zéro à l'examen, étape par étape">
        <ol className="grid md:grid-cols-3 gap-4">
          <Etape n={1} titre="Crée ton compte" texte="Gratuit, en 30 secondes. Tu dis où tu en es et quand tu vises l'examen." />
          <Etape
            n={2}
            titre="Fais le point"
            texte="Un diagnostic de départ repère tes points forts et tes points faibles, puis te propose un plan d'étude."
          />
          <Etape
            n={3}
            titre="Progresse jusqu'à l'examen"
            texte="Leçons, quiz, révision de tes erreurs, mises en situation et examens blancs, à ton rythme, sur téléphone ou ordinateur."
          />
        </ol>
      </Bloc>

      {/* 5. Programme */}
      <Bloc eyebrow="Le programme" titre={`${f.chapters} modules, du cadre juridique à la négociation`}>
        <ol className="grid md:grid-cols-2 gap-3">
          {COURSE.chapters.map((c, i) => (
            <li key={c.id} className="pz-card p-4 flex gap-4 items-start">
              <span className="pz-mono text-[13px] pz-muted w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-[14.5px]">{c.title}</span>
                  {c.id === FREE_CHAPTER_ID ? (
                    <span
                      className="text-[10.5px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                      style={{ color: "var(--vert)", border: "1px solid rgba(59,175,114,.4)" }}
                    >
                      Offert
                    </span>
                  ) : null}
                </div>
                <p className="text-[12.5px] leading-5 pz-muted mt-1">{c.subtitle}</p>
                <p className="text-[11.5px] pz-muted pz-mono mt-1.5">{c.lessons.length} leçons</p>
              </div>
            </li>
          ))}
        </ol>
      </Bloc>

      {/* 6. Simulations */}
      <Bloc
        eyebrow="Mises en situation"
        titre="Apprends à décider, pas seulement à réciter"
        intro="Tu es l'agent. Chaque dossier te met face à un vrai dilemme du métier : tes choix ont des conséquences, et tu reçois un débrief précis à la fin."
      >
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SCENARIOS.map((s) => (
            <li key={s.id} className="pz-card p-4">
              <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
                {s.theme}
              </div>
              <div className="font-extrabold text-[14.5px] mt-1.5">{s.title}</div>
              <p className="text-[12.5px] leading-5 pz-muted mt-1">{s.pitch}</p>
            </li>
          ))}
        </ul>
      </Bloc>

      {/* 7. Offre */}
      <Bloc id="offre" eyebrow="L'offre" titre="Commence gratuitement, continue si ça te plaît">
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
          <div className="pz-card p-6 flex flex-col">
            <div className="pz-eyebrow" style={{ color: "var(--vert)" }}>
              Pour commencer
            </div>
            <div className="text-[30px] font-black mt-2">Gratuit</div>
            <p className="text-[13px] pz-muted mt-1">Sans carte bancaire.</p>
            <ul className="flex flex-col gap-2 mt-5 text-[13.5px] flex-1">
              <Inclus>
                Le module 1, «&nbsp;{free.title}&nbsp;» : {free.lessons.length} leçons
              </Inclus>
              <Inclus>Les quiz de chaque leçon</Inclus>
              <Inclus>Ton espace personnel et ta progression</Inclus>
            </ul>
            <Link href={SIGNUP_HREF} className="pz-btn w-full mt-6">
              Créer mon compte gratuit →
            </Link>
          </div>

          <div className="pz-card p-6 flex flex-col" style={{ borderColor: "rgba(194,24,51,.45)" }}>
            <div className="pz-eyebrow pz-red">Accès complet</div>
            <div className="text-[30px] font-black mt-2">
              {OFFER.oneTimeEur !== null ? formatEur(OFFER.oneTimeEur) : "Bientôt"}
              {OFFER.oneTimeEur !== null ? (
                <span className="text-[14px] font-bold pz-muted"> en une fois</span>
              ) : null}
            </div>
            <p className="text-[13px] pz-muted mt-1">
              {OFFER.monthlyEur !== null
                ? `ou ${formatEur(OFFER.monthlyEur)} par mois, sans engagement.`
                : "Paiement en une fois ou au mois, au choix."}
            </p>
            <ul className="flex flex-col gap-2 mt-5 text-[13.5px] flex-1">
              <Inclus>
                Les {f.chapters} modules : {f.lessons} leçons, environ {heures} h de cours
              </Inclus>
              <Inclus>Les {f.simulations} mises en situation</Inclus>
              <Inclus>Révision intelligente et carnet d&apos;erreurs</Inclus>
              <Inclus>Certifications et examens blancs de la licence</Inclus>
            </ul>
            <p className="text-[12.5px] pz-muted mt-6">
              Tu décides après le module 1. Rien à payer pour commencer.
            </p>
          </div>
        </div>
      </Bloc>

      {/* 8. Questions fréquentes */}
      <Bloc eyebrow="Questions fréquentes" titre="Avant de te lancer">
        <div className="flex flex-col gap-2 max-w-3xl">
          <Question q="Le module 1 est-il vraiment gratuit ?">
            Oui. Tu crées ton compte sans carte bancaire et tu suis tout le module «&nbsp;{free.title}&nbsp;». Tu
            décides ensuite si tu veux l&apos;accès complet.
          </Question>
          <Question q="PARZI Academy délivre-t-elle la licence d'agent ?">
            Non. La licence s&apos;obtient en réussissant l&apos;examen officiel (en France, auprès de la Fédération
            française de football). PARZI Academy t&apos;y prépare : cours, quiz, révision et examens blancs.
          </Question>
          <Question q="Combien de temps faut-il ?">
            Les leçons durent 5 à 7 minutes, environ {heures} heures de cours au total, à ton rythme. À
            l&apos;inscription, tu indiques quand tu vises l&apos;examen : ton plan d&apos;étude s&apos;adapte.
          </Question>
          <Question q="Faut-il déjà connaître le milieu du football ?">
            Non. La formation part des bases du métier. Elle s&apos;adresse aux étudiants, aux personnes en
            reconversion, aux proches de joueurs et à tous ceux qui veulent devenir agent.
          </Question>
          <Question q="Sur quel appareil ?">
            Sur téléphone comme sur ordinateur, dans ton navigateur. Rien à installer.
          </Question>
          <Question q="Que faites-vous de mes données ?">
            Uniquement ta formation : pas de publicité, rien n&apos;est revendu, et tu peux supprimer ton compte à tout
            moment.{" "}
            <Link href="/academy/confidentialite" className="font-bold pz-red hover:underline">
              Tout est expliqué ici
            </Link>
            .
          </Question>
        </div>
      </Bloc>

      {/* 9. Dernier appel */}
      <section className="px-4 md:px-8 py-14">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-8 md:p-10 text-center"
          style={{ background: "linear-gradient(135deg, rgba(194,24,51,.16), rgba(194,24,51,.04))", border: "1px solid rgba(194,24,51,.35)" }}
        >
          <h2 className="text-[28px] md:text-[34px] font-black tracking-tight">Ta carrière d&apos;agent commence ici.</h2>
          <p className="text-[14.5px] pz-muted mt-3">Le module 1 est offert. Tu peux commencer dans une minute.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href={SIGNUP_HREF} className="pz-btn" style={{ padding: "14px 24px" }}>
              Créer mon compte gratuit →
            </Link>
            <Link href="/academy/essai/simulation" className="pz-btn ghost" style={{ padding: "14px 22px" }}>
              Essayer sans compte
            </Link>
          </div>
        </div>
      </section>
    </AcademyPublicShell>
  );
}

function Bloc({
  id,
  eyebrow,
  titre,
  intro,
  children,
}: {
  id?: string;
  eyebrow: string;
  titre: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-4 md:px-8 py-12 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="pz-eyebrow pz-red">{eyebrow}</div>
        <h2 className="text-[26px] md:text-[32px] font-black tracking-tight mt-2">{titre}</h2>
        {intro ? <p className="text-[14.5px] leading-7 pz-muted mt-2 max-w-[640px]">{intro}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function Chiffre({ valeur, label, className = "" }: { valeur: number; label: string; className?: string }) {
  return (
    <div className={`pz-card px-4 py-4 text-center ${className}`}>
      <div className="text-[28px] font-black pz-mono leading-none">{valeur}</div>
      <div className="text-[12px] pz-muted mt-1.5">{label}</div>
    </div>
  );
}

function CarteEssai({
  icone,
  tag,
  titre,
  texte,
  href,
  action,
}: {
  icone: AcademyIconName;
  tag: string;
  titre: string;
  texte: string;
  href: string;
  action: string;
}) {
  return (
    <Link href={href} className="pz-card p-5 flex flex-col group hover:border-[color:var(--argent)] transition-colors">
      <div className="flex items-center gap-2 pz-eyebrow" style={{ color: "var(--argent)" }}>
        <AcademyIcon name={icone} size={14} /> {tag}
      </div>
      <div className="text-[19px] font-extrabold mt-2">{titre}</div>
      <p className="text-[13.5px] leading-6 pz-muted mt-2 flex-1">{texte}</p>
      <span className="text-[13.5px] font-bold pz-red mt-4 group-hover:underline">{action}</span>
    </Link>
  );
}

function Etape({ n, titre, texte }: { n: number; titre: string; texte: string }) {
  return (
    <li className="pz-card p-5">
      <span
        className="w-8 h-8 rounded-full grid place-items-center font-black text-white pz-mono text-[14px]"
        style={{ background: "var(--rouge)" }}
      >
        {n}
      </span>
      <div className="font-extrabold text-[16px] mt-3">{titre}</div>
      <p className="text-[13.5px] leading-6 pz-muted mt-1.5">{texte}</p>
    </li>
  );
}

function Inclus({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 items-start">
      <AcademyIcon name="check" size={16} style={{ color: "var(--vert)", marginTop: 3 }} />
      <span>{children}</span>
    </li>
  );
}

function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="pz-card px-5 py-4 group">
      <summary className="font-bold text-[14.5px] cursor-pointer list-none flex justify-between gap-4">
        {q}
        <span className="pz-muted group-open:rotate-45 transition-transform" aria-hidden>
          +
        </span>
      </summary>
      <p className="text-[13.5px] leading-6 pz-muted mt-3">{children}</p>
    </details>
  );
}

/** Aperçu d'un moment de simulation (contenu réel du dossier Mbaye). */
function SimulationTeaser({ title, theme }: { title: string; theme: string }) {
  return (
    <div className="pz-card p-5 md:p-6 pz-rise pz-d2" aria-label="Aperçu d'une mise en situation">
      <div className="flex items-center justify-between gap-3">
        <div className="pz-eyebrow" style={{ color: "var(--argent)" }}>
          {theme} · {title}
        </div>
        <span className="text-[11px] pz-mono pz-muted whitespace-nowrap shrink-0">Moment 5 / 5</span>
      </div>
      <div className="rounded-2xl p-4 mt-4" style={{ background: "rgba(var(--ink-rgb),.04)", border: "1px solid var(--ligne)" }}>
        <div className="text-[11.5px] font-bold pz-muted">Le directeur sportif</div>
        <p className="text-[14.5px] leading-6 mt-1">
          « Il me faut votre réponse ce soir. Sinon, on passe à un autre profil. »
        </p>
      </div>
      <div className="text-[12px] font-bold mt-4">Que réponds-tu ?</div>
      <div className="flex flex-col gap-2 mt-2">
        {[
          "« Je dois en parler à Yanis. Je vous rappelle demain à 9 h. »",
          "« D'accord, on signe ce soir. »",
          "« L'autre club attend aussi ma réponse. Un dernier geste et c'est fait. »",
        ].map(
          (o) => (
            <div key={o} className="pz-opt text-[13px]" style={{ padding: "10px 12px", cursor: "default" }}>
              {o}
            </div>
          ),
        )}
      </div>
      <Link href="/academy/essai/simulation" className="pz-btn w-full mt-4" style={{ padding: "12px 16px" }}>
        Jouer ce dossier gratuitement →
      </Link>
    </div>
  );
}
