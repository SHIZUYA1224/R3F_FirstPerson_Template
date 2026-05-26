import type { Camera } from "three";
import type { CollisionAPI } from "@/fps-core/collision/CollisionAdapter";
import type { EventBus } from "@/fps-core/events/EventBus";
import type { InputAPI } from "@/fps-core/input/InputAPI";
import type { PlayerAPI } from "@/fps-core/player/PlayerAPI";
import type { TimeAPI } from "@/fps-core/time/TimeState";

export type FPSContext = {
  camera: Camera;
  domElement: HTMLElement;
  player: PlayerAPI;
  input: InputAPI;
  events: EventBus;
  time: TimeAPI;
  collision?: CollisionAPI;
};
