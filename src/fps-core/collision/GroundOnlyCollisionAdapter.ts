import { Vector3 } from "three";
import type {
  CollisionAdapter,
  CollisionResult,
  CollisionState,
} from "@/fps-core/collision/CollisionAdapter";

const upNormal = new Vector3(0, 1, 0);

export type GroundOnlyCollisionOptions = {
  groundY?: number;
};

export class GroundOnlyCollisionAdapter implements CollisionAdapter {
  private readonly groundY: number;

  constructor(options: GroundOnlyCollisionOptions = {}) {
    this.groundY = options.groundY ?? 0;
  }

  resolve(state: CollisionState): CollisionResult {
    const position = state.position.clone();
    const velocity = state.velocity.clone();
    const belowGround = position.y < this.groundY;
    const grounded = position.y <= this.groundY;
    const collided = belowGround || (grounded && velocity.y < 0);

    if (grounded) {
      position.y = this.groundY;
      if (velocity.y < 0) {
        velocity.y = 0;
      }
    }

    return {
      position,
      velocity,
      grounded,
      collided,
      normal: collided ? upNormal.clone() : undefined,
    };
  }
}

export function createGroundOnlyCollision(options?: GroundOnlyCollisionOptions) {
  return new GroundOnlyCollisionAdapter(options);
}
