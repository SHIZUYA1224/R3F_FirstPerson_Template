export type MovementOptions = {
  walkSpeed: number;
  sprintSpeed: number;
  jumpSpeed: number;
  gravity: number;
  horizontalAcceleration: number;
  horizontalDeceleration: number;
  airControlMultiplier: number;
  airDrag: number;
};

export const defaultMovementOptions: MovementOptions = {
  walkSpeed: 5,
  sprintSpeed: 8,
  jumpSpeed: 6,
  gravity: 20,
  horizontalAcceleration: 42,
  horizontalDeceleration: 56,
  airControlMultiplier: 0.22,
  airDrag: 0.15,
};

export function resolveMovementOptions(
  options: Partial<MovementOptions> | undefined,
): MovementOptions {
  return {
    ...defaultMovementOptions,
    ...options,
  };
}
