import { expect, test } from "@playwright/test";

test("loads the first person template shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("first-person-world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByTestId("control-hud")).toContainText("Starter Room");
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
});

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
