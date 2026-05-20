import { describe, expect, it } from "vitest";
import {
  applyLookDelta,
  clampLookDelta,
  getLookSensitivity,
} from "@/features/first-person/look-controls";
import { defaultFirstPersonPlayerConfig } from "@/features/first-person/player-config";

describe("look controls", () => {
  it("limits very large look deltas before applying sensitivity", () => {
    expect(clampLookDelta([100, 0], 40)).toEqual([40, 0]);
    const diagonal = clampLookDelta([60, 80], 50);

    expect(Math.hypot(diagonal[0], diagonal[1])).toBeCloseTo(50);
  });

  it("uses device-specific look sensitivity", () => {
    expect(getLookSensitivity("keyboard", defaultFirstPersonPlayerConfig)).toBe(
      defaultFirstPersonPlayerConfig.mouseSensitivity,
    );
    expect(getLookSensitivity("touch", defaultFirstPersonPlayerConfig)).toBe(
      defaultFirstPersonPlayerConfig.touchLookSensitivity,
    );
    expect(getLookSensitivity("gamepad", defaultFirstPersonPlayerConfig)).toBe(
      defaultFirstPersonPlayerConfig.gamepadLookSensitivity,
    );
  });

  it("updates yaw and clamps pitch to the configured range", () => {
    const next = applyLookDelta({
      yaw: 0,
      pitch: 0,
      look: [20, -1000],
      source: "keyboard",
      config: defaultFirstPersonPlayerConfig,
    });

    expect(next.yaw).toBeLessThan(0);
    expect(next.pitch).toBeLessThanOrEqual(defaultFirstPersonPlayerConfig.maxPitch);
    expect(next.pitch).toBeGreaterThan(0);
  });

  it("scales touch hold look before applying sensitivity", () => {
    const next = applyLookDelta({
      yaw: 0,
      pitch: 0,
      look: [1, 0],
      source: "touch",
      config: defaultFirstPersonPlayerConfig,
    });

    expect(next.yaw).toBeCloseTo(
      -defaultFirstPersonPlayerConfig.touchLookHoldScale *
        defaultFirstPersonPlayerConfig.touchLookSensitivity,
    );
  });
});
