import { expect, test } from "@playwright/test";
import { login, testWithExistingUser } from "../fixtures/user";

testWithExistingUser(
    "user profile page loads for authenticated user",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto(`/profile/${user.id}`);

        await expect(page).toHaveURL(new RegExp(`/profile/${user.id}$`));
        await expect(
            page.getByRole("heading", { name: /profile/i, level: 1 }),
        ).toBeVisible();
        await expect(page.getByText(user.username)).toBeVisible();
        await expect(page.getByText(user.email)).toBeVisible();
        await expect(page.getByText(/pomodoros/i)).toBeVisible();
        await expect(page.getByText(/study time/i)).toBeVisible();
        await expect(page.getByText(/flashcards/i).first()).toBeVisible();
        await expect(page.getByText(/exams coming up/i)).toBeVisible();
    },
);

testWithExistingUser(
    "user profile tabs switch correctly",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto(`/profile/${user.id}`);

        await page.getByRole("tab", { name: /friends/i }).click();
        await expect(page.getByText(/sarah chen/i)).toBeVisible();
        await expect(page.getByText(/mike brown/i)).toBeVisible();

        await page.getByRole("tab", { name: /activity/i }).click();
        await expect(page.getByText(/recent activity/i)).toBeVisible();
        await expect(page.getByText(/week warrior/i)).toBeVisible();

        await page.getByRole("tab", { name: /achievements/i }).click();
        await expect(page.getByText(/first timer/i)).toBeVisible();
        await expect(page.getByText(/flashcard master/i)).toBeVisible();
    },
);

testWithExistingUser(
    "user profile shows add friend action",
    async ({ page, user }) => {
        await login({ request: page.request, page, user });

        await page.goto(`/profile/${user.id}`);

        await page.getByRole("tab", { name: /friends/i }).click();
        await expect(
            page.getByRole("button", { name: /add friend/i }),
        ).toBeVisible();
    },
);

test("user profile redirects unauthenticated user to login", async ({ page }) => {
    const fakeUserId = crypto.randomUUID();

    await page.goto(`/profile/${fakeUserId}`);

    await expect(page).toHaveURL(/\/login/);
});