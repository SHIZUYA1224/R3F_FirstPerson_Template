"use client";

import { useFrame, useThree } from "@react-three/fiber";
import {
  CapsuleCollider,
  CoefficientCombineRule,
  RigidBody,
  useRapier,
  type RapierContext,
  type RapierCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useInputStore } from "@/features/first-person/input-store";
import { applyLookDelta } from "@/features/first-person/look-controls";
import { resolveHorizontalVelocity } from "@/features/first-person/movement-controls";
import {
  defaultFirstPersonPlayerConfig,
  type FirstPersonPlayerConfig,
} from "@/features/first-person/player-config";
import type { WorldManifest } from "@/features/worlds/world-manifest";

const direction = new Vector3();
const targetHorizontalVelocity = new Vector3();
const currentHorizontalVelocity = new Vector3();
const rotatedDirection = new Vector3();
const upAxis = new Vector3(0, 1, 0);
type CharacterController = ReturnType<
  RapierContext["world"]["createCharacterController"]
>;

export function PlayerController({
  world,
  config = defaultFirstPersonPlayerConfig,
}: {
  world: WorldManifest;
  config?: FirstPersonPlayerConfig;
}) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const characterController = useRef<CharacterController | null>(null);
  const horizontalVelocity = useRef(new Vector3());
  const verticalVelocity = useRef(0);
  const grounded = useRef(false);
  const yaw = useRef(world.spawn.yaw ?? 0);
  const pitch = useRef(world.spawn.pitch ?? 0);
  const { camera } = useThree();
  const { world: physicsWorld } = useRapier();

  useEffect(() => {
    const controller = physicsWorld.createCharacterController(
      config.characterControllerOffset,
    );
    controller.setSlideEnabled(true);
    controller.enableAutostep(
      config.autostepMaxHeight,
      config.autostepMinWidth,
      false,
    );
    controller.enableSnapToGround(config.snapToGroundDistance);
    controller.setMaxSlopeClimbAngle(config.maxSlopeClimbAngle);
    controller.setMinSlopeSlideAngle(config.minSlopeSlideAngle);
    controller.setApplyImpulsesToDynamicBodies(false);
    characterController.current = controller;

    return () => {
      characterController.current = null;
      physicsWorld.removeCharacterController(controller);
    };
  }, [config, physicsWorld]);

  useFrame((_, frameDelta) => {
    const body = bodyRef.current;
    const collider = colliderRef.current;
    const controller = characterController.current;
    if (!body || !collider || !controller) {
      return;
    }

    const delta = Math.min(frameDelta, 1 / 30);
    const input = useInputStore.getState().consumeFrameInput();

    const nextLook = applyLookDelta({
      yaw: yaw.current,
      pitch: pitch.current,
      look: input.look,
      source: input.source,
      config,
    });
    yaw.current = nextLook.yaw;
    pitch.current = nextLook.pitch;

    const speed = input.sprint ? config.runSpeed : config.walkSpeed;

    direction.set(input.move[0], 0, -input.move[1]);
    const hasMoveInput = direction.lengthSq() > 0;
    if (direction.lengthSq() > 1) {
      direction.normalize();
    }
    rotatedDirection
      .copy(direction)
      .applyAxisAngle(upAxis, yaw.current)
      .multiplyScalar(speed);
    targetHorizontalVelocity.copy(rotatedDirection);

    resolveHorizontalVelocity({
      current: horizontalVelocity.current,
      target: targetHorizontalVelocity,
      grounded: grounded.current,
      hasMoveInput,
      delta,
      config,
      output: currentHorizontalVelocity,
    });
    horizontalVelocity.current.copy(currentHorizontalVelocity);

    if (input.jump && grounded.current) {
      verticalVelocity.current = config.jumpVelocity;
      grounded.current = false;
    } else {
      verticalVelocity.current += config.gravity * delta;
    }

    const desiredTranslation = {
      x: horizontalVelocity.current.x * delta,
      y: verticalVelocity.current * delta,
      z: horizontalVelocity.current.z * delta,
    };

    controller.computeColliderMovement(
      collider,
      desiredTranslation,
      undefined,
      undefined,
      (candidate) => candidate !== collider,
    );
    const movement = controller.computedMovement();
    const translation = body.translation();
    const nextTranslation = {
      x: translation.x + movement.x,
      y: translation.y + movement.y,
      z: translation.z + movement.z,
    };
    const nextGrounded = controller.computedGrounded();

    if (nextGrounded && verticalVelocity.current < 0) {
      verticalVelocity.current = 0;
    }
    grounded.current = nextGrounded;

    body.setNextKinematicTranslation(nextTranslation);
    camera.position.set(
      nextTranslation.x,
      nextTranslation.y + config.cameraYOffset,
      nextTranslation.z,
    );
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return (
    <RigidBody
      ref={bodyRef}
      canSleep={false}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={config.linearDamping}
      position={[...world.spawn.position]}
      type="kinematicPosition"
    >
      <CapsuleCollider
        ref={colliderRef}
        args={[config.capsuleHalfHeight, config.capsuleRadius]}
        friction={config.playerColliderFriction}
        frictionCombineRule={CoefficientCombineRule.Min}
        restitution={0}
        restitutionCombineRule={CoefficientCombineRule.Min}
      />
    </RigidBody>
  );
}
