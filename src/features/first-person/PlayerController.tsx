"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { useInputStore } from "@/features/first-person/input-store";
import {
  defaultFirstPersonPlayerConfig,
  type FirstPersonPlayerConfig,
} from "@/features/first-person/player-config";
import type { WorldManifest } from "@/features/worlds/world-manifest";

const direction = new Vector3();
const rotatedDirection = new Vector3();

export function PlayerController({
  world,
  config = defaultFirstPersonPlayerConfig,
}: {
  world: WorldManifest;
  config?: FirstPersonPlayerConfig;
}) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const yaw = useRef(world.spawn.yaw ?? 0);
  const pitch = useRef(world.spawn.pitch ?? 0);
  const { camera } = useThree();

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const input = useInputStore.getState().consumeFrameInput();

    yaw.current -= input.look[0] * config.mouseSensitivity;
    pitch.current = MathUtils.clamp(
      pitch.current - input.look[1] * config.mouseSensitivity,
      -1.35,
      1.35,
    );

    const velocity = body.linvel();
    const grounded = Math.abs(velocity.y) <= config.groundedVelocityEpsilon;
    const speed = input.sprint ? config.runSpeed : config.walkSpeed;
    const control = grounded ? 1 : config.airControlMultiplier;

    direction.set(input.move[0], 0, -input.move[1]);
    if (direction.lengthSq() > 1) {
      direction.normalize();
    }
    rotatedDirection
      .copy(direction)
      .applyAxisAngle(new Vector3(0, 1, 0), yaw.current)
      .multiplyScalar(speed * control);

    const nextY = input.jump && grounded ? config.jumpVelocity : velocity.y;
    body.setLinvel(
      {
        x: rotatedDirection.x,
        y: nextY,
        z: rotatedDirection.z,
      },
      true,
    );

    const translation = body.translation();
    camera.position.set(
      translation.x,
      translation.y + config.cameraYOffset,
      translation.z,
    );
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={config.linearDamping}
      position={[...world.spawn.position]}
      type="dynamic"
    >
      <CapsuleCollider args={[config.capsuleHalfHeight, config.capsuleRadius]} />
    </RigidBody>
  );
}
