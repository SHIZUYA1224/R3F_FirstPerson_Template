"use client";

import { Html, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Suspense, useMemo } from "react";
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { isColliderNodeName } from "@/features/worlds/collider-names";
import type { WorldManifest } from "@/features/worlds/world-manifest";

export function WorldStage({ world }: { world: WorldManifest }) {
  return (
    <>
      <color attach="background" args={["#8fb6c6"]} />
      <fog attach="fog" args={["#8fb6c6", 22, 70]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        intensity={2.2}
        position={[8, 12, 6]}
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight args={["#d8f3ff", "#645443", 1.2]} />
      {world.glbPath ? (
        <Suspense fallback={<WorldLoading />}>
          <GltfWorld glbPath={world.glbPath} world={world} />
        </Suspense>
      ) : (
        <StarterRoom />
      )}
    </>
  );
}

function StarterRoom() {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[24, 0.1, 24]} />
          <meshStandardMaterial color="#527063" roughness={0.82} />
        </mesh>
      </RigidBody>

      <Wall position={[0, 1.5, -12]} size={[24, 3, 0.25]} color="#4e5963" />
      <Wall position={[0, 1.5, 12]} size={[24, 3, 0.25]} color="#5d534c" />
      <Wall position={[-12, 1.5, 0]} size={[0.25, 3, 24]} color="#4d6170" />
      <Wall position={[12, 1.5, 0]} size={[0.25, 3, 24]} color="#5f5844" />

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[-4, 0.35, -2]}>
          <boxGeometry args={[3, 0.7, 3]} />
          <meshStandardMaterial color="#a98a5f" roughness={0.72} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" rotation={[0, 0.72, 0]}>
        <mesh castShadow receiveShadow position={[3.4, 0.6, -3.5]}>
          <boxGeometry args={[4.2, 1.2, 0.7]} />
          <meshStandardMaterial color="#6d877c" roughness={0.7} />
        </mesh>
      </RigidBody>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24, 24, 24]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

function Wall({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh castShadow receiveShadow position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}

function GltfWorld({ glbPath, world }: { glbPath: string; world: WorldManifest }) {
  const gltf = useGLTF(glbPath);
  const colliderPrefix = world.colliderPrefix;
  const { visibleScene, colliderScene } = useMemo(
    () => splitGltfScene(gltf.scene, colliderPrefix),
    [gltf.scene, colliderPrefix],
  );

  return (
    <group scale={world.scale ?? 1}>
      <primitive object={visibleScene} />
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={colliderScene} />
      </RigidBody>
    </group>
  );
}

function WorldLoading() {
  return (
    <Html center>
      <div className="rounded border border-white/20 bg-black/50 px-3 py-2 text-xs text-white shadow-xl backdrop-blur">
        Loading world
      </div>
    </Html>
  );
}

function splitGltfScene(scene: Group, colliderPrefix = "COLLIDER_") {
  const visibleScene = scene.clone(true);
  visibleScene.traverse((node) => {
    if (node instanceof Mesh && isColliderNodeName(node.name, colliderPrefix)) {
      node.visible = false;
    }
    if (node instanceof Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const colliderScene = scene.clone(true);
  pruneColliderScene(colliderScene, colliderPrefix);
  colliderScene.traverse((node) => {
    if (node instanceof Mesh) {
      node.material = new MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
    }
  });

  return { visibleScene, colliderScene };
}

function pruneColliderScene(root: Object3D, colliderPrefix: string) {
  for (const child of [...root.children]) {
    pruneColliderScene(child, colliderPrefix);
    const isColliderMesh = child instanceof Mesh && isColliderNodeName(child.name, colliderPrefix);
    const isEmptyGroup = !(child instanceof Mesh) && child.children.length === 0;

    if ((!isColliderMesh && child instanceof Mesh) || isEmptyGroup) {
      root.remove(child);
    }
  }
}
