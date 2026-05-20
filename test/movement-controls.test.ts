import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  moveVectorToward,
  slopeNormalYFromAngle,
} from "@/features/first-person/movement-controls";

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
});
