import { describe, expect, it } from "vitest";
import { defaultFirstPersonPlayerConfig } from "@/features/first-person/player-config";

describe("first person player defaults", () => {
  it("uses grounded walking defaults", () => {
    expect(defaultFirstPersonPlayerConfig.movementMode).toBe("grounded");
    expect(defaultFirstPersonPlayerConfig.gravity).toBeLessThan(0);
    expect(defaultFirstPersonPlayerConfig.jumpVelocity).toBeGreaterThan(0);
    expect(defaultFirstPersonPlayerConfig.runSpeed).toBeGreaterThan(
      defaultFirstPersonPlayerConfig.walkSpeed,
    );
    expect(defaultFirstPersonPlayerConfig.capsuleRadius).toBeGreaterThan(0);
  });
});
