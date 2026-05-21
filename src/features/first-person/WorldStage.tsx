"use client";

import { Html, useGLTF } from "@react-three/drei";
import {
  CoefficientCombineRule,
  CuboidCollider,
  RigidBody,
  RoundCuboidCollider,
} from "@react-three/rapier";
import { Suspense, useMemo } from "react";
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { isColliderNodeName } from "@/features/worlds/collider-names";
import {
  getWorldColliderMode,
  type WorldColliderMode,
  type WorldManifest,
} from "@/features/worlds/world-manifest";

const fixedColliderProps = {
  friction: 0,
  frictionCombineRule: CoefficientCombineRule.Min,
  restitution: 0,
  restitutionCombineRule: CoefficientCombineRule.Min,
} as const;

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
      <RigidBody type="fixed" colliders={false}>
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[24, 0.1, 24]} />
          <meshStandardMaterial color="#527063" roughness={0.82} />
        </mesh>
        <CuboidCollider args={[12, 0.05, 12]} position={[0, -0.05, 0]} {...fixedColliderProps} />
      </RigidBody>

      <FixedBox position={[0, 1.5, -12]} size={[24, 3, 0.25]} color="#4e5963" />
      <FixedBox position={[0, 1.5, 12]} size={[24, 3, 0.25]} color="#5d534c" />
      <FixedBox position={[-12, 1.5, 0]} size={[0.25, 3, 24]} color="#4d6170" />
      <FixedBox position={[12, 1.5, 0]} size={[0.25, 3, 24]} color="#5f5844" />

      <FixedBox
        position={[-4, 0.35, -2]}
        size={[3, 0.7, 3]}
        color="#a98a5f"
        rounded
      />

      <FixedBox
        position={[3.4, 0.6, -3.5]}
        rotation={[0, 0.72, 0]}
        size={[4.2, 1.2, 0.7]}
        color="#6d877c"
        rounded
      />

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24, 24, 24]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

function FixedBox({
  position,
  rotation = [0, 0, 0],
  size,
  color,
  rounded = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  color: string;
  rounded?: boolean;
}) {
  const halfSize: [number, number, number] = [
    size[0] / 2,
    size[1] / 2,
    size[2] / 2,
  ];
  const radius = Math.min(0.12, size[0] / 5, size[1] / 5, size[2] / 5);
  const roundedHalfSize: [number, number, number, number] = [
    Math.max(0.01, halfSize[0] - radius),
    Math.max(0.01, halfSize[1] - radius),
    Math.max(0.01, halfSize[2] - radius),
    radius,
  ];

  return (
    <RigidBody type="fixed" colliders={false} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {rounded ? (
        <RoundCuboidCollider args={roundedHalfSize} {...fixedColliderProps} />
      ) : (
        <CuboidCollider args={halfSize} {...fixedColliderProps} />
      )}
    </RigidBody>
  );
}

function GltfWorld({ glbPath, world }: { glbPath: string; world: WorldManifest }) {
  const gltf = useGLTF(glbPath);
  const colliderPrefix = world.colliderPrefix;
  const colliderMode = getWorldColliderMode(world);
  const worldScale = world.scale ?? 1;
  const { visibleScene, colliderScene } = useMemo(
    () => splitGltfScene(gltf.scene, colliderPrefix, colliderMode, worldScale),
    [gltf.scene, colliderPrefix, colliderMode, worldScale],
  );

  return (
    <>
      <primitive object={visibleScene} />
      <RigidBody type="fixed" colliders="trimesh" {...fixedColliderProps}>
        <primitive object={colliderScene} />
      </RigidBody>
    </>
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

function splitGltfScene(
  scene: Group,
  colliderPrefix = "COLLIDER_",
  colliderMode: WorldColliderMode = "prefixed",
  worldScale = 1,
) {
  const visibleScene = scene.clone(true);
  visibleScene.scale.setScalar(worldScale);
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
  if (colliderMode === "visible-mesh") {
    pruneVisibleMeshColliderScene(colliderScene, colliderPrefix);
  } else {
    prunePrefixedColliderScene(colliderScene, colliderPrefix);
  }
  const bakedColliderScene = bakeColliderMeshScene(colliderScene, worldScale);
  makeColliderSceneInvisible(bakedColliderScene);

  return { visibleScene, colliderScene: bakedColliderScene };
}

function prunePrefixedColliderScene(root: Object3D, colliderPrefix: string) {
  for (const child of [...root.children]) {
    prunePrefixedColliderScene(child, colliderPrefix);
    const isColliderMesh = child instanceof Mesh && isColliderNodeName(child.name, colliderPrefix);
    const isEmptyGroup = !(child instanceof Mesh) && child.children.length === 0;

    if ((!isColliderMesh && child instanceof Mesh) || isEmptyGroup) {
      root.remove(child);
    }
  }
}

function pruneVisibleMeshColliderScene(root: Object3D, colliderPrefix: string) {
  for (const child of [...root.children]) {
    pruneVisibleMeshColliderScene(child, colliderPrefix);
    const isColliderHelper = child instanceof Mesh && isColliderNodeName(child.name, colliderPrefix);
    const isEmptyGroup = !(child instanceof Mesh) && child.children.length === 0;

    if (isColliderHelper || isEmptyGroup) {
      root.remove(child);
    }
  }
}

function makeColliderSceneInvisible(root: Object3D) {
  root.traverse((node) => {
    if (node instanceof Mesh) {
      node.visible = true;
      node.castShadow = false;
      node.receiveShadow = false;
      node.material = new MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
    }
  });
}

function bakeColliderMeshScene(root: Object3D, worldScale: number) {
  root.scale.setScalar(worldScale);
  root.updateMatrixWorld(true);

  const bakedScene = new Group();
  root.traverse((node) => {
    if (node instanceof Mesh) {
      const geometry = node.geometry.clone();
      geometry.applyMatrix4(node.matrixWorld);
      const bakedMesh = new Mesh(geometry, node.material);
      bakedMesh.name = node.name;
      bakedScene.add(bakedMesh);
    }
  });

  return bakedScene;
}
