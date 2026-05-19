"use client";

import { FirstPersonWorld } from "@/features/first-person/FirstPersonWorld";
import type { WorldManifest } from "@/features/worlds/world-manifest";

export function WorldClient({ world }: { world: WorldManifest }) {
  return <FirstPersonWorld world={world} />;
}
