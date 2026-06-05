import { expect } from "@playwright/test";
import { testWithExistingUser } from "../fixtures/user";

const API_DOMAIN = process.env.API_DOMAIN || "http://localhost:8080/";

/*
testWithExistingUser(
    "password reset full flow",
    async ({ page, request, user }) => {
        const newPassword = "NewPass1234!";

        // Step 1: Otvara login page i pokreće password reset
        await page.goto("/login");
        await page.waitForLoadState("networkidle");
        await page.getByRole("button", { name: "Forgot password?" }).click();

        // Step 2: popunjava mail i submitta zahtjev
        await page.getByLabel("Email").fill(user.email);
        await page.getByRole("button", { name: "Send reset email" }).click();

        // Step 3: čeka da se reset request izvrši (da backend spremi token)
        await page.waitForResponse(
            (resp) =>
                resp.url().includes("/password-reset/request") && resp.status() === 200,
        );

        // mali delay za spremanje u bazu
        await page.waitForTimeout(500);

        // Step 4: Dohvaća reset token direkt iz backenda (dev-only test endpoint)
        const tokenResp = await request.get(
            `${API_DOMAIN}password-reset/latest-token?email=${encodeURIComponent(user.email)}`,
        );
        expect(tokenResp.ok()).toBeTruthy();
        const { token } = await tokenResp.json();
        expect(token).toBeTruthy();

        // Step 5: dolazi do reset stranice s tokenom
        await page.goto(`/reset-password?token=${token}`);
        await page.waitForLoadState("networkidle");

        // Step 6: popunjava novi password i potvrđuje
        await page.getByLabel("New password").fill(newPassword);
        await page.getByLabel("Confirm password").fill(newPassword);
        await page.getByRole("button", { name: "Update password" }).click();

        // Step 7: očekuje success message
        await expect(
            page.getByText(/password reset successful|successfully reset/i),
        ).toBeVisible();

        // Step 8: provjera da novi password radi loginom
        await page.goto("/login");
        await page.waitForLoadState("networkidle");
        await page.getByLabel("Username").fill(user.username);
        await page.getByLabel("Password").fill(newPassword);
        await page.getByRole("button", { name: "Sign In" }).click();

        await expect(page).toHaveURL("http://localhost:3000/dashboard");
    },
);
*/

testWithExistingUser(
  "password reset with invalid token shows error",
  async ({ page }) => {
    await page.goto("/reset-password?token=invalid-token-12345");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("New password").fill("NewPass1234!");
    await page.getByLabel("Confirm password").fill("NewPass1234!");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText(/invalid|non-existent|token/i)).toBeVisible();
  },
);

testWithExistingUser(
  "password reset with mismatched passwords shows error",
  async ({ page }) => {
    await page.goto("/reset-password?token=any-token");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("New password").fill("Password1234!");
    await page.getByLabel("Confirm password").fill("DifferentPass1234!");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  },
);
