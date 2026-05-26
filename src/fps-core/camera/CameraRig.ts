import type { PlayerAPI } from "@/fps-core/player/PlayerAPI";

export type LookOptions = {
  sensitivity: number;
  minPitch: number;
  maxPitch: number;
};

export type CameraRig = {
  updateFromPlayer(player: PlayerAPI): void;
  getYaw(): number;
  getPitch(): number;
  setLook(yaw: number, pitch: number): void;
};

export const defaultLookOptions: LookOptions = {
  sensitivity: 0.002,
  minPitch: -Math.PI / 2,
  maxPitch: Math.PI / 2,
};

export function resolveLookOptions(
  options: Partial<LookOptions> | undefined,
): LookOptions {
  return {
    ...defaultLookOptions,
    ...options,
  };
}
