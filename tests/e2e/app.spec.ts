import { expect, test } from "@playwright/test";

test.describe("Application", () => {
  test("should load the main page", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Monster Tamer/i);
  });

  test("should display the application title", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /Monster Tamer RPG Builder/i,
    });
    await expect(heading).toBeVisible();
  });

  test("should display the game canvas", async ({ page }) => {
    await page.goto("/");

    // The canvas should be visible
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("should display editor and play mode buttons", async ({ page }) => {
    await page.goto("/");

    const editorButton = page.getByRole("button", { name: /Editor Mode/i });
    const playButton = page.getByRole("button", { name: /Play Mode/i });

    await expect(editorButton).toBeVisible();
    await expect(playButton).toBeVisible();
  });
});
