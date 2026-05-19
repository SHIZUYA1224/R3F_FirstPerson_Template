import { describe, expect, it } from "vitest";
import {
  defaultFirstPersonPlayerConfig,
  getGroundProbeLength,
  isWalkableGroundNormal,
} from "@/features/first-person/player-config";

describe("first person player defaults", () => {
  it("uses grounded walking defaults", () => {
    expect(defaultFirstPersonPlayerConfig.movementMode).toBe("grounded");
    expect(defaultFirstPersonPlayerConfig.gravity).toBeLessThan(0);
    expect(defaultFirstPersonPlayerConfig.jumpVelocity).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.runSpeed).toBeGreaterThan(
      defaultFirstPersonPlayerConfig.walkSpeed,
    );
    expect(defaultFirstPersonPlayerConfig.capsuleRadius).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.groundProbeDistance).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.minGroundNormalY).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.mouseSensitivity).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.touchLookSensitivity).toBeGreaterThan(
      defaultFirstPersonPlayerConfig.mouseSensitivity,
    );
    expect(defaultFirstPersonPlayerConfig.gamepadLookSensitivity).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.maxLookDeltaPerFrame).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.minPitch).toBeLessThan(0);
    expect(defaultFirstPersonPlayerConfig.maxPitch).toBeGreaterThan(0);
  });

  it("uses capsule size plus skin distance for ground checks", () => {
    expect(getGroundProbeLength(defaultFirstPersonPlayerConfig)).toBeCloseTo(
      defaultFirstPersonPlayerConfig.capsuleHalfHeight +
        defaultFirstPersonPlayerConfig.capsuleRadius +
        defaultFirstPersonPlayerConfig.groundProbeDistance,
    );
  });

  it("rejects steep or missing ground normals", () => {
    expect(isWalkableGroundNormal({ y: 1 }, defaultFirstPersonPlayerConfig)).toBe(true);
    expect(isWalkableGroundNormal({ y: 0.2 }, defaultFirstPersonPlayerConfig)).toBe(false);
    expect(isWalkableGroundNormal(null, defaultFirstPersonPlayerConfig)).toBe(false);
  });
});
