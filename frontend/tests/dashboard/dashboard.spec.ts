import { expect } from "@playwright/test";
import { login, testWithExistingUser } from "../fixtures/user";

testWithExistingUser(
  "dashboard timer navigation test",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });

    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Start Timer" }).click();

    await expect(page.getByText("Pomodoro Timer")).toBeVisible();

    await page.getByText("Dashboard").click();

    await expect(page.getByText("Welcome back!")).toBeVisible();
  },
);

testWithExistingUser(
  "dashboard exams navigation test",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });

    await page.goto("/dashboard");

    await page.getByRole("button", { name: "View All Exams" }).click();

    await expect(page.getByRole("button", { name: "Add Exam" })).toBeVisible();

    await page.getByText("Dashboard").click();

    await expect(page.getByText("Welcome back!")).toBeVisible();
  },
);
