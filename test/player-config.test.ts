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
    expect(defaultFirstPersonPlayerConfig.touchLookHoldScale).toBeGreaterThan(1);
    expect(defaultFirstPersonPlayerConfig.gamepadLookSensitivity).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.maxLookDeltaPerFrame).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.minPitch).toBeLessThan(0);
    expect(defaultFirstPersonPlayerConfig.maxPitch).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.airControlMultiplier).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.airControlMultiplier).toBeLessThan(1);
    expect(defaultFirstPersonPlayerConfig.airDrag).toBeGreaterThanOrEqual(0);
    expect(defaultFirstPersonPlayerConfig.horizontalAcceleration).toBeGreaterThan(
      defaultFirstPersonPlayerConfig.walkSpeed,
    );
    expect(defaultFirstPersonPlayerConfig.horizontalDeceleration).toBeGreaterThan(
      defaultFirstPersonPlayerConfig.horizontalAcceleration,
    );
    expect(defaultFirstPersonPlayerConfig.characterControllerOffset).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.autostepMaxHeight).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.snapToGroundDistance).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.playerColliderFriction).toBe(0);
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
