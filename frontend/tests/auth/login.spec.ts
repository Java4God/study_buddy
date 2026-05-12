import { test, expect } from "@playwright/test";

test("login test", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page.getByLabel("Username").fill("test");
  await page.getByLabel("Password").fill("test1234");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard");
});
