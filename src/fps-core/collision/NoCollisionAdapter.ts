import type {
  CollisionAdapter,
  CollisionResult,
  CollisionState,
} from "@/fps-core/collision/CollisionAdapter";

export class NoCollisionAdapter implements CollisionAdapter {
  resolve(state: CollisionState): CollisionResult {
    return {
      position: state.position.clone(),
      velocity: state.velocity.clone(),
      grounded: false,
      collided: false,
    };
  }
}

export function createNoCollision() {
  return new NoCollisionAdapter();
}
