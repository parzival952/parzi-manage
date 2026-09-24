import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

import { friendlyAuthError, isEmailCooldown, isEmailNotConfirmed, parseAuthFragment } from "../src/lib/auth-errors";

test.describe("Inscription — réponses de Supabase", () => {
  test("« patiente N secondes » à l'inscription = e-mail déjà parti, pas une erreur", () => {
    // Réponse réelle de Supabase après un double clic sur « Créer mon compte ».
    const body = {
      code: 429,
      error_code: "over_email_send_rate_limit",
      msg: "For security purposes, you can only request this after 57 seconds.",
    };
    expect(isEmailCooldown(body)).toBe(true);
    // La limite globale d'envoi, elle, reste une vraie erreur.
    expect(isEmailCooldown({ error_code: "over_email_send_rate_limit", msg: "email rate limit exceeded" })).toBe(false);
    expect(friendlyAuthError({ msg: "email rate limit exceeded" })).toMatch(/Réessaie dans une heure/);
  });

  test("adresse non confirmée à la connexion", () => {
    expect(isEmailNotConfirmed({ error_code: "email_not_confirmed", msg: "Email not confirmed" })).toBe(true);
    expect(isEmailNotConfirmed({ error_code: "invalid_credentials", msg: "Invalid login credentials" })).toBe(false);
    expect(friendlyAuthError({ msg: "Invalid login credentials" })).toBe("E-mail ou mot de passe incorrect.");
    expect(friendlyAuthError({ msg: "User already registered" })).toMatch(/Un compte existe déjà/);
  });

  test("lecture du fragment d'un lien d'e-mail", () => {
    expect(parseAuthFragment("")).toBeNull();
    expect(parseAuthFragment("#access_token=a&refresh_token=b&type=signup")).toEqual({
      kind: "session",
      accessToken: "a",
      refreshToken: "b",
      type: "signup",
    });
    expect(parseAuthFragment("#error=access_denied&error_code=otp_expired")).toEqual({ kind: "erreur", expired: true });
    expect(parseAuthFragment("#error=server_error")).toEqual({ kind: "erreur", expired: false });
    expect(parseAuthFragment("#access_token=a")).toBeNull();
  });

  test("le formulaire ne peut pas être envoyé deux fois, et l'inscription mène à « Vérifie ta boîte mail »", async () => {
    // En démo, /academy/connexion redirige (utilisateur démo connecté) : on
    // vérifie donc la page elle-même.
    const src = await readFile("src/app/academy/connexion/page.tsx", "utf8");
    expect(src).toContain("<SubmitButton");
    expect(src).toContain('pendingLabel={isSignup ? "Création du compte…" : "Connexion…"}');
    expect(src).toContain('redirect("/academy/verifie-ton-email")');
    expect(src).toContain('redirect("/academy/verifie-ton-email?non-confirme=1")');
  });
});

test.describe("Inscription — pages", () => {
  test("« Vérifie ta boîte mail » explique la suite et permet de renvoyer l'e-mail", async ({ page }) => {
    await page.goto("/academy/verifie-ton-email");
    await expect(page.getByRole("heading", { name: "Vérifie ta boîte mail" })).toBeVisible();
    await expect(page.getByText(/tu seras connecté directement/)).toBeVisible();
    await expect(page.getByText(/courrier indésirable/)).toBeVisible();
    await page.getByLabel("Adresse e-mail").fill("eleve@example.invalid");
    await page.getByRole("button", { name: /Renvoyer l'e-mail de confirmation/ }).click();
    await page.waitForURL("**/academy/verifie-ton-email?renvoye=1");
    await expect(page.getByText(/Nouvel e-mail envoyé/)).toBeVisible();
    // L'adresse est gardée pour le prochain renvoi.
    await expect(page.getByLabel("Adresse e-mail")).toHaveValue("eleve@example.invalid");
    await expect(page.getByRole("link", { name: /Recommencer l'inscription/ })).toBeVisible();
  });

  test("connexion avec une adresse non confirmée : message clair", async ({ page }) => {
    await page.goto("/academy/verifie-ton-email?non-confirme=1");
    await expect(page.getByText(/Ton adresse n'est pas encore confirmée/)).toBeVisible();
  });

  test("lien de confirmation expiré : message et solutions", async ({ page }) => {
    await page.goto("/academy/confirmation#error=access_denied&error_code=otp_expired");
    await expect(page.getByText(/Ce lien a expiré ou a déjà servi/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Se connecter/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Renvoyer l'e-mail de confirmation/ })).toBeVisible();
  });

  test("lien de confirmation : jeton lu, retiré de l'adresse et vérifié par le serveur", async ({ page }) => {
    await page.goto("/academy/confirmation#access_token=faux&refresh_token=faux&type=signup");
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
    // Jeton faux (et démo sans Supabase) : le serveur refuse, on propose de se connecter.
    await expect(page.getByText(/Ce lien n'est plus valide/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Se connecter/ })).toBeVisible();
  });

  test("sans lien : message", async ({ page }) => {
    await page.goto("/academy/confirmation");
    await expect(page.getByText(/Ce lien n'est pas valide/)).toBeVisible();
  });
});
