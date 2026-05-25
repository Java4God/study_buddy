import { expect } from "@playwright/test";
import { testWithExistingUser, login } from "../fixtures/user";

testWithExistingUser(
  "add exam and verify it exists on page",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await page.waitForLoadState("networkidle");

    await page.goto("/exams");
    await page.waitForLoadState("networkidle");
    // Click "Add Exam" button to open modal
    await expect(page.getByRole("button", { name: "Add Exam" })).toBeVisible();
    await page.getByRole("button", { name: "Add Exam" }).click();

    // Fill exam form
    const examSubject = `Math Final ${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

    await page.getByLabel("Subject").fill(examSubject);
    await page.getByLabel("Date").fill(formattedDate);
    await page.getByLabel("Time").fill("14:30");
    await page.getByLabel("Location").fill("Room 101");
    await page.getByLabel("Notes").fill("Bring calculator");

    // Save exam
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();

    // Wait for modal to close and verify exam appears on page
    await expect(page.getByText(examSubject)).toBeVisible();
    await expect(page.getByText("Room 101")).toBeVisible();
    await expect(page.getByText("Bring calculator")).toBeVisible();
  },
);

testWithExistingUser(
  "add, update, and delete exam test",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await page.waitForLoadState("networkidle");

    await page.goto("/exams");
    await page.waitForLoadState("networkidle");
    // Add exam
    await page.getByRole("button", { name: "Add Exam" }).click();

    const examSubject = `Physics Test ${Date.now()}`;
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 3);
    const formattedDate = examDate.toISOString().split("T")[0];

    await page.getByLabel("Subject").fill(examSubject);
    await page.getByLabel("Date").fill(formattedDate);
    await page.getByLabel("Time").fill("10:00");
    await page.getByLabel("Location").fill("Lab A");

    await page.getByRole("button", { name: "Save" }).click();

    // Verify exam was added
    await expect(page.getByText(examSubject)).toBeVisible();
    await expect(page.getByText("Lab A")).toBeVisible();

    // Edit exam - find and click edit button for the exam
    const editButton = page.getByTestId(`edit-btn-exam-${examSubject}`);
    await editButton.click();

    // Verify modal is open and contains the original data
    await expect(page.getByLabel("Subject")).toHaveValue(examSubject);

    // Update the exam
    const updatedSubject = `Physics Test Updated ${Date.now()}`;
    const updatedLocation = "Lab B";

    await page.getByLabel("Subject").fill(updatedSubject);
    await page.getByLabel("Location").fill(updatedLocation);

    await page.getByRole("button", { name: "Save" }).click();

    // Verify the update
    await expect(page.getByText(updatedSubject)).toBeVisible();
    await expect(page.getByText(updatedLocation)).toBeVisible();
    await expect(page.locator(`text=Lab A`)).not.toBeVisible();

    // Delete exam - find the delete button
    const deleteButton = page.getByTestId(`delete-btn-exam-${updatedSubject}`);

    await deleteButton.click();

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = await page.getByRole("button", {
      name: /delete|confirm/i,
    });

    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Verify exam is deleted
    await expect(page.getByText(updatedSubject)).not.toBeVisible();
  },
);

testWithExistingUser(
  "add multiple exams and filter them test",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await page.waitForLoadState("networkidle");
    await page.goto("/exams");
    await page.waitForLoadState("networkidle");
    // Add first exam (upcoming)
    await page.getByRole("button", { name: "Add Exam" }).click();

    const today = new Date().toISOString().split("T")[0];
    const exam1 = `History ${Date.now()}`;

    await page.getByLabel("Subject").fill(exam1);
    await page.getByLabel("Date").fill(today);
    await page.getByLabel("Time").fill("09:00");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(exam1)).toBeVisible();

    // Add second exam (upcoming, different date)
    await page.getByRole("button", { name: "Add Exam" }).click();

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];
    const exam2 = `Chemistry ${Date.now()}`;

    await page.getByLabel("Subject").fill(exam2);
    await page.getByLabel("Date").fill(nextWeekStr);
    await page.getByLabel("Time").fill("14:00");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(exam2)).toBeVisible();

    // Verify both exams are visible
    await expect(page.getByText(exam1)).toBeVisible();
    await expect(page.getByText(exam2)).toBeVisible();
  },
);

testWithExistingUser(
  "update all exam fields and delete test",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await page.waitForLoadState("networkidle");
    await page.goto("/exams");
    await page.waitForLoadState("networkidle");
    // Create initial exam
    await page.getByRole("button", { name: "Add Exam" }).click();

    const initialSubject = `Biology ${Date.now()}`;
    const initialDate = new Date();
    initialDate.setDate(initialDate.getDate() + 2);
    const initialFormattedDate = initialDate.toISOString().split("T")[0];

    await page.getByLabel("Subject").fill(initialSubject);
    await page.getByLabel("Date").fill(initialFormattedDate);
    await page.getByLabel("Time").fill("08:00");
    await page.getByLabel("Location").fill("Room 201");
    await page.getByLabel("Notes").fill("Original notes");

    await page.getByRole("button", { name: "Save" }).click();

    // Verify initial exam
    await expect(page.getByText(initialSubject)).toBeVisible();
    await expect(page.getByText("Room 201")).toBeVisible();
    await expect(page.getByText("Original notes")).toBeVisible();

    // Edit and update ALL fields
    const editButton = page.getByTestId(`edit-btn-exam-${initialSubject}`);

    await editButton.click();

    // Update all fields
    const updatedSubject = `Biology Updated ${Date.now()}`;
    const updatedDate = new Date();
    updatedDate.setDate(updatedDate.getDate() + 7);
    const updatedFormattedDate = updatedDate.toISOString().split("T")[0];

    await page.getByLabel("Subject").fill(updatedSubject);
    await page.getByLabel("Date").fill(updatedFormattedDate);
    await page.getByLabel("Time").fill("16:45");
    await page.getByLabel("Location").fill("Lab C");
    await page.getByLabel("Notes").fill("Updated notes with more details");

    await page.getByRole("button", { name: "Save" }).click();

    // Verify all fields were updated
    await expect(page.getByText(updatedSubject)).toBeVisible();
    await expect(page.getByText("Lab C")).toBeVisible();
    await expect(
      page.getByText("Updated notes with more details"),
    ).toBeVisible();

    // Verify old values are gone
    await expect(page.locator(`text=${initialSubject}`)).not.toBeVisible();
    await expect(page.locator("text=Room 201")).not.toBeVisible();
    await expect(page.locator("text=Original notes")).not.toBeVisible();

    // Delete the exam
    const deleteButton = page.getByTestId(`delete-btn-exam-${updatedSubject}`);
    await deleteButton.click();

    const confirmButton = page.getByRole("button", { name: /delete|confirm/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify exam is deleted
    await expect(page.locator(`text=Lab C`)).not.toBeVisible();
  },
);

testWithExistingUser(
  "create exam and verify it appears on dashboard",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await page.waitForLoadState("networkidle");
    // Navigate to exams page
    await page.goto("/exams");
    await page.waitForLoadState("networkidle");
    // Create an exam
    await page.getByRole("button", { name: "Add Exam" }).click();

    const examSubject = `Dashboard Test Exam ${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];

    await page.getByLabel("Subject").fill(examSubject);
    await page.getByLabel("Date").fill(formattedDate);
    await page.getByLabel("Time").fill("13:00");

    await page.getByRole("button", { name: "Save" }).click();

    // Verify exam was created on exams page
    await expect(page.getByText(examSubject)).toBeVisible();

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Verify the exam appears in the "Upcoming Exams" section on dashboard
    await expect(
      page.getByRole("heading", { name: "Upcoming Exams" }),
    ).toBeVisible();
    await expect(page.getByText(examSubject)).toBeVisible();
  },
);
