"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useRef } from "react";
import { ControlHud } from "@/features/first-person/ControlHud";
import { MobileControls } from "@/features/first-person/MobileControls";
import { PlayerController } from "@/features/first-person/PlayerController";
import { defaultFirstPersonPlayerConfig } from "@/features/first-person/player-config";
import { useGamepadControls } from "@/features/first-person/useGamepadControls";
import { useKeyboardPointerControls } from "@/features/first-person/useKeyboardPointerControls";
import { WorldStage } from "@/features/first-person/WorldStage";
import {
  validateWorldManifest,
  type WorldManifest,
} from "@/features/worlds/world-manifest";

export function FirstPersonWorld({ world }: { world: WorldManifest }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { beginPointerLook, updatePointerLook, endPointerLook, isDragLooking } =
    useKeyboardPointerControls(containerRef);
  useGamepadControls();

  const validatedWorld = validateWorldManifest(world);

  return (
    <section
      ref={containerRef}
      data-testid="first-person-world"
      className={`relative h-dvh w-full overflow-hidden bg-[#07090d] ${
        isDragLooking ? "cursor-grabbing" : "cursor-crosshair"
      }`}
      onPointerDown={beginPointerLook}
      onPointerMove={updatePointerLook}
      onPointerCancel={endPointerLook}
      onPointerUp={endPointerLook}
      tabIndex={0}
    >
      <Canvas
        shadows
        camera={{
          fov: 74,
          near: 0.05,
          far: 450,
          position: [...validatedWorld.spawn.position],
        }}
        dpr={[1, 2]}
      >
        <Physics gravity={[0, defaultFirstPersonPlayerConfig.gravity, 0]}>
          <WorldStage world={validatedWorld} />
          <PlayerController world={validatedWorld} />
        </Physics>
      </Canvas>
      <ControlHud worldName={validatedWorld.name} />
      <MobileControls />
    </section>
  );
}
