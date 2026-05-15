import { expect, test } from "@playwright/test";
import { login, testWithExistingUser } from "../fixtures/user";

testWithExistingUser(
    "profile me page loads for authenticated user",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto("/profile/me");

        await expect(page).toHaveURL(/\/profile\/me$/);
        await expect(page.getByRole('heading', { name: /profile/i, level: 1 })).toBeVisible();
        await expect(page.getByText(user.username)).toBeVisible();
        await expect(page.getByText(user.email)).toBeVisible();
        await expect(page.getByText(/pomodoros/i)).toBeVisible();
        await expect(page.getByText(/study time/i)).toBeVisible();
        await expect(page.getByText(/flashcards/i).first()).toBeVisible();
        await expect(page.getByText(/exams coming up/i)).toBeVisible();
    },
);

testWithExistingUser(
    "profile me edit mode can be opened and canceled",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto("/profile/me");

        await page.getByRole("button", { name: /edit profile/i }).click();

        const emailInput = page.getByRole("textbox");
        await expect(emailInput).toBeVisible();
        await expect(emailInput).toHaveValue(user.email);

        await emailInput.fill("updated-cancel@test.com");
        await page.getByRole("button", { name: /cancel/i }).click();

        await expect(page.getByText(user.email)).toBeVisible();
        await expect(page.getByRole("button", { name: /edit profile/i })).toBeVisible();
    },
);

testWithExistingUser(
    "profile me tabs switch correctly",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto("/profile/me");

        await page.getByRole("tab", { name: /friends/i }).click();
        await expect(page.getByText(/sarah chen/i)).toBeVisible();
        await expect(page.getByText(/mike brown/i)).toBeVisible();

        await page.getByRole("tab", { name: /activity/i }).click();
        await expect(page.getByText(/recent activity/i)).toBeVisible();

        await page.getByRole("tab", { name: /achievements/i }).click();
        await expect(page.getByText(/first timer/i)).toBeVisible();
        await expect(page.getByText(/week warrior/i)).toBeVisible();
    },
);

testWithExistingUser(
    "profile me email can be updated",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto("/profile/me");

        const newEmail = `updated-${crypto.randomUUID().slice(0, 8)}@test.com`;

        await page.getByRole("button", { name: /edit profile/i }).click();

        const emailInput = page.getByRole("textbox");
        await expect(emailInput).toBeVisible();

        await emailInput.fill(newEmail);
        await page.getByRole("button", { name: /save changes/i }).click();

        await expect(page.getByText(newEmail)).toBeVisible();
        await expect(page.getByRole("button", { name: /edit profile/i })).toBeVisible();
    },
);

test("profile me redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/profile/me");

    await expect(page).toHaveURL(/\/login/);
});