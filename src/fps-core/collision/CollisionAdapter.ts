import type { Vector3 } from "three";

export type CollisionState = {
  position: Vector3;
  velocity: Vector3;
  radius: number;
  height: number;
  delta: number;
};

export type CollisionResult = {
  position: Vector3;
  velocity: Vector3;
  grounded: boolean;
  collided: boolean;
  normal?: Vector3;
};

export type CollisionAdapter = {
  resolve(state: CollisionState): CollisionResult;
};

export type CollisionAPI = CollisionAdapter;
