import { expect, type Page } from "@playwright/test";
import { login, testWithExistingUser } from "../fixtures/user";

type CreatedRoom = {
  name: string;
  subject: string;
};

async function createRoom(page: Page): Promise<CreatedRoom> {
  const unique = Date.now();
  const room = {
    name: `E2E Study Room ${unique}`,
    subject: `E2E Subject ${unique}`,
  };

  await page.goto("/rooms");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Create Room" }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Room Name *").fill(room.name);
  await dialog.getByLabel("Subject *").fill(room.subject);
  await dialog.getByRole("button", { name: "Create Room" }).click();

  await expect(page).toHaveURL(/\/rooms\/[^/]+$/);
  await expect(page.getByRole("heading", { name: room.name })).toBeVisible();
  return room;
}

async function deleteOpenRoom(page: Page) {
  const deleteButton = page.getByRole("button", { name: "Delete Room" });
  if (await deleteButton.isVisible()) {
    await deleteButton.click();
    await expect(page).toHaveURL(/\/rooms$/);
  }
}

testWithExistingUser(
  "create room and open owner room",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    const room = await createRoom(page);

    await expect(page.getByText(room.subject)).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete Room" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Join Room" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();

    await deleteOpenRoom(page);
  },
);

testWithExistingUser(
  "owner can send message and see it",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await createRoom(page);

    const message = `Hello from rooms E2E ${Date.now()}`;
    const input = page.getByTestId("room-chat-input");
    await expect(input).toBeEnabled({ timeout: 15_000 });
    await input.fill(message);
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(message)).toBeVisible({ timeout: 10_000 });
    await deleteOpenRoom(page);
  },
);

testWithExistingUser(
  "owner can change room status",
  async ({ page, user }) => {
    await login({ request: page.request, page, user });
    await createRoom(page);

    await page.getByRole("button", { name: "On break" }).click();
    await expect(
      page.locator("span.text-xs.text-slate-500", { hasText: "On break" }),
    ).toBeVisible();

    await deleteOpenRoom(page);
  },
);
