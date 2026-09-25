export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import AcademyAuthShell, { AuthMessage, authInputClass, authInputStyle } from "@/components/AcademyAuthShell";
import SubmitButton from "@/components/SubmitButton";
import {
  AGE_RANGES,
  COUNTRIES,
  EXAM_HORIZONS,
  GOALS,
  ONBOARDING_STEPS,
  REFERRAL_SOURCES,
  checkStep1,
  checkStep2,
  checkStep3,
  stepToShow,
  type Option,
} from "@/lib/academy-onboarding-fields";
import { finishOnboarding, getMemberProfile, onboardingDone, saveStep1, saveStep2 } from "@/lib/academy-onboarding";
import { getAcademyTheme } from "@/lib/academy-theme";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Faisons connaissance" };

// Inscription progressive : juste après la création du compte (et la
// confirmation de l'e-mail), 3 petits écrans. Chaque étape est enregistrée
// dès qu'elle est validée ; tant que ce n'est pas fini, l'espace Academy
// ramène ici (voir (espace)/layout.tsx).
const TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Faisons connaissance", subtitle: "Trois questions rapides pour adapter ta formation." },
  2: { title: "Ton projet", subtitle: "On cale ton plan d'étude sur ton objectif." },
  3: { title: "Dernière étape", subtitle: "Facultatif : tu peux passer cette étape." },
};

const url = (step: number, erreur?: string) =>
  `/academy/bienvenue?etape=${step}${erreur ? `&erreur=${encodeURIComponent(erreur)}` : ""}`;

export default async function BienvenuePage({
  searchParams,
}: {
  searchParams: Promise<{ etape?: string; erreur?: string }>;
}) {
  const { etape, erreur } = await searchParams;
  const user = await requireUser();
  const profile = await getMemberProfile(user.id);
  if (onboardingDone(profile)) redirect("/academy");
  const step = stepToShow(etape, profile?.step ?? 1);

  async function etape1(formData: FormData) {
    "use server";
    const u = await requireUser();
    const res = checkStep1(formData);
    if (!res.ok) redirect(url(1, res.error));
    await saveStep1(u.id, res.data);
    redirect(url(2));
  }

  async function etape2(formData: FormData) {
    "use server";
    const u = await requireUser();
    const p = await getMemberProfile(u.id);
    if (!p || p.step < 2) redirect(url(1));
    const res = checkStep2(formData);
    if (!res.ok) redirect(url(2, res.error));
    await saveStep2(u.id, res.data);
    redirect(url(3));
  }

  async function etape3(formData: FormData) {
    "use server";
    const u = await requireUser();
    const p = await getMemberProfile(u.id);
    if (!p || p.step < 3) redirect(url(p?.step ?? 1));
    const res = checkStep3(formData, p.age_range);
    if (!res.ok) redirect(url(3, res.error));
    await finishOnboarding(u.id, res.data);
    redirect("/academy");
  }

  async function passer() {
    "use server";
    const u = await requireUser();
    const p = await getMemberProfile(u.id);
    if (!p || p.step < 3) redirect(url(p?.step ?? 1));
    await finishOnboarding(u.id, { phone: "", referralSource: "" });
    redirect("/academy");
  }

  const theme = await getAcademyTheme();
  const { title, subtitle } = TITLES[step];
  const minor = profile?.age_range === "moins-18";

  return (
    <AcademyAuthShell theme={theme} title={title} subtitle={subtitle} backLink={false} wide>
      <Progress step={step} />
      {erreur ? <AuthMessage tone="erreur">{erreur}</AuthMessage> : null}

      {step === 1 ? (
        <form action={etape1} className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Prénom">
              <input
                name="first_name"
                required
                maxLength={60}
                autoComplete="given-name"
                defaultValue={profile?.first_name ?? ""}
                className={authInputClass}
                style={authInputStyle}
              />
            </Field>
            <Field label="Nom">
              <input
                name="last_name"
                required
                maxLength={60}
                autoComplete="family-name"
                defaultValue={profile?.last_name ?? ""}
                className={authInputClass}
                style={authInputStyle}
              />
            </Field>
          </div>
          <Choices legend="Ton âge" name="age_range" options={AGE_RANGES} value={profile?.age_range} columns />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pays">
              <select
                name="country"
                required
                defaultValue={profile?.country ?? ""}
                className={`${authInputClass} pz-select`}
                style={authInputStyle}
              >
                <option value="" disabled>
                  Choisis ton pays
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ville ou région" optional>
              <input
                name="region"
                maxLength={80}
                autoComplete="address-level2"
                placeholder="Ex. Lyon, Île-de-France…"
                defaultValue={profile?.region ?? ""}
                className={authInputClass}
                style={authInputStyle}
              />
            </Field>
          </div>
          <SubmitButton label="Continuer →" pendingLabel="Enregistrement…" className="pz-btn w-full" style={{ padding: "13px 16px" }} />
        </form>
      ) : null}

      {step === 2 ? (
        <form action={etape2} className="flex flex-col gap-5">
          <Choices legend="Ton objectif" name="goal" options={GOALS} value={profile?.goal} />
          <Choices
            legend="Tu comptes passer l'examen d'agent…"
            name="exam_horizon"
            options={EXAM_HORIZONS}
            value={profile?.exam_horizon}
            columns
          />
          <SubmitButton label="Continuer →" pendingLabel="Enregistrement…" className="pz-btn w-full" style={{ padding: "13px 16px" }} />
          <BackLink step={2} />
        </form>
      ) : null}

      {step === 3 ? (
        <form action={etape3} className="flex flex-col gap-5">
          {minor ? null : (
            <Field label="Téléphone" optional>
              <input
                name="phone"
                type="tel"
                maxLength={30}
                autoComplete="tel"
                placeholder="06 12 34 56 78"
                defaultValue={profile?.phone ?? ""}
                className={authInputClass}
                style={authInputStyle}
              />
              <span className="block text-[12px] pz-muted mt-1.5">
                Uniquement pour te recontacter au sujet de ta formation. Jamais revendu ni transmis.
              </span>
            </Field>
          )}
          <Field label="Comment as-tu connu PARZI Academy ?" optional>
            <select
              name="referral_source"
              defaultValue={profile?.referral_source ?? ""}
              className={`${authInputClass} pz-select`}
              style={authInputStyle}
            >
              <option value="">Choisis une réponse</option>
              {REFERRAL_SOURCES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <SubmitButton label="Terminer →" pendingLabel="Enregistrement…" className="pz-btn w-full" style={{ padding: "13px 16px" }} />
          <button type="submit" formAction={passer} formNoValidate className="text-[13px] font-bold pz-muted hover:underline">
            Passer cette étape
          </button>
          <BackLink step={3} />
        </form>
      ) : null}

      <p className="text-[11.5px] pz-muted mt-6 leading-5">
        Ces informations servent uniquement à personnaliser ta formation et à suivre ta progression. Elles ne sont
        ni revendues ni transmises. Tu peux demander à les modifier ou à les supprimer à tout moment.{" "}
        <Link href="/academy/confidentialite" className="font-bold hover:underline">
          En savoir plus
        </Link>
      </p>
    </AcademyAuthShell>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="mb-6" aria-label={`Étape ${step} sur ${ONBOARDING_STEPS}`}>
      <div className="text-[11px] uppercase tracking-[0.16em] pz-muted mb-2">
        Étape {step} sur {ONBOARDING_STEPS}
      </div>
      <div className="pz-xpbar">
        <div className="pz-xpfill" style={{ width: `${(step / ONBOARDING_STEPS) * 100}%` }} />
      </div>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-bold mb-1.5" style={{ color: "var(--texte-2)" }}>
        {label}
        {optional ? <span className="pz-muted font-normal"> · facultatif</span> : null}
      </span>
      {children}
    </label>
  );
}

function Choices({
  legend,
  name,
  options,
  value,
  columns,
}: {
  legend: string;
  name: string;
  options: Option[];
  value?: string | null;
  columns?: boolean;
}) {
  return (
    <fieldset>
      <legend className="block text-[12.5px] font-bold mb-2" style={{ color: "var(--texte-2)" }}>
        {legend}
      </legend>
      <div className={`grid gap-2 ${columns ? "grid-cols-2" : ""}`}>
        {options.map((o) => (
          <label key={o.value} className="pz-choice">
            <input type="radio" name={name} value={o.value} required defaultChecked={value === o.value} />
            <span className="text-[13.5px] leading-5">
              <span className="font-bold text-white">{o.label}</span>
              {o.hint ? <span className="block text-[12px] pz-muted">{o.hint}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function BackLink({ step }: { step: number }) {
  return (
    <Link href={url(step - 1)} className="text-[13px] pz-muted hover:underline text-center">
      ← Étape précédente
    </Link>
  );
}
