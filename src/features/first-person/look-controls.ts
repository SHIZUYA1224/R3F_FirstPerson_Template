import type { InputSource, LookVector } from "@/features/first-person/input-mapping";
import type { FirstPersonPlayerConfig } from "@/features/first-person/player-config";

export function clampLookDelta(
  look: LookVector,
  maxMagnitude: number,
): [number, number] {
  const [x, y] = look;
  const length = Math.hypot(x, y);

  if (length === 0 || length <= maxMagnitude) {
    return [x, y];
  }

  const scale = maxMagnitude / length;
  return [x * scale, y * scale];
}

export function getLookSensitivity(
  source: InputSource,
  config: Pick<
    FirstPersonPlayerConfig,
    "mouseSensitivity" | "touchLookSensitivity" | "gamepadLookSensitivity"
  >,
) {
  if (source === "touch") {
    return config.touchLookSensitivity;
  }

  if (source === "gamepad") {
    return config.gamepadLookSensitivity;
  }

  return config.mouseSensitivity;
}

export function applyLookDelta({
  yaw,
  pitch,
  look,
  source,
  config,
}: {
  yaw: number;
  pitch: number;
  look: LookVector;
  source: InputSource;
  config: Pick<
    FirstPersonPlayerConfig,
    | "mouseSensitivity"
    | "touchLookSensitivity"
    | "touchLookHoldScale"
    | "gamepadLookSensitivity"
    | "maxLookDeltaPerFrame"
    | "minPitch"
    | "maxPitch"
  >;
}) {
  const scaledLook: LookVector =
    source === "touch"
      ? [look[0] * config.touchLookHoldScale, look[1] * config.touchLookHoldScale]
      : look;
  const [lookX, lookY] = clampLookDelta(scaledLook, config.maxLookDeltaPerFrame);
  const sensitivity = getLookSensitivity(source, config);
  const nextPitch = pitch - lookY * sensitivity;

  return {
    yaw: yaw - lookX * sensitivity,
    pitch: Math.min(config.maxPitch, Math.max(config.minPitch, nextPitch)),
  };
}
