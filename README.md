# R3F First Person Template

Next.js App Router, React Three Fiber, and Rapier starter for walking through a 3D world in first person.

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

## Blender Collider Rule

Create low-poly collision meshes in Blender and prefix their object names with `COLLIDER_`.

- `COLLIDER_Floor`, `COLLIDER_Wall`, and `COLLIDER_Ramp` become physics colliders.
- Normal meshes stay visible and do not create physics colliders.
- Collider meshes are hidden at runtime.

This keeps visual detail separate from collision complexity and avoids loading arbitrary external assets.

## Controls

- Desktop: WASD or arrow keys, mouse pointer lock, Space, Shift.
- Touch: left virtual stick, right look area, jump button.
- Gamepad: left stick, right stick, south button, shoulder or trigger.

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
