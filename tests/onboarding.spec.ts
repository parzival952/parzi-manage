import { expect, test } from "@playwright/test";

import { checkStep1, checkStep2, checkStep3, stepToShow } from "../src/lib/academy-onboarding-fields";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

test.describe("Inscription progressive — validation", () => {
  test("étape 1 : prénom, nom, âge et pays obligatoires, lettres seulement", () => {
    const ok = checkStep1(form({ first_name: "  Yanis ", last_name: "Ben  Ali", age_range: "18-25", country: "France", region: "" }));
    expect(ok).toEqual({
      ok: true,
      data: { firstName: "Yanis", lastName: "Ben Ali", ageRange: "18-25", country: "France", region: "" },
    });
    expect(checkStep1(form({ first_name: "Zoé", last_name: "N'Diaye-Lefèvre", age_range: "26-35", country: "Sénégal" })).ok).toBe(true);
    expect(checkStep1(form({ first_name: "", last_name: "X", age_range: "18-25", country: "France" }))).toMatchObject({ ok: false });
    expect(checkStep1(form({ first_name: "<script>", last_name: "X", age_range: "18-25", country: "France" }))).toMatchObject({
      ok: false,
      error: /que des lettres/,
    });
    expect(checkStep1(form({ first_name: "Yanis", last_name: "B", age_range: "12", country: "France" }))).toMatchObject({ ok: false });
    expect(checkStep1(form({ first_name: "Yanis", last_name: "B", age_range: "18-25", country: "Atlantide" }))).toMatchObject({ ok: false });
  });

  test("étape 2 : objectif et échéance dans la liste", () => {
    expect(checkStep2(form({ goal: "licence", exam_horizon: "3-6-mois" })).ok).toBe(true);
    expect(checkStep2(form({ goal: "autre", exam_horizon: "3-6-mois" })).ok).toBe(false);
    expect(checkStep2(form({ goal: "licence", exam_horizon: "" })).ok).toBe(false);
  });

  test("étape 3 : facultative, téléphone vérifié, jamais gardé pour un mineur", () => {
    expect(checkStep3(form({}), "18-25")).toEqual({ ok: true, data: { phone: "", referralSource: "" } });
    expect(checkStep3(form({ phone: "06 12 34 56 78", referral_source: "tiktok" }), "18-25")).toEqual({
      ok: true,
      data: { phone: "06 12 34 56 78", referralSource: "tiktok" },
    });
    expect(checkStep3(form({ phone: "+33 6 12 34 56 78" }), "26-35").ok).toBe(true);
    expect(checkStep3(form({ phone: "appelle-moi" }), "18-25")).toMatchObject({ ok: false, error: /téléphone/ });
    expect(checkStep3(form({ phone: "123" }), "18-25").ok).toBe(false);
    expect(checkStep3(form({ phone: "06 12 34 56 78" }), "moins-18")).toEqual({ ok: true, data: { phone: "", referralSource: "" } });
    expect(checkStep3(form({ referral_source: "radio" }), "18-25").ok).toBe(false);
  });

  test("on ne peut pas sauter d'étape", () => {
    expect(stepToShow(undefined, 1)).toBe(1);
    expect(stepToShow("3", 1)).toBe(1);
    expect(stepToShow("2", 3)).toBe(2);
    expect(stepToShow(undefined, 3)).toBe(3);
    expect(stepToShow("9", 4)).toBe(3);
    expect(stepToShow("abc", 2)).toBe(2);
  });
});

test("PARZI Academy : inscription progressive en 3 étapes, reprise et fin", async ({ page }) => {
  await page.goto("/academy/bienvenue");
  await expect(page.getByRole("heading", { name: "Faisons connaissance" })).toBeVisible();
  await expect(page.getByText("Étape 1 sur 3")).toBeVisible();

  // Étape 1 — mineur : le téléphone ne sera pas demandé.
  await page.getByLabel("Prénom").fill("Yanis");
  await page.getByLabel("Nom", { exact: true }).fill("Benali");
  await page.getByLabel("Moins de 18 ans").check();
  await page.getByLabel("Pays").selectOption("France");
  await page.getByLabel(/Ville ou région/).fill("Lyon");
  await page.getByRole("button", { name: "Continuer →" }).click();

  // Étape 2.
  await expect(page.getByRole("heading", { name: "Ton projet" })).toBeVisible();
  await expect(page.getByText("Étape 2 sur 3")).toBeVisible();
  await page.getByLabel(/Obtenir la licence d'agent/).check();
  await page.getByLabel("Dans 3 à 6 mois").check();
  await page.getByRole("button", { name: "Continuer →" }).click();

  // Étape 3 : pas de téléphone pour un mineur.
  await expect(page.getByRole("heading", { name: "Dernière étape" })).toBeVisible();
  await expect(page.getByLabel(/Téléphone/)).toHaveCount(0);

  // Retour à l'étape 1 : les réponses sont gardées ; on corrige l'âge.
  await page.goto("/academy/bienvenue?etape=1");
  await expect(page.getByLabel("Prénom")).toHaveValue("Yanis");
  await expect(page.getByLabel("Moins de 18 ans")).toBeChecked();
  await page.getByLabel("18 – 25 ans").check();
  await page.getByRole("button", { name: "Continuer →" }).click();
  await expect(page.getByLabel(/Obtenir la licence d'agent/)).toBeChecked();
  await page.getByRole("button", { name: "Continuer →" }).click();

  // Étape 3 : téléphone proposé (facultatif) et contrôlé.
  await page.getByLabel(/Téléphone/).fill("appelle-moi");
  await page.getByLabel(/Comment as-tu connu/).selectOption("tiktok");
  await page.getByRole("button", { name: "Terminer →" }).click();
  await expect(page.getByText("Ce numéro de téléphone ne semble pas valide.")).toBeVisible();
  await page.getByLabel(/Téléphone/).fill("06 12 34 56 78");
  await page.getByRole("button", { name: "Terminer →" }).click();
  await page.waitForURL(/\/academy$/);

  // Terminé : la page renvoie vers l'Academy.
  await page.goto("/academy/bienvenue");
  await page.waitForURL(/\/academy$/);

  // Accueil personnalisé : prénom, objectif, rythme conseillé.
  await expect(page.getByText("Salut Yanis,")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cap sur ta licence d'agent" })).toBeVisible();
  await expect(page.getByText(/Examen visé dans environ 24 semaines : vise \d+ leçons? par semaine/)).toBeVisible();

  // « Modifier » : on change l'objectif et l'échéance, retour direct à l'accueil.
  await page.getByRole("link", { name: /Modifier mon objectif/ }).click();
  await expect(page.getByRole("heading", { name: "Ton projet" })).toBeVisible();
  await expect(page.getByText("Étape 2 sur 3")).toHaveCount(0);
  await page.getByLabel(/Découvrir le métier/).check();
  await page.getByLabel("Je ne sais pas encore").check();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.waitForURL(/\/academy$/);
  await expect(page.getByRole("heading", { name: "Découvre le métier à ton rythme" })).toBeVisible();
  await expect(page.getByText(/Pas encore de date d'examen/)).toBeVisible();
});

test.describe("Accueil personnalisé — rythme", () => {
  test("rythme conseillé selon l'échéance et les leçons restantes", async () => {
    const { examPace, paceSentence } = await import("../src/lib/academy-goal-plan");
    const now = new Date("2026-09-25T12:00:00Z");
    const weeksAgo = (n: number) => new Date(now.getTime() - n * 7 * 24 * 3600 * 1000);
    expect(examPace({ horizon: "moins-3-mois", startedAt: now, now, remainingLessons: 48 })).toEqual({
      kind: "rythme",
      weeksLeft: 12,
      perWeek: 4,
    });
    expect(examPace({ horizon: "3-6-mois", startedAt: weeksAgo(4), now, remainingLessons: 40 })).toEqual({
      kind: "rythme",
      weeksLeft: 20,
      perWeek: 2,
    });
    // Échéance dépassée : on garde au moins 1 semaine.
    expect(examPace({ horizon: "moins-3-mois", startedAt: weeksAgo(30), now, remainingLessons: 5 })).toEqual({
      kind: "rythme",
      weeksLeft: 1,
      perWeek: 5,
    });
    expect(examPace({ horizon: "pas-prevu", startedAt: now, now, remainingLessons: 10 })).toEqual({ kind: "libre" });
    expect(examPace({ horizon: null, startedAt: null, now, remainingLessons: 10 })).toEqual({ kind: "libre" });
    expect(examPace({ horizon: "3-6-mois", startedAt: now, now, remainingLessons: 0 })).toEqual({ kind: "termine" });
    expect(paceSentence({ kind: "rythme", weeksLeft: 1, perWeek: 1 })).toBe(
      "Examen visé dans environ 1 semaine : vise 1 leçon par semaine pour tout couvrir à temps.",
    );
  });
});

test.describe("Confidentialité", () => {
  test("le classement affiche prénom + initiale, jamais l'e-mail", async () => {
    const { publicName } = await import("../src/lib/academy");
    expect(publicName("Yanis", "benali")).toBe("Yanis B.");
    expect(publicName("Zoé", "")).toBe("Zoé");
    expect(publicName(null, null)).toBe("Élève");
    expect(publicName("  ", "Benali")).toBe("Élève");
  });

  test("la page Confidentialité répond aux questions essentielles", async ({ page }) => {
    await page.goto("/academy/confidentialite");
    await expect(page.getByRole("heading", { name: "Confidentialité", level: 1 })).toBeVisible();
    for (const titre of ["Qui est responsable ?", "Ce qu'on collecte, et pourquoi", "Qui y a accès ?", "Combien de temps ?", "Cookies", "Tes droits"]) {
      await expect(page.getByRole("heading", { name: titre })).toBeVisible();
    }
    await expect(page.getByText(/Base légale : Ton consentement/)).toBeVisible();
    await expect(page.getByRole("link", { name: "cnil.fr" })).toHaveAttribute("href", "https://www.cnil.fr");
  });

  test("les statistiques sont anonymes et sans cookie", async () => {
    const { readFile } = await import("node:fs/promises");
    const src = await readFile("src/components/Analytics.tsx", "utf8");
    expect(src).toContain('cookieless_mode: "always"');
    expect(src).toContain('person_profiles: "never"');
    expect(src).not.toContain("identify(");
    const layout = await readFile("src/app/layout.tsx", "utf8");
    expect(layout).toContain("<Analytics />");
  });
});
