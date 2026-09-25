import { expect, test } from "@playwright/test";

import { COURSE, LESSON_COUNT } from "../src/lib/academy-course";
import { ACADEMY_LANDING_PATH, landingRewrite, vitrineHref } from "../src/lib/academy-host";
import { FREE_CHAPTER_ID, OFFER, academyFigures, comparatif, formatEur } from "../src/lib/academy-offer";
import { SCENARIOS } from "../src/lib/simulation";

test.describe("Accueil public — règles", () => {
  test("la racine du site est toujours la vitrine, connecté ou non", () => {
    expect(landingRewrite("/", false)).toBe(ACADEMY_LANDING_PATH);
    expect(landingRewrite("/", true)).toBe(ACADEMY_LANDING_PATH);
    expect(vitrineHref("www.parziacademy.fr")).toBe("/");
    expect(vitrineHref("parziacademy.fr")).toBe("/");
    // Ailleurs (préversions, local), la racine appartient à Parzi Manage.
    expect(vitrineHref("localhost:3100")).toBe(ACADEMY_LANDING_PATH);
    expect(vitrineHref(null)).toBe(ACADEMY_LANDING_PATH);
  });

  test("sur /academy, un visiteur sans session voit l'accueil public, un élève connecté son espace", () => {
    expect(landingRewrite("/academy", false)).toBe(ACADEMY_LANDING_PATH);
    expect(landingRewrite("/academy/", false)).toBe(ACADEMY_LANDING_PATH);
    expect(landingRewrite("/academy", true)).toBeNull();
    // Les autres pages ne sont pas concernées (protégées → connexion, comme avant).
    expect(landingRewrite("/academy/lecon/role", false)).toBeNull();
    expect(landingRewrite("/academy/connexion", false)).toBeNull();
    expect(landingRewrite("/academy/decouvrir", false)).toBeNull();
  });

  test("l'offre : module 1 gratuit, chiffres calculés depuis la formation", () => {
    expect(COURSE.chapters[0].id).toBe(FREE_CHAPTER_ID);
    const f = academyFigures();
    expect(f.lessons).toBe(LESSON_COUNT);
    expect(f.chapters).toBe(COURSE.chapters.length);
    expect(f.simulations).toBe(SCENARIOS.length);
    expect(f.questions).toBeGreaterThan(100);
    expect(formatEur(99).replace(/\s/g, " ")).toBe("99 €");
  });
});

test("comparatif : chaque ligne est renseignée, l'accès complet inclut tout", () => {
  const groupes = comparatif();
  expect(groupes.length).toBeGreaterThanOrEqual(4);
  const lignes = groupes.flatMap((g) => g.lignes);
  expect(lignes.length).toBeGreaterThan(12);
  for (const l of lignes) {
    expect(l.complet, l.quoi).not.toBe(false); // rien d'exclu de l'accès complet
    expect(new Set(lignes.map((x) => x.quoi)).size).toBe(lignes.length);
  }
  const quiz = lignes.find((l) => l.quoi === "Quiz libre")!;
  expect(quiz.gratuit).toMatch(/^Niveau 1 · \d+ questions$/);
  expect(quiz.complet).toContain(String(academyFigures().quizLibre));
});

test("PARZI Academy : l'accueil public présente l'offre et mène à l'inscription", async ({ page }) => {
  await page.goto("/academy/decouvrir");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Deviens agent de joueur.");
  await expect(page.getByText("Module 1 offert · sans carte bancaire")).toBeVisible();

  // Programme : tous les modules, le premier marqué « Offert ».
  for (const c of COURSE.chapters) await expect(page.getByText(c.title, { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Offert", { exact: true })).toHaveCount(1);
  // Toutes les simulations sont présentées.
  for (const s of SCENARIOS) await expect(page.getByText(s.title, { exact: true }).first()).toBeVisible();
  // Prix de l'accès complet.
  if (OFFER.oneTimeEur !== null) await expect(page.getByText(/99\s€/).first()).toBeVisible();

  // Tableau comparatif.
  const table = page.getByRole("table", { name: /Comparaison des fonctionnalités/ });
  await expect(table).toBeVisible();
  await expect(table.getByRole("rowheader", { name: /Examen blanc de la licence/ })).toBeVisible();
  await expect(table.getByRole("rowheader", { name: /^Quiz libre/ })).toBeVisible();

  // Les appels à l'action mènent à l'inscription et à l'essai.
  const signup = page.getByRole("link", { name: "Créer mon compte gratuit →" }).first();
  await expect(signup).toHaveAttribute("href", "/academy/connexion?mode=inscription");
  await page.getByRole("link", { name: "Essayer sans compte" }).first().click();
  await expect(page).toHaveURL(/\/academy\/essai\/simulation$/);
  await expect(page.getByRole("heading", { name: "Le dossier Mbaye" })).toBeVisible();
});

test("PARZI Academy : simulation d'essai sans compte, jouable jusqu'au bout", async ({ page }) => {
  await page.goto("/academy/essai/simulation");
  await expect(page.getByText("Essai gratuit · sans compte")).toBeVisible();
  await expect(page.getByText(/la partie n'est pas enregistrée/)).toBeVisible();
  await expect(page.getByText(/Jusqu'à 100 XP/)).toHaveCount(0);

  await page.getByRole("button", { name: "Préparer le rendez-vous →" }).click();
  await page.getByRole("button", { name: /Te renseigner sur la situation du club/ }).click();
  await page.getByRole("button", { name: /Sécuriser un plan B/ }).click();
  await page.getByRole("button", { name: "Commencer l'échange →" }).click();
  for (const answer of [
    /nous visons 48 000 €/,
    /laisses le silence/,
    /Qu'est-ce qui coince exactement/,
    /prime à la signature de 400 000 €/,
    /Je vous rappelle demain à 9 h/,
  ]) {
    await page.getByRole("button", { name: answer }).click();
  }

  await expect(page.getByRole("heading", { name: "Négociateur confirmé" })).toBeVisible();
  await expect(page.getByText("Beau réflexe d'agent.")).toBeVisible();
  await expect(page.getByText(/XP ajoutés/)).toHaveCount(0);
  // Pas de lien vers une leçon réservée aux élèves : on invite à s'inscrire.
  await expect(page.getByRole("link", { name: /Relire :/ })).toHaveCount(0);
  await expect(page.getByText(/Leçon liée : Techniques & tactiques/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Créer mon compte gratuit →" }).last()).toHaveAttribute(
    "href",
    "/academy/connexion?mode=inscription",
  );
});

test("PARZI Academy : leçon d'essai sans compte, puis invitation au module 1", async ({ page }) => {
  await page.goto("/academy/essai/lecon");
  await expect(page.getByRole("heading", { name: "Le rôle réel d'un agent" })).toBeVisible();
  await expect(page.getByText(/La règle d'or du métier : la confiance/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "La suite du module 1 est offerte" })).toBeVisible();
  await expect(page.getByText(/L'écosystème du football/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Créer mon compte gratuit →" }).last()).toHaveAttribute(
    "href",
    "/academy/connexion?mode=inscription",
  );
});
