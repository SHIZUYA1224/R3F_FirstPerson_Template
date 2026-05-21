import { expect, test, type Page } from "@playwright/test";
import { PNG } from "pngjs";

type PlayerDebug = {
  grounded: boolean;
  pitch: number;
  position: { x: number; y: number; z: number };
  worldId: string;
  yaw: number;
};

declare global {
  interface Window {
    __R3F_FIRST_PERSON_DEBUG__?: PlayerDebug;
  }
}

test("loads the first person template shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("first-person-world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByTestId("control-hud")).toContainText("SILIQ");
  await expectScenePixels(page);
});

test("spawns on a stable mesh surface", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("first-person-world")).toBeVisible();
  const startY = await waitForPlayerY(page);

  await page.waitForTimeout(1_800);
  const settled = await getPlayerDebug(page);

  expect(settled.worldId).toBe("siliq");
  expect(settled.grounded).toBe(true);
  expect(settled.position.y).toBeGreaterThan(1.7);
  expect(Math.abs(settled.position.x - 6)).toBeLessThan(0.35);
  expect(Math.abs(settled.position.z - 4)).toBeLessThan(0.35);
  expect(Math.abs(settled.position.y - startY)).toBeLessThan(0.25);
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

test("keeps moving through the default mesh-collider world", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("first-person-world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await waitForPlayerY(page);
  await page.getByTestId("first-person-world").click({ position: { x: 200, y: 200 } });
  const start = await getPlayerDebug(page);

  await page.keyboard.down("w");
  await page.keyboard.down("a");
  await page.waitForTimeout(1_200);
  const moved = await getPlayerDebug(page);
  await page.keyboard.up("w");
  await page.keyboard.up("a");

  expect(getHorizontalDistance(start.position, moved.position)).toBeGreaterThan(1);
});

test("keeps turning while the mobile look area is held", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByTestId("first-person-world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await waitForPlayerY(page);

  const look = page.getByTestId("mobile-look-zone");
  const lookBox = await look.boundingBox();
  expect(lookBox).not.toBeNull();

  const before = await getPlayerDebug(page);
  const startX = lookBox!.x + lookBox!.width * 0.45;
  const startY = lookBox!.y + lookBox!.height * 0.52;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 95, startY, { steps: 8 });
  await page.waitForTimeout(1_400);
  const heldTurn = await getPlayerDebug(page);
  await page.mouse.up();

  expect(getYawDelta(before.yaw, heldTurn.yaw)).toBeGreaterThan(0.2);
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

function getHorizontalDistance(
  a: { x: number; z: number },
  b: { x: number; z: number },
) {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

function getYawDelta(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)));
}

async function waitForPlayerY(page: Page) {
  await page.waitForFunction(
    () => {
      const debug = window.__R3F_FIRST_PERSON_DEBUG__;
      return Boolean(debug && debug.worldId === "siliq" && debug.grounded);
    },
    undefined,
    { timeout: 8_000 },
  );

  return (await getPlayerDebug(page)).position.y;
}

async function getPlayerDebug(page: Page) {
  const debug = await page.evaluate(() => window.__R3F_FIRST_PERSON_DEBUG__);

  expect(debug).toBeDefined();
  return debug!;
}
