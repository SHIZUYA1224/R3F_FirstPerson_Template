import { Vector3 } from "three";
import type { FirstPersonPlayerConfig } from "@/features/first-person/player-config";

export function moveVectorToward(
  current: Vector3,
  target: Vector3,
  maxDelta: number,
  output = new Vector3(),
) {
  output.copy(target).sub(current);
  const distance = output.length();

  if (distance === 0 || distance <= maxDelta) {
    return output.copy(target);
  }

  return output.multiplyScalar(maxDelta / distance).add(current);
}

export function resolveHorizontalVelocity({
  current,
  target,
  grounded,
  hasMoveInput,
  delta,
  config,
  output = new Vector3(),
}: {
  current: Vector3;
  target: Vector3;
  grounded: boolean;
  hasMoveInput: boolean;
  delta: number;
  config: Pick<
    FirstPersonPlayerConfig,
    | "horizontalAcceleration"
    | "horizontalDeceleration"
    | "airControlMultiplier"
    | "airDrag"
  >;
  output?: Vector3;
}) {
  if (grounded) {
    const acceleration = hasMoveInput
      ? config.horizontalAcceleration
      : config.horizontalDeceleration;

    return moveVectorToward(current, target, acceleration * delta, output);
  }

  if (!hasMoveInput) {
    return moveVectorToward(current, target, config.airDrag * delta, output);
  }

  return moveVectorToward(
    current,
    target,
    config.horizontalAcceleration * config.airControlMultiplier * delta,
    output,
  );
}

export function slopeNormalYFromAngle(angleRadians: number) {
  return Math.cos(angleRadians);
}
