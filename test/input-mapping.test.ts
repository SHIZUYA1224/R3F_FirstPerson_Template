import { describe, expect, it } from "vitest";
import {
  applyDeadzone,
  applyResponseCurve,
  mapGamepadState,
  mapKeyboardState,
  mapTouchState,
  mergeInputActions,
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

  it("remaps analog deadzones and response curves for finer aiming", () => {
    expect(applyDeadzone(0.08)).toBe(0);
    expect(applyDeadzone(-0.58)).toBeCloseTo(-0.5);
    expect(applyResponseCurve(-0.5, 1.45)).toBeCloseTo(-0.366, 3);
  });

  it("maps gamepad axes, buttons, and deadzone", () => {
    const actions = mapGamepadState({
      axes: [0.58, -1, 0.04, -0.58],
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
    expect(actions.look[0]).toBe(0);
    expect(actions.look[1]).toBeCloseTo(-0.366, 3);
    expect(actions.jump).toBe(true);
    expect(actions.sprint).toBe(true);
  });

  it("keeps movement while look input is active", () => {
    const keyboard = mapKeyboardState(new Set(["KeyW"]));
    const lookOnly = mapTouchState({ look: [1, 0] });
    const actions = mergeInputActions(keyboard, lookOnly);

    expect(actions.move).toEqual([0, 1]);
    expect(actions.look).toEqual([1, 0]);
    expect(actions.source).toBe("touch");
  });
});
