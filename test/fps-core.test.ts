import { PerspectiveCamera, Vector3 } from "three";
import { afterEach, describe, expect, it } from "vitest";
import {
  createFPSCore,
  createGroundOnlyCollision,
  type FPSCore,
  type FPSPlugin,
} from "@/fps-core";

const activeCores: FPSCore[] = [];

describe("fps-core", () => {
  afterEach(() => {
    for (const core of activeCores.splice(0)) {
      core.dispose();
    }
    document.body.replaceChildren();
  });

  it("moves with keyboard input and keeps public state read-only by copy", () => {
    const { core, camera } = createTestCore();

    core.update(1 / 60);
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    core.update(0.25);

    const state = core.getState();
    expect(state.player.position.z).toBeLessThan(0);
    expect(state.player.grounded).toBe(true);
    expect(state.player.moving).toBe(true);
    expect(camera.position.y).toBeCloseTo(1.7);

    state.player.position.set(100, 100, 100);
    expect(core.getState().player.position.x).not.toBe(100);
    expect(core.context.player.getPosition().x).not.toBe(100);
  });

  it("tracks input transitions per update frame", () => {
    const { core } = createTestCore();

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA" }));
    core.update(1 / 60);

    expect(core.context.input.isPressed("KeyA")).toBe(true);
    expect(core.context.input.wasPressed("KeyA")).toBe(true);

    core.update(1 / 60);
    expect(core.context.input.wasPressed("KeyA")).toBe(false);

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyA" }));
    core.update(1 / 60);

    expect(core.context.input.isPressed("KeyA")).toBe(false);
    expect(core.context.input.wasReleased("KeyA")).toBe(true);
  });

  it("emits jump, fall, land, collision, and movement events", () => {
    const { core } = createTestCore();
    const events: string[] = [];

    core.update(1 / 60);
    core.context.events.on("player:jump", () => events.push("jump"));
    core.context.events.on("player:fall:start", () => events.push("fall:start"));
    core.context.events.on("player:fall:end", () => events.push("fall:end"));
    core.context.events.on("player:land", () => events.push("land"));
    core.context.events.on("collision:hit", () => events.push("hit"));
    core.context.events.on("player:move:start", () => events.push("move:start"));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    core.update(0.1);
    window.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
    core.update(0.2);
    core.update(0.2);
    core.update(0.4);

    expect(events).toContain("move:start");
    expect(events).toContain("jump");
    expect(events).toContain("fall:start");
    expect(events).toContain("fall:end");
    expect(events).toContain("land");
    expect(events).toContain("hit");
    expect(core.getState().player.grounded).toBe(true);
  });

  it("installs, updates, removes, and disposes plugins once per id", () => {
    const { core } = createTestCore();
    const pluginEvents: string[] = [];
    const plugin: FPSPlugin = {
      id: "probe",
      install(context) {
        pluginEvents.push(context.player.isGrounded() ? "install:ground" : "install");
      },
      update(_delta, context) {
        pluginEvents.push(context.input.isPointerLocked() ? "update:locked" : "update");
      },
      enable() {
        pluginEvents.push("enable");
      },
      disable() {
        pluginEvents.push("disable");
      },
      dispose() {
        pluginEvents.push("dispose");
      },
    };

    core.use(plugin);
    core.use(plugin);
    core.update(1 / 60);
    core.remove("probe");
    core.update(1 / 60);

    expect(pluginEvents).toEqual([
      "install",
      "enable",
      "update",
      "disable",
      "dispose",
    ]);
  });

  it("teleports, resets, and stops updates after dispose", () => {
    const { core } = createTestCore();

    core.context.player.teleport(new Vector3(2, 3, 4));
    expect(core.getState().player.position).toEqual(new Vector3(2, 3, 4));

    core.reset(new Vector3(1, 0, 1));
    expect(core.getState().player.position).toEqual(new Vector3(1, 0, 1));
    expect(core.getState().time.elapsed).toBe(0);

    core.dispose();
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    core.update(1);

    expect(core.getState().player.position).toEqual(new Vector3(1, 0, 1));
  });
});

function createTestCore() {
  const domElement = document.createElement("div");
  const camera = new PerspectiveCamera();
  const core = createFPSCore({
    camera,
    domElement,
    collision: createGroundOnlyCollision({ groundY: 0 }),
    options: {
      movement: {
        walkSpeed: 5,
        sprintSpeed: 8,
        jumpSpeed: 6,
        gravity: 20,
      },
      look: {
        sensitivity: 0.002,
        minPitch: -Math.PI / 2,
        maxPitch: Math.PI / 2,
      },
      player: {
        height: 1.7,
        radius: 0.35,
      },
    },
  });

  document.body.appendChild(domElement);
  activeCores.push(core);

  return { core, camera, domElement };
}
