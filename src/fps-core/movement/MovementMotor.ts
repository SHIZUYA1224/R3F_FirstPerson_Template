import { Vector3 } from "three";
import type { EventBus } from "@/fps-core/events/EventBus";
import type { InputAPI } from "@/fps-core/input/InputAPI";
import type { MovementOptions } from "@/fps-core/movement/MovementOptions";
import type { PlayerController } from "@/fps-core/player/PlayerController";

const upAxis = new Vector3(0, 1, 0);

export class MovementMotor {
  private readonly currentHorizontalVelocity = new Vector3();
  private readonly targetHorizontalVelocity = new Vector3();
  private readonly nextHorizontalVelocity = new Vector3();
  private readonly localDirection = new Vector3();

  constructor(
    private readonly player: PlayerController,
    private readonly options: MovementOptions,
    private readonly events: EventBus,
  ) {}

  update(delta: number, input: InputAPI, yaw: number) {
    const state = this.player.getMutableState();
    const forward = Number(isForwardPressed(input)) - Number(isBackwardPressed(input));
    const right = Number(isRightPressed(input)) - Number(isLeftPressed(input));
    const sprinting = input.isPressed("ShiftLeft") || input.isPressed("ShiftRight");

    this.localDirection.set(right, 0, -forward);
    const hasMoveInput = this.localDirection.lengthSq() > 0;
    if (this.localDirection.lengthSq() > 1) {
      this.localDirection.normalize();
    }

    const speed =
      sprinting && hasMoveInput
        ? this.options.sprintSpeed
        : this.options.walkSpeed;

    this.targetHorizontalVelocity
      .copy(this.localDirection)
      .applyAxisAngle(upAxis, yaw)
      .multiplyScalar(speed);

    this.currentHorizontalVelocity.set(state.velocity.x, 0, state.velocity.z);
    resolveHorizontalVelocity({
      current: this.currentHorizontalVelocity,
      target: this.targetHorizontalVelocity,
      grounded: state.grounded,
      hasMoveInput,
      delta,
      options: this.options,
      output: this.nextHorizontalVelocity,
    });

    state.velocity.x = this.nextHorizontalVelocity.x;
    state.velocity.z = this.nextHorizontalVelocity.z;
    state.sprinting = sprinting && hasMoveInput;

    if (input.wasPressed("Space") && state.grounded) {
      state.velocity.y = this.options.jumpSpeed;
      state.grounded = false;
      this.events.emit("player:jump", { position: state.position.clone() });
    } else if (state.grounded) {
      state.velocity.y = Math.max(0, state.velocity.y);
    } else {
      state.velocity.y -= this.options.gravity * delta;
    }

    state.position.addScaledVector(state.velocity, delta);
    this.syncMovingState();
  }

  syncMovingState() {
    const state = this.player.getMutableState();
    const wasMoving = state.moving;
    state.moving = state.velocity.x ** 2 + state.velocity.z ** 2 > 0.0001;

    if (!wasMoving && state.moving) {
      this.events.emit("player:move:start", {
        position: state.position.clone(),
        velocity: state.velocity.clone(),
      });
    } else if (wasMoving && !state.moving) {
      this.events.emit("player:move:stop", {
        position: state.position.clone(),
      });
    }
  }

  reset() {
    this.currentHorizontalVelocity.set(0, 0, 0);
    this.targetHorizontalVelocity.set(0, 0, 0);
    this.nextHorizontalVelocity.set(0, 0, 0);
    this.localDirection.set(0, 0, 0);
  }
}

function resolveHorizontalVelocity({
  current,
  target,
  grounded,
  hasMoveInput,
  delta,
  options,
  output,
}: {
  current: Vector3;
  target: Vector3;
  grounded: boolean;
  hasMoveInput: boolean;
  delta: number;
  options: Pick<
    MovementOptions,
    | "horizontalAcceleration"
    | "horizontalDeceleration"
    | "airControlMultiplier"
    | "airDrag"
  >;
  output: Vector3;
}) {
  if (grounded) {
    const acceleration = hasMoveInput
      ? options.horizontalAcceleration
      : options.horizontalDeceleration;

    return moveVectorToward(current, target, acceleration * delta, output);
  }

  if (!hasMoveInput) {
    return moveVectorToward(current, target, options.airDrag * delta, output);
  }

  return moveVectorToward(
    current,
    target,
    options.horizontalAcceleration * options.airControlMultiplier * delta,
    output,
  );
}

function moveVectorToward(
  current: Vector3,
  target: Vector3,
  maxDelta: number,
  output: Vector3,
) {
  output.copy(target).sub(current);
  const distance = output.length();

  if (distance === 0 || distance <= maxDelta) {
    return output.copy(target);
  }

  return output.multiplyScalar(maxDelta / distance).add(current);
}

function isForwardPressed(input: InputAPI) {
  return input.isPressed("KeyW") || input.isPressed("ArrowUp");
}

function isBackwardPressed(input: InputAPI) {
  return input.isPressed("KeyS") || input.isPressed("ArrowDown");
}

function isLeftPressed(input: InputAPI) {
  return input.isPressed("KeyA") || input.isPressed("ArrowLeft");
}

function isRightPressed(input: InputAPI) {
  return input.isPressed("KeyD") || input.isPressed("ArrowRight");
}
