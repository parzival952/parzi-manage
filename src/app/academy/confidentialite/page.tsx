import Link from "next/link";
import type { ReactNode } from "react";

import AcademyAuthShell from "@/components/AcademyAuthShell";
import { getAcademyTheme } from "@/lib/academy-theme";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confidentialité",
  description: "Quelles données PARZI Academy collecte, pourquoi, combien de temps, et comment exercer tes droits.",
};

// Politique de confidentialité de PARZI Academy (information RGPD, art. 13).
// L'adresse de contact vient de la variable d'environnement
// PRIVACY_CONTACT_EMAIL (réglée dans Vercel) : aucune adresse e-mail dans le
// code, le dépôt est public. À faire relire par un juriste ; à tenir à jour à
// chaque nouvelle donnée collectée ou nouveau prestataire.
const MISE_A_JOUR = "25 septembre 2026";

export default async function ConfidentialitePage() {
  const theme = await getAcademyTheme();
  const contact = process.env.PRIVACY_CONTACT_EMAIL?.trim();

  const ecrireNous = contact ? (
    <>
      écris-nous à{" "}
      <a href={`mailto:${contact}`} className="font-bold pz-red hover:underline">
        {contact}
      </a>
    </>
  ) : (
    <>écris-nous à l&apos;adresse de contact de PARZI Academy</>
  );

  return (
    <AcademyAuthShell
      theme={theme}
      title="Confidentialité"
      subtitle={`Tes données sur PARZI Academy, expliquées simplement. Mise à jour : ${MISE_A_JOUR}.`}
      backLink={false}
      wide
    >
      <div className="text-[14px] leading-6 flex flex-col gap-7" style={{ color: "var(--texte-2)" }}>
        <Section titre="En bref">
          <ul className="flex flex-col gap-1.5">
            <li>· On ne collecte que ce qui sert à ta formation.</li>
            <li>· On ne vend ni ne loue tes données. Aucune publicité.</li>
            <li>· Les statistiques du site sont anonymes, sans cookie.</li>
            <li>· Tu peux consulter, corriger ou supprimer tes données quand tu veux.</li>
          </ul>
        </Section>

        <Section titre="Qui est responsable ?">
          <p>
            PARZI Academy (parziacademy.fr) est éditée par PARZI, responsable du traitement de tes données. Pour
            toute question, {ecrireNous}.
          </p>
        </Section>

        <Section titre="Ce qu'on collecte, et pourquoi">
          <Donnee
            quoi="Ton compte"
            detail="Adresse e-mail et mot de passe. Le mot de passe est chiffré : personne, même pas nous, ne peut le lire."
            pourquoi="Créer et sécuriser ton compte, t'envoyer les e-mails liés au compte (confirmation, mot de passe oublié)."
            base="Nécessaire pour fournir le service que tu demandes."
          />
          <Donnee
            quoi="« Faisons connaissance »"
            detail="Prénom, nom, tranche d'âge, pays, ville ou région (facultatif), objectif, échéance de ton examen."
            pourquoi="Personnaliser ta formation et ton plan d'étude ; afficher ton prénom et l'initiale de ton nom dans le classement ; mieux comprendre qui suit la formation (statistiques internes)."
            base="Nécessaire pour fournir le service (requis pour accéder aux cours, sauf la ville ou région)."
          />
          <Donnee
            quoi="Informations facultatives"
            detail="Numéro de téléphone, et comment tu as connu PARZI Academy. Le téléphone n'est jamais demandé aux moins de 18 ans."
            pourquoi="Te recontacter au sujet de ta formation ; savoir comment les élèves nous découvrent."
            base="Ton consentement : tu peux laisser vide, et le retirer à tout moment."
          />
          <Donnee
            quoi="Ta progression"
            detail="Leçons suivies, réponses aux quiz, au diagnostic et aux simulations, XP, badges, notes personnelles."
            pourquoi="Faire fonctionner la formation : révisions, carnet d'erreurs, plan d'étude, classement."
            base="Nécessaire pour fournir le service."
          />
          <Donnee
            quoi="Statistiques de fréquentation"
            detail="Pages vues et parcours sur le site, de façon anonyme : aucun cookie, aucun lien avec ton compte ou ton e-mail."
            pourquoi="Savoir quelles pages sont utiles et où les visiteurs décrochent, pour améliorer le site."
            base="Notre intérêt légitime à améliorer le site."
          />
          <Donnee
            quoi="Journaux techniques"
            detail="Adresse IP, date et page demandée, conservés par nos hébergeurs."
            pourquoi="Sécurité du site et correction des pannes."
            base="Notre intérêt légitime à sécuriser le site."
          />
        </Section>

        <Section titre="Qui y a accès ?">
          <p>
            Seul PARZI a accès à tes données, ainsi que les prestataires techniques qui font tourner le site, pour ce
            seul usage :
          </p>
          <ul className="flex flex-col gap-1.5 mt-2">
            <li>· Supabase : base de données et comptes (serveurs dans l&apos;Union européenne) ;</li>
            <li>· Vercel : hébergement du site ;</li>
            <li>· Resend : envoi des e-mails liés à ton compte ;</li>
            <li>· PostHog : statistiques anonymes (serveurs dans l&apos;Union européenne).</li>
          </ul>
          <p className="mt-2">
            Certains de ces prestataires sont établis aux États-Unis : les transferts de données sont alors encadrés
            par les garanties prévues par le RGPD. Les autres élèves ne voient que ton prénom, l&apos;initiale de ton
            nom et ton XP dans le classement.
          </p>
        </Section>

        <Section titre="Combien de temps ?">
          <ul className="flex flex-col gap-1.5">
            <li>· Tes données de compte, de profil et de progression : tant que ton compte existe.</li>
            <li>
              · Si tu supprimes ton compte depuis ton profil : tout est effacé immédiatement. Si tu nous le demandes par
              écrit : dans un délai d&apos;un mois, sauf si la loi nous oblige à garder quelque chose.
            </li>
            <li>· Un compte sans aucune connexion pendant 3 ans est supprimé, après t&apos;avoir prévenu.</li>
            <li>· Les statistiques de fréquentation : 25 mois au maximum.</li>
          </ul>
        </Section>

        <Section titre="Cookies">
          <p>PARZI Academy n&apos;utilise que des cookies nécessaires au fonctionnement du site :</p>
          <ul className="flex flex-col gap-1.5 mt-2">
            <li>· ta session de connexion (pour rester connecté, jusqu&apos;à 30 jours) ;</li>
            <li>· l&apos;adresse en attente de confirmation après ton inscription (24 heures) ;</li>
            <li>· ton choix de thème clair ou sombre, et ta langue.</li>
          </ul>
          <p className="mt-2">
            Aucun cookie publicitaire ni de pistage. C&apos;est pourquoi il n&apos;y a pas de bandeau cookies. Pendant
            le diagnostic de départ, ta progression est aussi gardée sur ton appareil pour ne pas la perdre en cas de
            coupure.
          </p>
        </Section>

        <Section titre="Si tu as moins de 18 ans">
          <p>
            Si tu as moins de 15 ans, demande l&apos;accord d&apos;un parent avant de créer ton compte. Pour les moins
            de 18 ans, on ne demande et on ne garde jamais de numéro de téléphone.
          </p>
        </Section>

        <Section titre="Tes droits">
          <p>
            Tu peux à tout moment accéder à tes données, les corriger, les faire supprimer, en limiter
            l&apos;utilisation, t&apos;opposer à certains usages, les récupérer dans un format lisible, et retirer ton
            consentement pour les informations facultatives. Pour cela, {ecrireNous} depuis l&apos;adresse de ton
            compte : on te répond sous un mois.
          </p>
          <p className="mt-2">
            Tu peux aussi supprimer ton compte toi-même, tout de suite :{" "}
            <Link href="/academy/compte/supprimer" className="font-bold pz-red hover:underline">
              supprimer mon compte
            </Link>
            .
          </p>
          <p className="mt-2">
            Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une réclamation à la CNIL (
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="font-bold pz-red hover:underline">
              cnil.fr
            </a>
            ).
          </p>
        </Section>

        <Section titre="Sécurité">
          <p>
            Le site est entièrement chiffré (HTTPS). Tes données ne sont accessibles qu&apos;au serveur de
            l&apos;application, jamais directement depuis Internet, et ton mot de passe n&apos;est jamais stocké en
            clair.
          </p>
        </Section>

        <p className="text-[13px] pz-muted text-center">
          <Link href="/academy" className="font-bold pz-red hover:underline">
            ← Retour à PARZI Academy
          </Link>
        </p>
      </div>
    </AcademyAuthShell>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[16px] font-extrabold text-white mb-2">{titre}</h2>
      {children}
    </section>
  );
}

function Donnee({ quoi, detail, pourquoi, base }: { quoi: string; detail: string; pourquoi: string; base: string }) {
  return (
    <div className="rounded-xl px-4 py-3 mb-2.5" style={{ border: "1px solid var(--ligne)", background: "rgba(var(--ink-rgb),.03)" }}>
      <div className="font-bold text-white text-[14px]">{quoi}</div>
      <div className="text-[13px] mt-1">{detail}</div>
      <div className="text-[13px] mt-1.5">
        <span className="pz-muted">Pourquoi : </span>
        {pourquoi}
      </div>
      <div className="text-[12.5px] mt-1 pz-muted">Base légale : {base}</div>
    </div>
  );
}
