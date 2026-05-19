import { DEFAULT_COLLIDER_PREFIX } from "@/features/worlds/collider-names";

export type Vec3 = readonly [number, number, number];

export interface WorldManifest {
  id: string;
  name: string;
  description: string;
  glbPath?: `/worlds/${string}.glb` | null;
  spawn: {
    position: Vec3;
    yaw?: number;
    pitch?: number;
  };
  colliderPrefix?: string;
  scale?: number;
}

export const WORLD_GLB_PREFIX = "/worlds/";

export function isSafeWorldGlbPath(path: unknown): path is `/worlds/${string}.glb` {
  if (typeof path !== "string") {
    return false;
  }

  if (!path.startsWith(WORLD_GLB_PREFIX) || !path.toLowerCase().endsWith(".glb")) {
    return false;
  }

  if (path.includes("\\") || path.includes("//") || path.includes("://")) {
    return false;
  }

  const parts = path.split("/");
  if (
    parts.length < 3 ||
    parts[1] !== "worlds" ||
    parts.slice(2).some((part) => part === "" || part === "." || part === "..")
  ) {
    return false;
  }

  return /^\/worlds\/[A-Za-z0-9][A-Za-z0-9/._-]*\.glb$/i.test(path);
}

export function validateWorldManifest(world: WorldManifest) {
  if (world.glbPath == null) {
    return world;
  }

  if (!isSafeWorldGlbPath(world.glbPath)) {
    throw new Error(
      `Unsafe GLB path for world "${world.id}". Use local /worlds/*.glb assets only.`,
    );
  }

  return world;
}

export const worlds = [
  {
    id: "starter-room",
    name: "Starter Room",
    description: "Built-in primitive world for validating movement before adding GLB assets.",
    glbPath: null,
    spawn: {
      position: [0, 1.12, 5],
      yaw: Math.PI,
      pitch: 0,
    },
    colliderPrefix: DEFAULT_COLLIDER_PREFIX,
    scale: 1,
  },
] as const satisfies readonly WorldManifest[];

export const defaultWorld = worlds[0];
