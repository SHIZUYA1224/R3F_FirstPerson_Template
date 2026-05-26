import { Vector3 } from "three";
import type { CollisionResult } from "@/fps-core/collision/CollisionAdapter";
import type { EventBus } from "@/fps-core/events/EventBus";
import type { PlayerAPI } from "@/fps-core/player/PlayerAPI";
import {
  createPlayerState,
  type PlayerState,
} from "@/fps-core/player/PlayerState";

const upAxis = new Vector3(0, 1, 0);

export class PlayerController {
  private readonly initialPosition: Vector3;
  private readonly state: PlayerState;

  readonly api: PlayerAPI;

  constructor({
    initialPosition = new Vector3(),
    getYaw,
    events,
  }: {
    initialPosition?: Vector3;
    getYaw: () => number;
    events: EventBus;
  }) {
    this.initialPosition = initialPosition.clone();
    this.state = createPlayerState(initialPosition);

    this.api = {
      getPosition: () => this.state.position.clone(),
      setPosition: (position) => {
        this.state.position.copy(position);
      },
      getVelocity: () => this.state.velocity.clone(),
      getForward: () =>
        new Vector3(0, 0, -1).applyAxisAngle(upAxis, getYaw()).normalize(),
      getRight: () =>
        new Vector3(1, 0, 0).applyAxisAngle(upAxis, getYaw()).normalize(),
      isGrounded: () => this.state.grounded,
      isMoving: () => this.state.moving,
      isSprinting: () => this.state.sprinting,
      teleport: (position) => {
        this.state.position.copy(position);
        this.state.velocity.set(0, 0, 0);
        events.emit("player:teleport", { position: this.state.position.clone() });
      },
    };
  }

  getMutableState() {
    return this.state;
  }

  applyCollisionResult(result: CollisionResult) {
    this.state.position.copy(result.position);
    this.state.velocity.copy(result.velocity);
    this.state.grounded = result.grounded;
  }

  reset(position = this.initialPosition) {
    this.state.position.copy(position);
    this.state.velocity.set(0, 0, 0);
    this.state.grounded = false;
    this.state.moving = false;
    this.state.sprinting = false;
  }
}
