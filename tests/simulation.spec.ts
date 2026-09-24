import { expect, test } from "@playwright/test";
import { SCENARIOS, getScenario, scenariosForChapter, scenariosForLesson } from "../src/lib/simulation";
import {
  allPaths,
  allPreps,
  choose,
  currentNode,
  initialState,
  nextTier,
  replay,
  validPrep,
  xpForScore,
  XP_MAX,
  type Scenario,
  type SimState,
} from "../src/lib/simulation/engine";
import { LEMAIRE } from "../src/lib/simulation/scenarios/lemaire";
import { MBAYE } from "../src/lib/simulation/scenarios/mbaye";
import { MOREL } from "../src/lib/simulation/scenarios/morel";
import { TRAORE } from "../src/lib/simulation/scenarios/traore";
import { COURSE } from "../src/lib/academy-course";

const LESSON_IDS = new Set(COURSE.chapters.flatMap((c) => c.lessons.map((l) => l.id)));
const CHAPTER_IDS = new Set(COURSE.chapters.map((c) => c.id));

function play(sc: Scenario, prep: string[], choices: string[]): SimState {
  let s = initialState(sc, prep);
  for (const id of choices) s = choose(sc, s, id);
  return s;
}

const MBAYE_BEST = ["ancre", "silence", "ecouter", "montage", "temps"];

test.describe("Simulations — tous les scénarios", () => {
  for (const sc of SCENARIOS) {
    test(`${sc.id} : toutes les parties se terminent, note entre 0 et 100`, () => {
      for (const prep of allPreps(sc)) {
        const paths = allPaths(sc, prep);
        expect(paths.length).toBeGreaterThan(50);
        for (const s of paths) {
          expect(s.node).toBe("fin");
          expect(["accord", "rupture", "faute"]).toContain(s.outcome);
          const r = sc.result(s);
          expect(r.score).toBeGreaterThanOrEqual(0);
          expect(r.score).toBeLessThanOrEqual(100);
          expect(r.tiles).toHaveLength(4);
        }
        // Au moins une partie parfaite possible, quelle que soit la préparation.
        expect(Math.max(...paths.map((s) => sc.result(s).score)), prep.join("+")).toBeGreaterThanOrEqual(85);
      }
    });

    test(`${sc.id} : leçons et chapitres cités existent`, () => {
      expect(CHAPTER_IDS.has(sc.chapterId)).toBe(true);
      sc.chapters.forEach((c) => expect(CHAPTER_IDS.has(c), c).toBe(true));
      sc.lessons.forEach((l) => expect(LESSON_IDS.has(l), l).toBe(true));
      for (const node of Object.values(sc.nodes)) {
        for (const c of node.choices) {
          const s = initialState(sc, allPreps(sc)[0]);
          expect(LESSON_IDS.has(c.effect(s).lesson), `${sc.id}/${c.id}`).toBe(true);
        }
      }
    });
  }

  test("registre : scénarios par id, chapitre et leçon", () => {
    expect(getScenario("dossier-mbaye")).toBe(MBAYE);
    expect(getScenario("inconnu")).toBeNull();
    expect(scenariosForChapter("art-negociation")).toContain(MBAYE);
    expect(scenariosForChapter("contrats-mandats")).toContain(TRAORE);
    expect(scenariosForLesson("mineurs")).toContain(TRAORE);
    expect(scenariosForLesson("role")).toEqual([]);
  });
});

test.describe("Le dossier Mbaye — négociation", () => {
  test("la bonne méthode donne « Négociateur confirmé », les pires choix non", () => {
    for (const prep of allPreps(MBAYE)) {
      const r = MBAYE.result(play(MBAYE, prep, MBAYE_BEST));
      expect(r.outcome).toBe("accord");
      expect(r.score, prep.join("+")).toBeGreaterThanOrEqual(85);
      expect(r.grade).toBe("Négociateur confirmé");
      const bad = MBAYE.result(play(MBAYE, prep, ["attendre", "accepter", "baisser", "cede", "signer"]));
      expect(bad.score).toBeLessThan(30);
    }
  });

  test("bluffer sans plan B puis camper fait rompre la négociation", () => {
    const s = play(MBAYE, ["club", "joueur"], ["delirant", "planb", "camper"]);
    expect(s.outcome).toBe("rupture");
    expect(s.flags).toContain("bluff");
    expect(MBAYE.result(s).score).toBeLessThanOrEqual(30);
  });

  test("les choix verrouillés n'apparaissent pas et ne peuvent pas être joués", () => {
    const s = play(MBAYE, ["club", "joueur"], ["ancre", "silence", "camper"]);
    expect(currentNode(MBAYE, s)!.choices.map((c) => c.id)).not.toContain("montage");
    expect(choose(MBAYE, s, "montage")).toBe(s);
    expect(choose(MBAYE, s, "inconnu")).toBe(s);
  });

  test("la meilleure réponse n'est pas toujours affichée au même endroit", () => {
    const positions = new Set<number>();
    for (const prep of allPreps(MBAYE)) {
      let s = initialState(MBAYE, prep);
      for (const id of MBAYE_BEST) {
        positions.add(currentNode(MBAYE, s)!.choices.findIndex((c) => c.id === id));
        s = choose(MBAYE, s, id);
      }
    }
    expect(positions.size).toBe(3);
  });
});

test.describe("Le dossier Traoré — mandat d'un mineur", () => {
  test("une approche exemplaire donne « Agent de confiance »", () => {
    const r = TRAORE.result(play(TRAORE, ["voir-jouer", "cadre"], ["valeur", "ligne", "plan", "honnete", "cadre"]));
    expect(r.outcome).toBe("accord");
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.grade).toBe("Agent de confiance");
    expect(r.tiles.find((t) => t.label === "Intégrité")?.value).toBe("25/25");
  });

  test("proposer de l'argent à la famille ou un cadeau au mineur = faute grave, fin immédiate", () => {
    const argent = play(TRAORE, ["famille", "cadre"], ["presentation", "cadeau"]);
    expect(argent.outcome).toBe("faute");
    expect(argent.history).toHaveLength(2);
    expect(TRAORE.result(argent).grade).toBe("Faute grave");
    expect(TRAORE.result(argent).score).toBeLessThanOrEqual(15);

    const cadeau = play(TRAORE, ["famille", "cadre"], ["presentation", "ligne", "bac", "surenchere"]);
    expect(cadeau.outcome).toBe("faute");
    expect(TRAORE.result(cadeau).score).toBeLessThanOrEqual(15);
  });

  test("se passer de la mère pour la signature fait échouer le mandat", () => {
    const s = play(TRAORE, ["famille", "cadre"], ["presentation", "ligne", "bac", "honnete", "sans-mere"]);
    expect(s.outcome).toBe("rupture");
    expect(TRAORE.result(s).grade).toBe("Pas de mandat");
  });

  test("promesses, départ à l'étranger et précipitation coûtent des points d'intégrité", () => {
    const r = TRAORE.result(play(TRAORE, ["voir-jouer", "famille"], ["promesse", "ligne", "etranger", "honnete", "cesoir"]));
    expect(r.outcome).toBe("accord");
    expect(r.tiles.find((t) => t.label === "Intégrité")?.value).toBe("0/25");
    expect(r.notes.join(" ")).toContain("départ à l'étranger");
    expect(r.score).toBeLessThan(50);
  });

  test("vouloir parler seul au mineur puis rester flou sur l'argent fait rompre", () => {
    const s = play(TRAORE, ["voir-jouer", "famille"], ["seul", "esquive"]);
    expect(s.outcome).toBe("rupture");
  });
});

test.describe("Le dossier Lemaire — crise médiatique", () => {
  test("une gestion exemplaire donne « Gestionnaire de crise » et garde le sponsor", () => {
    const r = LEMAIRE.result(play(LEMAIRE, ["faits", "plan"], ["stop", "verite", "aligner", "transparence", "preparer"]));
    expect(r.outcome).toBe("accord");
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.grade).toBe("Gestionnaire de crise");
    expect(r.tiles.find((t) => t.label === "Sponsor")?.value).toBe("maintenu");
    expect(r.missed).toEqual([]);
  });

  test("laisser poster à chaud puis mentir à la presse fait perdre le contrôle", () => {
    const s = play(LEMAIRE, ["faits", "club"], ["laisser", "mensonge"]);
    expect(s.outcome).toBe("rupture");
    expect(LEMAIRE.result(s).grade).toBe("Crise hors de contrôle");
    expect(LEMAIRE.result(s).score).toBeLessThanOrEqual(30);
  });

  test("le démenti prouvé n'existe que si les faits ont été vérifiés", () => {
    const sans = play(LEMAIRE, ["club", "plan"], ["stop"]);
    expect(currentNode(LEMAIRE, sans)!.choices.map((c) => c.id)).not.toContain("verite");
    const avec = play(LEMAIRE, ["faits", "plan"], ["stop"]);
    expect(currentNode(LEMAIRE, avec)!.choices.map((c) => c.id)).toContain("verite");
  });

  test("off, deux communiqués et improvisation coûtent des points de maîtrise", () => {
    const r = LEMAIRE.result(play(LEMAIRE, ["faits", "plan"], ["stop", "off", "separe", "transparence", "naturel"]));
    expect(r.tiles.find((t) => t.label === "Maîtrise")?.value).toBe("0/25");
    expect(r.notes.join(" ")).toContain("en off");
    expect(r.score).toBeLessThan(50);
  });
});

test.describe("Le dossier Morel — commission & éthique", () => {
  test("une conduite irréprochable donne « Agent irréprochable »", () => {
    const r = MOREL.result(play(MOREL, ["mandat", "texte"], ["clair", "encadrer", "refus-net", "refus-tpo", "tout-montrer"]));
    expect(r.outcome).toBe("accord");
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.grade).toBe("Agent irréprochable");
    expect(r.tiles.find((t) => t.label === "Intégrité")?.value).toBe("25/25");
  });

  test("extra discret, fausse facture et TPO = faute grave, fin immédiate", () => {
    for (const bad of ["extra-discret", "fausse-facture"]) {
      const s = play(MOREL, ["mandat", "texte"], ["clair", "refuser", bad]);
      expect(s.outcome, bad).toBe("faute");
      expect(MOREL.result(s).grade).toBe("Faute grave");
    }
    const tpo = play(MOREL, ["mandat", "texte"], ["clair", "refuser", "refus-net", "accepter-tpo"]);
    expect(tpo.outcome).toBe("faute");
    expect(MOREL.result(tpo).score).toBeLessThanOrEqual(15);
  });

  test("cacher la commission du club au joueur : il le découvre et met fin au mandat", () => {
    for (const last of ["tout-montrer", "priorites"]) {
      const s = play(MOREL, ["mandat", "joueur"], ["clair", "cacher", "refus-net", "refus-tpo", last]);
      expect(s.outcome, last).toBe("rupture");
      expect(MOREL.result(s).grade).toBe("Mandat perdu");
      expect(MOREL.result(s).headline).toContain("caché");
    }
  });

  test("commission au-dessus du plafond et réponses floues coûtent des points d'intégrité", () => {
    const r = MOREL.result(play(MOREL, ["texte", "joueur"], ["gonfle", "refuser", "refus-net", "hesiter", "esquiver"]));
    expect(r.notes.join(" ")).toContain("plafond");
    expect(r.tiles.find((t) => t.label === "Intégrité")?.value).toBe("0/25");
  });
});

test.describe("Simulations — XP", () => {
  test("paliers : 0 / 30 / 60 / 100 XP selon le meilleur score", () => {
    expect(xpForScore(49)).toBe(0);
    expect(xpForScore(50)).toBe(30);
    expect(xpForScore(70)).toBe(60);
    expect(xpForScore(85)).toBe(100);
    expect(xpForScore(100)).toBe(XP_MAX);
    expect(nextTier(0)).toEqual({ min: 50, xp: 30 });
    expect(nextTier(72)).toEqual({ min: 85, xp: 40 });
    expect(nextTier(90)).toBeNull();
  });

  test("le serveur rejoue la partie et refuse les parties truquées", () => {
    const ok = replay(MBAYE, ["club", "planb"], MBAYE_BEST);
    expect(ok?.node).toBe("fin");
    expect(MBAYE.result(ok!).score).toBeGreaterThanOrEqual(85);
    expect(validPrep(MBAYE, ["club", "club"])).toBe(false);
    expect(replay(MBAYE, ["club", "club"], MBAYE_BEST)).toBeNull();
    expect(replay(MBAYE, ["club", "joueur"], ["ancre", "silence", "camper", "montage", "temps"])).toBeNull();
    expect(replay(MBAYE, ["club", "planb"], ["ancre", "triche", "ecouter", "montage", "temps"])).toBeNull();
    expect(replay(MBAYE, ["club", "planb"], ["ancre", "silence"])).toBeNull();
    expect(replay(MBAYE, "club", MBAYE_BEST)).toBeNull();
    expect(replay(MBAYE, ["club", "planb"], [...MBAYE_BEST, "temps"])).toBeNull();
    // Les choix d'un scénario ne valent rien dans un autre.
    expect(replay(TRAORE, ["club", "planb"], MBAYE_BEST)).toBeNull();
    // Une partie terminée tôt (faute) est valide.
    expect(replay(TRAORE, ["famille", "cadre"], ["presentation", "cadeau"])?.outcome).toBe("faute");
  });
});

test("PARZI Academy : la liste des simulations", async ({ page }) => {
  await page.goto("/academy/simulation");
  await expect(page.getByRole("heading", { name: "Simulations" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Jouer : Le dossier Mbaye" })).toBeVisible();
  await page.getByRole("link", { name: "Jouer : Le dossier Traoré" }).click();
  await expect(page.getByRole("heading", { name: "Le dossier Traoré" })).toBeVisible();
});

test("PARZI Academy : simulation Mbaye jouable de bout en bout, avec XP", async ({ page }) => {
  await page.goto("/academy/simulation/dossier-mbaye");
  await expect(page.getByRole("heading", { name: "Le dossier Mbaye" })).toBeVisible();
  await page.getByRole("button", { name: "Préparer le rendez-vous →" }).click();

  const go = page.getByRole("button", { name: "Commencer l'échange →" });
  await expect(go).toBeDisabled();
  await page.getByRole("button", { name: /Te renseigner sur la situation du club/ }).click();
  await page.getByRole("button", { name: /Sécuriser un plan B/ }).click();
  await expect(page.getByRole("button", { name: /Aligner les attentes/ })).toBeDisabled();
  await go.click();

  const answers = [
    /nous visons 48 000 €/,
    /laisses le silence/,
    /Qu'est-ce qui coince exactement/,
    /prime à la signature de 400 000 €/,
    /Je vous rappelle demain à 9 h/,
  ];
  for (const answer of answers) await page.getByRole("button", { name: answer }).click();

  await expect(page.getByRole("heading", { name: "Négociateur confirmé" })).toBeVisible();
  await expect(page.getByText("Débrief, décision par décision")).toBeVisible();
  await expect(page.getByRole("link", { name: /Relire : Techniques & tactiques/ }).first()).toBeVisible();
  await expect(page.getByText(/\+100 XP ajoutés à ton compte|ce palier est déjà obtenu/)).toBeVisible();
  await expect(page.getByText(/toute l'XP de cette simulation/)).toBeVisible();

  // Rejouer le même résultat ne rapporte plus d'XP.
  await page.getByRole("button", { name: "Rejouer avec la même préparation" }).click();
  await expect(page.getByText("Étape 1/5")).toBeVisible();
  for (const answer of answers) await page.getByRole("button", { name: answer }).click();
  await expect(page.getByText("Pas de nouvelle XP : ce palier est déjà obtenu.")).toBeVisible();

  // Le meilleur score et l'XP gagnée sont gardés côté serveur.
  await page.reload();
  await expect(page.getByText(/XP gagnée : 100\/100/)).toBeVisible();
});

test("PARZI Academy : simulation Traoré, une faute grave arrête la partie", async ({ page }) => {
  await page.goto("/academy/simulation/dossier-traore");
  await page.getByRole("button", { name: "Préparer le rendez-vous →" }).click();
  await page.getByRole("button", { name: /Te renseigner sur la famille/ }).click();
  await page.getByRole("button", { name: /Relire le cadre/ }).click();
  await page.getByRole("button", { name: "Commencer l'échange →" }).click();
  await expect(page.getByText("Mme Traoré · mère de Noah").first()).toBeVisible();
  await page.getByRole("button", { name: /Je suis agent licencié/ }).click();
  await expect(page.getByText("Karim · l'oncle").first()).toBeVisible();
  await page.getByRole("button", { name: /3 000 € à la signature/ }).click();
  await expect(page.getByRole("heading", { name: "Faute grave" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Relire : La protection des joueurs mineurs/ })).toBeVisible();
});

test("PARZI Academy : simulation Lemaire jouable de bout en bout", async ({ page }) => {
  await page.goto("/academy/simulation/dossier-lemaire");
  await expect(page.getByRole("heading", { name: "Le dossier Lemaire" })).toBeVisible();
  await page.getByRole("button", { name: "Préparer le rendez-vous →" }).click();
  await page.getByRole("button", { name: /Vérifier les faits/ }).click();
  await page.getByRole("button", { name: /Ressortir ton plan de crise/ }).click();
  await page.getByRole("button", { name: "Commencer l'échange →" }).click();
  for (const answer of [
    /Ne poste rien/,
    /je peux le prouver/,
    /une seule voix/,
    /Je vous appelle d'abord vous/,
    /On prépare trois messages/,
  ]) {
    await page.getByRole("button", { name: answer }).click();
  }
  await expect(page.getByRole("heading", { name: "Gestionnaire de crise" })).toBeVisible();
  await expect(page.getByText(/\+100 XP ajoutés à ton compte|ce palier est déjà obtenu/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Relire : Communication de crise/ }).first()).toBeVisible();
});

test("PARZI Academy : simulation Morel, un « extra discret » est une faute grave", async ({ page }) => {
  await page.goto("/academy/simulation/dossier-morel");
  await expect(page.getByRole("heading", { name: "Le dossier Morel" })).toBeVisible();
  await page.getByRole("button", { name: "Préparer le rendez-vous →" }).click();
  await page.getByRole("button", { name: /Relire ton mandat/ }).click();
  await page.getByRole("button", { name: /Vérifier le règlement/ }).click();
  await page.getByRole("button", { name: "Commencer l'échange →" }).click();
  await page.getByRole("button", { name: /comme prévu dans son mandat/ }).click();
  await page.getByRole("button", { name: /accord écrit de toutes les parties/ }).click();
  await page.getByRole("button", { name: /Discret, ça me va/ }).click();
  await expect(page.getByRole("heading", { name: "Faute grave" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Relire : Éthique, déontologie/ }).first()).toBeVisible();
});

test("PARZI Academy : les simulations sont proposées dans les bons chapitres et leçons", async ({ page }) => {
  await page.goto("/academy/chapitre/art-negociation");
  await expect(page.getByRole("link", { name: /Simulation : Le dossier Mbaye/ })).toBeVisible();
  await page.goto("/academy/lecon/techniques-nego");
  await expect(page.getByRole("link", { name: /Simulation : Le dossier Mbaye/ })).toBeVisible();
  await page.goto("/academy/lecon/mandat");
  await expect(page.getByRole("link", { name: /Simulation : Le dossier Traoré/ })).toBeVisible();
  await page.goto("/academy/chapitre/medias-communication");
  await expect(page.getByRole("link", { name: /Simulation : Le dossier Lemaire/ })).toBeVisible();
  await page.goto("/academy/lecon/deontologie");
  await expect(page.getByRole("link", { name: /Simulation : Le dossier Morel/ })).toBeVisible();
  await page.goto("/academy/chapitre/scouting-evaluation");
  await expect(page.getByRole("link", { name: /Simulation :/ })).toHaveCount(0);
});
