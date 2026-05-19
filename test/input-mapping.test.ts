import { describe, expect, it } from "vitest";
import {
  mapGamepadState,
  mapKeyboardState,
  mapTouchState,
} from "@/features/first-person/input-mapping";

describe("input mapping", () => {
  it("maps keyboard movement into normalized common actions", () => {
    const actions = mapKeyboardState(new Set(["KeyW", "KeyD", "Space", "ShiftLeft"]));

    expect(actions.source).toBe("keyboard");
    expect(actions.move[0]).toBeCloseTo(Math.SQRT1_2);
    expect(actions.move[1]).toBeCloseTo(Math.SQRT1_2);
    expect(actions.jump).toBe(true);
    expect(actions.sprint).toBe(true);
  });

  it("maps touch joystick state into common actions", () => {
    const actions = mapTouchState({ move: [2, 0], look: [4, -2], jump: true });

    expect(actions.source).toBe("touch");
    expect(actions.move).toEqual([1, 0]);
    expect(actions.look).toEqual([4, -2]);
    expect(actions.jump).toBe(true);
  });

  it("maps gamepad axes, buttons, and deadzone", () => {
    const actions = mapGamepadState({
      axes: [0.5, -1, 0.04, -0.8],
      buttons: [
        { pressed: true },
        { pressed: false },
        { pressed: false },
        { pressed: false },
        { pressed: false },
        { pressed: true },
      ],
    });

    expect(actions.source).toBe("gamepad");
    expect(actions.move[0]).toBeCloseTo(0.4472, 3);
    expect(actions.move[1]).toBeCloseTo(0.8944, 3);
    expect(actions.look).toEqual([0, -0.8]);
    expect(actions.jump).toBe(true);
    expect(actions.sprint).toBe(true);
  });
});
