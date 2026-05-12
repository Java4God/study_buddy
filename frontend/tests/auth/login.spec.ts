import { expect } from "@playwright/test";
import { testWithExistingUser } from "../fixtures/user";

testWithExistingUser("login test", async ({ page, user }) => {
  await page.goto("http://localhost:3000/login");

  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard");
});

testWithExistingUser(
  "login with wrong email shows error",
  async ({ page, user }) => {
    await page.goto("/login");

    //console.log("Fixture user:", user);
    await page.getByLabel("Username").fill(user.username);
    await page.getByLabel("Password").fill("wrong-password");

    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  },
);

testWithExistingUser(
  "login with wrong username shows error",
  async ({ page, user }) => {
    await page.goto("/login");

    //console.log("Fixture user:", user);
    await page.getByLabel("Username").fill("wrong-username");
    await page.getByLabel("Password").fill(user.password);

    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  },
);

testWithExistingUser("auto login test", async ({ page, user }) => {
  await page.goto("/login");

  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);

  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard");

  await page.goto("/login");

  await expect(page).toHaveURL("http://localhost:3000/dashboard");
});
