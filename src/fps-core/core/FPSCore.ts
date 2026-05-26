import type { Camera, Vector3 } from "three";
import type { LookOptions } from "@/fps-core/camera/CameraRig";
import type { CollisionAdapter } from "@/fps-core/collision/CollisionAdapter";
import type { FPSContext } from "@/fps-core/core/FPSContext";
import type { FPSPlugin } from "@/fps-core/core/FPSPlugin";
import type { InputSource } from "@/fps-core/input/InputSource";
import type { MovementOptions } from "@/fps-core/movement/MovementOptions";
import type { PlayerOptions } from "@/fps-core/player/PlayerState";

export type FPSCoreOptions = {
  movement?: Partial<MovementOptions>;
  look?: Partial<LookOptions>;
  player?: Partial<PlayerOptions>;
};

export type CreateFPSCoreConfig = {
  camera: Camera;
  domElement: HTMLElement;
  collision?: CollisionAdapter;
  input?: InputSource;
  options?: FPSCoreOptions;
  initialPosition?: Vector3;
  initialLook?: {
    yaw?: number;
    pitch?: number;
  };
};

export type FPSCoreState = {
  player: {
    position: Vector3;
    velocity: Vector3;
    grounded: boolean;
    moving: boolean;
    sprinting: boolean;
  };
  input: {
    pointerLocked: boolean;
  };
  time: {
    elapsed: number;
    delta: number;
  };
};

export type FPSCore = {
  context: FPSContext;
  update(delta: number): void;
  enable(): void;
  disable(): void;
  dispose(): void;
  use(plugin: FPSPlugin): void;
  remove(pluginId: string): void;
  reset(position?: Vector3): void;
  getState(): FPSCoreState;
};
