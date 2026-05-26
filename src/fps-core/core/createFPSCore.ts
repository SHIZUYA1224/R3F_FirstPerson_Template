import { Vector3 } from "three";
import { resolveLookOptions } from "@/fps-core/camera/CameraRig";
import { FirstPersonCameraRig } from "@/fps-core/camera/FirstPersonCameraRig";
import type {
  CollisionAdapter,
  CollisionResult,
} from "@/fps-core/collision/CollisionAdapter";
import { createNoCollision } from "@/fps-core/collision/NoCollisionAdapter";
import type {
  CreateFPSCoreConfig,
  FPSCore,
  FPSCoreState,
} from "@/fps-core/core/FPSCore";
import type { FPSPlugin } from "@/fps-core/core/FPSPlugin";
import { createEventBus } from "@/fps-core/events/EventBus";
import { KeyboardMouseInputSource } from "@/fps-core/input/KeyboardMouseInputSource";
import { UpdatePipeline } from "@/fps-core/lifecycle/UpdatePipeline";
import { MovementMotor } from "@/fps-core/movement/MovementMotor";
import { resolveMovementOptions } from "@/fps-core/movement/MovementOptions";
import { PlayerController } from "@/fps-core/player/PlayerController";
import { defaultPlayerOptions } from "@/fps-core/player/PlayerState";
import { TimeState } from "@/fps-core/time/TimeState";

export function createFPSCore(config: CreateFPSCoreConfig): FPSCore {
  const events = createEventBus();
  const movementOptions = resolveMovementOptions(config.options?.movement);
  const lookOptions = resolveLookOptions(config.options?.look);
  const playerOptions = {
    ...defaultPlayerOptions,
    ...config.options?.player,
  };
  const collision: CollisionAdapter = config.collision ?? createNoCollision();
  const input =
    config.input ?? new KeyboardMouseInputSource(config.domElement, events);
  const time = new TimeState();
  const cameraRig = new FirstPersonCameraRig(config.camera, {
    ...lookOptions,
    height: playerOptions.height,
  });
  const player = new PlayerController({
    initialPosition: config.initialPosition ?? new Vector3(),
    getYaw: () => cameraRig.getYaw(),
    events,
  });
  const movement = new MovementMotor(player, movementOptions, events);
  const plugins = new Map<string, FPSPlugin>();
  const pipeline = new UpdatePipeline();

  let enabled = false;
  let disposed = false;
  let falling = false;

  if (config.initialLook) {
    cameraRig.setLook(
      config.initialLook.yaw ?? 0,
      config.initialLook.pitch ?? 0,
    );
  }

  const context = {
    camera: config.camera,
    domElement: config.domElement,
    player: player.api,
    input,
    events,
    time,
    collision,
  };

  pipeline.add(() => {
    input.update();
  });
  pipeline.add((delta) => {
    movement.update(delta, input, cameraRig.getYaw());
  });
  pipeline.add((delta) => {
    resolveCollision(delta, collision, playerOptions.radius, playerOptions.height, {
      player,
      movement,
      events,
      getFalling: () => falling,
      setFalling: (nextFalling) => {
        falling = nextFalling;
      },
    });
  });
  pipeline.add(() => {
    cameraRig.updateLook(input);
    cameraRig.updateFromPlayer(player.api);
  });
  pipeline.add((delta) => {
    for (const plugin of [...plugins.values()]) {
      plugin.update?.(delta, context);
    }
  });
  pipeline.add((delta) => {
    time.update(delta);
  });

  const core: FPSCore = {
    context,

    update(delta: number) {
      if (!enabled || disposed || !Number.isFinite(delta) || delta <= 0) {
        return;
      }

      pipeline.update(delta);
    },

    enable() {
      if (enabled || disposed) {
        return;
      }

      enabled = true;
      input.enable();
      for (const plugin of plugins.values()) {
        plugin.enable?.();
      }
    },

    disable() {
      if (!enabled || disposed) {
        return;
      }

      enabled = false;
      input.disable();
      for (const plugin of plugins.values()) {
        plugin.disable?.();
      }
    },

    dispose() {
      if (disposed) {
        return;
      }

      for (const pluginId of [...plugins.keys()]) {
        core.remove(pluginId);
      }
      input.dispose();
      pipeline.clear();
      events.clear();
      enabled = false;
      disposed = true;
    },

    use(plugin: FPSPlugin) {
      if (disposed || plugins.has(plugin.id)) {
        return;
      }

      plugin.install(context);
      plugins.set(plugin.id, plugin);
      events.emit("plugin:install", { id: plugin.id });

      if (enabled) {
        plugin.enable?.();
      }
    },

    remove(pluginId: string) {
      const plugin = plugins.get(pluginId);
      if (!plugin) {
        return;
      }

      plugin.disable?.();
      plugin.dispose?.();
      plugins.delete(pluginId);
      events.emit("plugin:dispose", { id: pluginId });
    },

    reset(position?: Vector3) {
      player.reset(position);
      movement.reset();
      falling = false;
      time.reset();
      cameraRig.updateFromPlayer(player.api);
    },

    getState(): FPSCoreState {
      const state = player.getMutableState();

      return {
        player: {
          position: state.position.clone(),
          velocity: state.velocity.clone(),
          grounded: state.grounded,
          moving: state.moving,
          sprinting: state.sprinting,
        },
        input: {
          pointerLocked: input.isPointerLocked(),
        },
        time: {
          elapsed: time.getElapsed(),
          delta: time.getDelta(),
        },
      };
    },
  };

  core.enable();
  cameraRig.updateFromPlayer(player.api);

  return core;
}

function resolveCollision(
  delta: number,
  collision: CollisionAdapter,
  radius: number,
  height: number,
  runtime: {
    player: PlayerController;
    movement: MovementMotor;
    events: ReturnType<typeof createEventBus>;
    getFalling(): boolean;
    setFalling(falling: boolean): void;
  },
) {
  const state = runtime.player.getMutableState();
  const wasGrounded = state.grounded;
  const result = collision.resolve({
    position: state.position.clone(),
    velocity: state.velocity.clone(),
    radius,
    height,
    delta,
  });

  runtime.player.applyCollisionResult(result);
  runtime.movement.syncMovingState();
  emitCollisionEvents(result, wasGrounded, runtime);
}

function emitCollisionEvents(
  result: CollisionResult,
  wasGrounded: boolean,
  runtime: {
    player: PlayerController;
    events: ReturnType<typeof createEventBus>;
    getFalling(): boolean;
    setFalling(falling: boolean): void;
  },
) {
  const state = runtime.player.getMutableState();
  const nextFalling = !state.grounded && state.velocity.y < 0;

  if (result.collided) {
    runtime.events.emit("collision:hit", {
      position: state.position.clone(),
      normal: result.normal?.clone(),
    });
  }

  if (!wasGrounded && state.grounded) {
    runtime.events.emit("player:land", {
      position: state.position.clone(),
      velocity: state.velocity.clone(),
    });
  }

  if (!runtime.getFalling() && nextFalling) {
    runtime.events.emit("player:fall:start", {
      position: state.position.clone(),
      velocity: state.velocity.clone(),
    });
  }

  if (runtime.getFalling() && !nextFalling) {
    runtime.events.emit("player:fall:end", {
      position: state.position.clone(),
      velocity: state.velocity.clone(),
    });
  }

  runtime.setFalling(nextFalling);
}
