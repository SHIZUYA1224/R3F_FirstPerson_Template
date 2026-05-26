import { Vector3 } from "three";

export type PlayerOptions = {
  height: number;
  radius: number;
};

export type PlayerState = {
  position: Vector3;
  velocity: Vector3;
  grounded: boolean;
  moving: boolean;
  sprinting: boolean;
};

export const defaultPlayerOptions: PlayerOptions = {
  height: 1.7,
  radius: 0.35,
};

export function createPlayerState(position = new Vector3()): PlayerState {
  return {
    position: position.clone(),
    velocity: new Vector3(),
    grounded: false,
    moving: false,
    sprinting: false,
  };
}
