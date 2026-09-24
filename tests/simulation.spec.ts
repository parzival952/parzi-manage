import { expect, test } from "@playwright/test";
import {
  allPaths,
  choose,
  currentNode,
  initialState,
  NODE_ORDER,
  PREPS,
  result,
  validPrep,
  type PrepId,
} from "../src/lib/academy-simulation";

const PREP_COMBOS: PrepId[][] = [
  ["club", "planb"],
  ["club", "joueur"],
  ["planb", "joueur"],
];

const BEST = ["ancre", "silence", "ecouter", "montage", "temps"];

test.describe("Simulation de négociation — moteur", () => {
  test("toutes les parties se terminent, avec une note entre 0 et 100", () => {
    for (const prep of PREP_COMBOS) {
      const paths = allPaths(prep);
      expect(paths.length).toBeGreaterThan(50);
      for (const s of paths) {
        expect(s.node).toBe("fin");
        expect(["accord", "rupture"]).toContain(s.outcome);
        expect(s.history.length).toBeLessThanOrEqual(NODE_ORDER.length);
        const r = result(s);
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
      }
    }
  });

  test("la bonne méthode donne « Négociateur confirmé », les pires choix non", () => {
    for (const prep of PREP_COMBOS) {
      let s = initialState(prep);
      for (const id of BEST) s = choose(s, id);
      const r = result(s);
      expect(r.outcome).toBe("accord");
      expect(r.score, prep.join("+")).toBeGreaterThanOrEqual(85);
      expect(r.grade).toBe("Négociateur confirmé");

      let bad = initialState(prep);
      for (const id of ["attendre", "accepter", "baisser", "cede", "signer"]) bad = choose(bad, id);
      expect(result(bad).score).toBeLessThan(30);
      expect(result(bad).belowFloor).toBe(true);
    }
  });

  test("bluffer sans plan B puis camper fait rompre la négociation", () => {
    let s = initialState(["club", "joueur"]);
    for (const id of ["delirant", "planb", "camper"]) s = choose(s, id);
    expect(s.outcome).toBe("rupture");
    expect(s.flags).toContain("bluff");
    expect(result(s).score).toBeLessThanOrEqual(30);
  });

  test("les choix verrouillés n'apparaissent pas et ne peuvent pas être joués", () => {
    let s = initialState(["club", "joueur"]);
    for (const id of ["ancre", "silence", "camper"]) s = choose(s, id);
    expect(currentNode(s)!.choices.map((c) => c.id)).not.toContain("montage");
    expect(choose(s, "montage")).toBe(s);
    expect(choose(s, "inconnu")).toBe(s);
  });

  test("la meilleure réponse n'est pas toujours affichée au même endroit", () => {
    const positions = new Set<number>();
    for (const prep of PREP_COMBOS) {
      let s = initialState(prep);
      for (const id of BEST) {
        positions.add(currentNode(s)!.choices.findIndex((c) => c.id === id));
        s = choose(s, id);
      }
    }
    expect(positions.size).toBe(3);
  });

  test("préparation : exactement 2 éléments connus et distincts", () => {
    expect(validPrep(["club", "planb"])).toBe(true);
    expect(validPrep(["club"])).toBe(false);
    expect(validPrep(["club", "club"])).toBe(false);
    expect(validPrep(["club", "planb", "joueur"])).toBe(false);
    expect(validPrep(["club", "hack"])).toBe(false);
    expect(PREPS).toHaveLength(3);
  });
});

test("PARZI Academy : simulation jouable de bout en bout", async ({ page }) => {
  await page.goto("/academy/simulation");
  await expect(page.getByRole("heading", { name: "Simulation de négociation" })).toBeVisible();
  await page.getByRole("button", { name: "Préparer le rendez-vous →" }).click();

  const enter = page.getByRole("button", { name: "Entrer dans le bureau →" });
  await expect(enter).toBeDisabled();
  await page.getByRole("button", { name: /Te renseigner sur la situation du club/ }).click();
  await page.getByRole("button", { name: /Sécuriser un plan B/ }).click();
  await expect(page.getByRole("button", { name: /Aligner les attentes/ })).toBeDisabled();
  await enter.click();

  const answers = [
    /nous visons 48 000 €/,
    /laisses le silence/,
    /Qu'est-ce qui coince exactement/,
    /prime à la signature de 400 000 €/,
    /Je vous rappelle demain à 9 h/,
  ];
  for (const answer of answers) {
    await page.getByRole("button", { name: answer }).click();
  }

  await expect(page.getByRole("heading", { name: "Négociateur confirmé" })).toBeVisible();
  await expect(page.getByText("Débrief, décision par décision")).toBeVisible();
  await expect(page.getByRole("link", { name: /Relire : Techniques & tactiques/ }).first()).toBeVisible();
  await expect(page.getByText(/Meilleur score : 9\d\/100/)).toBeVisible();

  await page.getByRole("button", { name: "Rejouer avec la même préparation" }).click();
  await expect(page.getByText("Étape 1/5")).toBeVisible();
});

test("PARZI Academy : la simulation est proposée dans le chapitre Négociation", async ({ page }) => {
  await page.goto("/academy/chapitre/art-negociation");
  await expect(page.getByRole("link", { name: /Simulation : négocie le contrat de ton joueur/ })).toBeVisible();
  await page.goto("/academy/lecon/techniques-nego");
  await expect(page.getByRole("link", { name: /Simulation : négocie le contrat de ton joueur/ })).toBeVisible();
  await page.goto("/academy/chapitre/fondamentaux");
  await expect(page.getByRole("link", { name: /Simulation : négocie le contrat de ton joueur/ })).toHaveCount(0);
});
