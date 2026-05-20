import { Vector3 } from "three";

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

export function slopeNormalYFromAngle(angleRadians: number) {
  return Math.cos(angleRadians);
}
