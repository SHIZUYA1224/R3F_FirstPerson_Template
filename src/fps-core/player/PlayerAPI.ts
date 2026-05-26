import type { Vector3 } from "three";

export type PlayerAPI = {
  getPosition(): Vector3;
  setPosition(position: Vector3): void;
  getVelocity(): Vector3;
  getForward(): Vector3;
  getRight(): Vector3;
  isGrounded(): boolean;
  isMoving(): boolean;
  isSprinting(): boolean;
  teleport(position: Vector3): void;
};
