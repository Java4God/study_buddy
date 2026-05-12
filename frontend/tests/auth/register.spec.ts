import { test, expect } from "@playwright/test";
import { generateUser, testWithExistingUser } from "../fixtures/user";

test("register logout login test", async ({ page }) => {
  await page.goto("http://localhost:3000/register");
  const user = generateUser();

  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByTestId("password-input").fill(user.password);
  await page.getByTestId("repeat-password-input").fill(user.password);

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard");

  await page.getByText("Logout").click();

  await expect(page).toHaveURL("http://localhost:3000/login");

  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);

  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard");
});

testWithExistingUser(
  "register with existing email shows error",
  async ({ page, user }) => {
    await page.goto("/register");

    //console.log("Fixture user:", user);
    await page.getByLabel("Username").fill(user.username);
    await page.getByLabel("Email").fill(user.email);
    await page.getByTestId("password-input").fill(user.password);
    await page.getByTestId("repeat-password-input").fill(user.password);

    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Email is already in use.")).toBeVisible();
  },
);

test("register passwords not matching test", async ({ page }) => {
  await page.goto("http://localhost:3000/register");
  const user = generateUser();

  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByTestId("password-input").fill(user.password);
  await page.getByTestId("repeat-password-input").fill("different-password");

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Password's don't match")).toBeVisible();
});
