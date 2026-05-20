import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  moveVectorToward,
  resolveHorizontalVelocity,
  slopeNormalYFromAngle,
} from "@/features/first-person/movement-controls";
import { defaultFirstPersonPlayerConfig } from "@/features/first-person/player-config";

describe("movement controls", () => {
  it("moves horizontal velocity toward the target without overshooting", () => {
    const next = moveVectorToward(new Vector3(0, 0, 0), new Vector3(10, 0, 0), 3);

    expect(next.x).toBeCloseTo(3);
    expect(next.y).toBe(0);
    expect(next.z).toBe(0);
  });

  it("snaps to the target when the remaining velocity is within the max delta", () => {
    const next = moveVectorToward(new Vector3(2, 0, 0), new Vector3(3, 0, 0), 2);

    expect(next.x).toBe(3);
  });

  it("converts slope angles into ground-normal thresholds", () => {
    expect(slopeNormalYFromAngle(Math.PI / 3)).toBeCloseTo(0.5);
  });

  it("preserves dash-jump momentum when there is no air input", () => {
    const next = resolveHorizontalVelocity({
      current: new Vector3(0, 0, -defaultFirstPersonPlayerConfig.runSpeed),
      target: new Vector3(0, 0, 0),
      grounded: false,
      hasMoveInput: false,
      delta: 1 / 60,
      config: defaultFirstPersonPlayerConfig,
    });

    expect(next.z).toBeLessThan(-defaultFirstPersonPlayerConfig.runSpeed + 0.01);
  });

  it("uses air control as steering instead of cutting airborne speed", () => {
    const next = resolveHorizontalVelocity({
      current: new Vector3(0, 0, -defaultFirstPersonPlayerConfig.runSpeed),
      target: new Vector3(defaultFirstPersonPlayerConfig.runSpeed, 0, 0),
      grounded: false,
      hasMoveInput: true,
      delta: 1 / 60,
      config: defaultFirstPersonPlayerConfig,
    });

    expect(Math.hypot(next.x, next.z)).toBeGreaterThan(
      defaultFirstPersonPlayerConfig.runSpeed * 0.98,
    );
    expect(next.x).toBeGreaterThan(0);
  });
});
