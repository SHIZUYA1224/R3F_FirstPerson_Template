# R3F First Person Template

Next.js App Router, React Three Fiber, and Rapier starter for walking through a 3D world in first person. The default world is `public/worlds/SILIQ.glb`.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Add A Blender World

1. Export your Blender scene as GLB.
2. Put the file under `public/worlds`, for example `public/worlds/gallery.glb`.
3. Add an entry in `src/features/worlds/world-manifest.ts`.
4. Use only local paths that match `/worlds/*.glb`.

Example:

```ts
{
  id: "gallery",
  name: "Gallery",
  description: "My Blender gallery.",
  glbPath: "/worlds/gallery.glb",
  spawn: { position: [0, 1.12, 4], yaw: Math.PI },
  colliderPrefix: "COLLIDER_",
}
```

For a quick import where the visible GLB mesh should also be the trimesh collider,
use `colliderMode: "visible-mesh"`:

```ts
{
  id: "siliq",
  name: "SILIQ",
  description: "Imported GLB world.",
  glbPath: "/worlds/SILIQ.glb",
  spawn: { position: [0, 1.03, 4], yaw: 0 },
  colliderMode: "visible-mesh",
  scale: 0.2,
}
```

## Blender Collider Rule

Create low-poly collision meshes in Blender and prefix their object names with `COLLIDER_`.

- `COLLIDER_Floor`, `COLLIDER_Wall`, and `COLLIDER_Ramp` become physics colliders.
- Normal meshes stay visible and do not create physics colliders.
- Collider meshes are hidden at runtime.

This keeps visual detail separate from collision complexity and avoids loading arbitrary external assets.
`colliderMode: "visible-mesh"` is convenient for checking imported worlds quickly, but
`COLLIDER_` meshes are still recommended for large or dense production scenes.

## Controls

- Desktop: WASD or arrow keys, mouse pointer lock when available, drag-to-look fallback, Space, Shift.
- Touch: left virtual stick, wide right look area, jump button. Hold and drag
  the right side to keep turning.
- Gamepad: left stick, curved right-stick aiming, south button, shoulder or trigger.

View sensitivity lives in `src/features/first-person/player-config.ts`.
Use `mouseSensitivity`, `touchLookSensitivity`, `gamepadLookSensitivity`, and
`maxLookDeltaPerFrame` to tune how quickly the camera turns for each device.
`touchLookHoldScale` controls how fast mobile view turns while the right side is held.

Player movement uses Rapier's kinematic character controller. Tune
`characterControllerOffset`, `autostepMaxHeight`, `snapToGroundDistance`,
`horizontalAcceleration`, and `horizontalDeceleration` when a world needs
more or less sliding around collision meshes. Air movement preserves horizontal
momentum; `airControlMultiplier` controls mid-air steering strength and
`airDrag` controls slow airborne momentum loss.

## Template API

Use `FirstPersonWorld` with a world manifest:

```tsx
import { FirstPersonWorld } from "@/features/first-person";
import { defaultWorld } from "@/features/worlds/world-manifest";

export function Experience() {
  return <FirstPersonWorld world={defaultWorld} />;
}
```

The default page keeps the route as a Server Component and loads the 3D runtime through a small Client Component boundary.

## Scripts

```bash
npm run dev
npm test
npm run test:e2e
npm run build
npm run lint
```

`npm test` runs Vitest unit and UI tests. `npm run test:e2e` runs the Playwright smoke tests against the Next.js dev server.
