export interface FirstPersonPlayerConfig {
  movementMode: "grounded";
  walkSpeed: number;
  runSpeed: number;
  jumpVelocity: number;
  gravity: number;
  capsuleHalfHeight: number;
  capsuleRadius: number;
  cameraYOffset: number;
  mouseSensitivity: number;
  touchLookSensitivity: number;
  touchLookHoldScale: number;
  gamepadLookSensitivity: number;
  gamepadLookResponseCurve: number;
  maxLookDeltaPerFrame: number;
  minPitch: number;
  maxPitch: number;
  airControlMultiplier: number;
  airDrag: number;
  horizontalAcceleration: number;
  horizontalDeceleration: number;
  characterControllerOffset: number;
  autostepMaxHeight: number;
  autostepMinWidth: number;
  snapToGroundDistance: number;
  maxSlopeClimbAngle: number;
  minSlopeSlideAngle: number;
  playerColliderFriction: number;
  groundProbeDistance: number;
  minGroundNormalY: number;
  linearDamping: number;
}

export const defaultFirstPersonPlayerConfig: FirstPersonPlayerConfig = {
  movementMode: "grounded",
  walkSpeed: 4.2,
  runSpeed: 7,
  jumpVelocity: 6.4,
  gravity: -18,
  capsuleHalfHeight: 0.75,
  capsuleRadius: 0.35,
  cameraYOffset: 0.53,
  mouseSensitivity: 0.0022,
  touchLookSensitivity: 0.0034,
  touchLookHoldScale: 8,
  gamepadLookSensitivity: 0.045,
  gamepadLookResponseCurve: 1.45,
  maxLookDeltaPerFrame: 72,
  minPitch: -1.35,
  maxPitch: 1.35,
  airControlMultiplier: 0.22,
  airDrag: 0.15,
  horizontalAcceleration: 42,
  horizontalDeceleration: 56,
  characterControllerOffset: 0.04,
  autostepMaxHeight: 0.36,
  autostepMinWidth: 0.2,
  snapToGroundDistance: 0.32,
  maxSlopeClimbAngle: Math.PI / 4,
  minSlopeSlideAngle: Math.PI / 3,
  playerColliderFriction: 0,
  groundProbeDistance: 0.18,
  minGroundNormalY: 0.55,
  linearDamping: 0.8,
};

export function getGroundProbeLength(config: FirstPersonPlayerConfig) {
  return config.capsuleHalfHeight + config.capsuleRadius + config.groundProbeDistance;
}

export function isWalkableGroundNormal(
  normal: { y: number } | null | undefined,
  config: FirstPersonPlayerConfig,
) {
  return Boolean(normal && normal.y >= config.minGroundNormalY);
}
