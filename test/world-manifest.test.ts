import { describe, expect, it } from "vitest";
import {
  isSafeWorldGlbPath,
  validateWorldManifest,
  type WorldManifest,
} from "@/features/worlds/world-manifest";
import {
  classifyWorldNode,
  isColliderNodeName,
  splitWorldNodeNames,
} from "@/features/worlds/collider-names";

describe("world manifest security", () => {
  it("allows only local /worlds/*.glb assets", () => {
    expect(isSafeWorldGlbPath("/worlds/gallery.glb")).toBe(true);
    expect(isSafeWorldGlbPath("/worlds/floor-01/room.v1.glb")).toBe(true);
    expect(isSafeWorldGlbPath("https://example.com/world.glb")).toBe(false);
    expect(isSafeWorldGlbPath("/models/world.glb")).toBe(false);
    expect(isSafeWorldGlbPath("/worlds/../secret.glb")).toBe(false);
    expect(isSafeWorldGlbPath("/worlds/gallery.gltf")).toBe(false);
  });

  it("throws for unsafe manifest paths", () => {
    const unsafeWorld: WorldManifest = {
      id: "bad",
      name: "Bad",
      description: "Unsafe",
      glbPath: "https://example.com/bad.glb" as `/worlds/${string}.glb`,
      spawn: { position: [0, 1, 0] },
    };

    expect(() => validateWorldManifest(unsafeWorld)).toThrow(/Unsafe GLB path/);
  });
});

describe("Blender collider naming", () => {
  it("classifies COLLIDER_ prefixed meshes", () => {
    expect(isColliderNodeName("COLLIDER_floor")).toBe(true);
    expect(isColliderNodeName("collider_wall.001")).toBe(true);
    expect(classifyWorldNode("GalleryWall")).toBe("visible");
  });

  it("splits visible and collider nodes", () => {
    expect(splitWorldNodeNames(["Wall", "COLLIDER_Wall", "Light"])).toEqual({
      visible: ["Wall", "Light"],
      collider: ["COLLIDER_Wall"],
    });
  });
});
