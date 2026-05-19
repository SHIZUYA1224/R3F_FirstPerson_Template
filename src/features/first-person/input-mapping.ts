export type InputSource = "idle" | "keyboard" | "touch" | "gamepad";
export type MoveVector = readonly [number, number];
export type LookVector = readonly [number, number];

export interface InputActions {
  move: [number, number];
  look: [number, number];
  jump: boolean;
  sprint: boolean;
  source: InputSource;
}

export interface TouchState {
  move?: MoveVector;
  look?: LookVector;
  jump?: boolean;
  sprint?: boolean;
}

export interface GamepadLike {
  axes: readonly number[];
  buttons: readonly { pressed?: boolean; value?: number }[];
}

export const emptyInputActions: InputActions = {
  move: [0, 0],
  look: [0, 0],
  jump: false,
  sprint: false,
  source: "idle",
};

export function normalizeMove(move: MoveVector): [number, number] {
  const [x, y] = move;
  const length = Math.hypot(x, y);

  if (length <= 1) {
    return [x, y];
  }

  return [x / length, y / length];
}

export function applyDeadzone(value: number, deadzone = 0.16) {
  return Math.abs(value) < deadzone ? 0 : value;
}

export function mapKeyboardState(keys: ReadonlySet<string>): InputActions {
  const right = Number(keys.has("KeyD") || keys.has("ArrowRight"));
  const left = Number(keys.has("KeyA") || keys.has("ArrowLeft"));
  const forward = Number(keys.has("KeyW") || keys.has("ArrowUp"));
  const backward = Number(keys.has("KeyS") || keys.has("ArrowDown"));
  const move = normalizeMove([right - left, forward - backward]);

  return {
    move,
    look: [0, 0],
    jump: keys.has("Space"),
    sprint: keys.has("ShiftLeft") || keys.has("ShiftRight"),
    source: isActionsActive({ ...emptyInputActions, move, jump: keys.has("Space") })
      ? "keyboard"
      : "idle",
  };
}

export function mapTouchState(state: TouchState): InputActions {
  const move = normalizeMove(state.move ?? [0, 0]);
  const look: [number, number] = [state.look?.[0] ?? 0, state.look?.[1] ?? 0];

  return {
    move,
    look,
    jump: Boolean(state.jump),
    sprint: Boolean(state.sprint),
    source: isActionsActive({
      move,
      look,
      jump: Boolean(state.jump),
      sprint: Boolean(state.sprint),
    })
      ? "touch"
      : "idle",
  };
}

export function mapGamepadState(
  gamepad: GamepadLike | null | undefined,
  deadzone = 0.16,
): InputActions {
  if (!gamepad) {
    return emptyInputActions;
  }

  const move = normalizeMove([
    applyDeadzone(gamepad.axes[0] ?? 0, deadzone),
    -applyDeadzone(gamepad.axes[1] ?? 0, deadzone),
  ]);
  const look: [number, number] = [
    applyDeadzone(gamepad.axes[2] ?? 0, deadzone),
    applyDeadzone(gamepad.axes[3] ?? 0, deadzone),
  ];
  const jump = isPressed(gamepad.buttons[0]);
  const sprint =
    isPressed(gamepad.buttons[4]) ||
    isPressed(gamepad.buttons[5]) ||
    isPressed(gamepad.buttons[6]) ||
    isPressed(gamepad.buttons[7]);

  return {
    move,
    look,
    jump,
    sprint,
    source: isActionsActive({ move, look, jump, sprint }) ? "gamepad" : "idle",
  };
}

export function mergeInputActions(...actions: readonly InputActions[]): InputActions {
  const active = actions.filter(isActionsActive);
  const primary = active.at(-1) ?? emptyInputActions;

  return {
    move: primary.move,
    look: [
      actions.reduce((sum, action) => sum + action.look[0], 0),
      actions.reduce((sum, action) => sum + action.look[1], 0),
    ],
    jump: actions.some((action) => action.jump),
    sprint: actions.some((action) => action.sprint),
    source: primary.source,
  };
}

export function isActionsActive(action: Pick<InputActions, "move" | "look" | "jump" | "sprint">) {
  return (
    Math.abs(action.move[0]) > 0 ||
    Math.abs(action.move[1]) > 0 ||
    Math.abs(action.look[0]) > 0 ||
    Math.abs(action.look[1]) > 0 ||
    action.jump ||
    action.sprint
  );
}

function isPressed(button: { pressed?: boolean; value?: number } | undefined) {
  return Boolean(button?.pressed || (button?.value ?? 0) > 0.5);
}
