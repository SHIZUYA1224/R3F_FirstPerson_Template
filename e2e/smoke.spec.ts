import { expect, test, type Page } from "@playwright/test";
import { PNG } from "pngjs";

test("loads the first person template shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("first-person-world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByTestId("control-hud")).toContainText("Starter Room");
  await expectScenePixels(page);
});

test("keeps mobile controls separated on a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const joystick = page.getByTestId("mobile-joystick");
  const jump = page.getByTestId("mobile-jump");
  const look = page.getByTestId("mobile-look-zone");

  await expect(joystick).toBeVisible();
  await expect(jump).toBeVisible();
  await expect(look).toBeVisible();

  const joystickBox = await joystick.boundingBox();
  const jumpBox = await jump.boundingBox();

  expect(joystickBox).not.toBeNull();
  expect(jumpBox).not.toBeNull();
  expect(boxesOverlap(joystickBox!, jumpBox!)).toBe(false);
  await expectScenePixels(page);
});

async function expectScenePixels(page: Page) {
  let stats = await getScenePixelStats(page);

  for (let attempt = 0; attempt < 6 && !isScenePainted(stats); attempt += 1) {
    await page.waitForTimeout(150);
    stats = await getScenePixelStats(page);
  }

  expect(stats.colors).toBeGreaterThanOrEqual(5);
  expect(stats.nonBlackRatio).toBeGreaterThan(0.2);
}

async function getScenePixelStats(page: Page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );

  const image = PNG.sync.read(await page.screenshot());
  const colors = new Set<string>();
  let nonBlackPixels = 0;
  let samples = 0;

  for (let y = 0; y < image.height; y += 12) {
    for (let x = 0; x < image.width; x += 12) {
      const index = (image.width * y + x) * 4;
      const r = image.data[index];
      const g = image.data[index + 1];
      const b = image.data[index + 2];
      colors.add(`${r >> 4}-${g >> 4}-${b >> 4}`);
      if (r + g + b > 30) {
        nonBlackPixels += 1;
      }
      samples += 1;
    }
  }

  return {
    colors: colors.size,
    nonBlackRatio: nonBlackPixels / samples,
  };
}

function isScenePainted(stats: { colors: number; nonBlackRatio: number }) {
  return stats.colors >= 5 && stats.nonBlackRatio > 0.2;
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}
