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
  gamepadLookScale: number;
  airControlMultiplier: number;
  groundedVelocityEpsilon: number;
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
  cameraYOffset: 0.6,
  mouseSensitivity: 0.0025,
  gamepadLookScale: 18,
  airControlMultiplier: 0.35,
  groundedVelocityEpsilon: 0.08,
  linearDamping: 0.8,
};
