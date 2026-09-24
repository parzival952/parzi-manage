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
});
