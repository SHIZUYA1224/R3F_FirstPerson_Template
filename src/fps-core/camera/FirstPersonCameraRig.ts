import type { Camera } from "three";
import type { CameraRig, LookOptions } from "@/fps-core/camera/CameraRig";
import type { InputAPI } from "@/fps-core/input/InputAPI";
import type { PlayerAPI } from "@/fps-core/player/PlayerAPI";

export type FirstPersonCameraRigOptions = LookOptions & {
  height: number;
};

export class FirstPersonCameraRig implements CameraRig {
  private yaw = 0;
  private pitch = 0;

  constructor(
    private readonly camera: Camera,
    private readonly options: FirstPersonCameraRigOptions,
  ) {}

  updateLook(input: InputAPI) {
    const look = input.getMouseDelta();
    if (look.x === 0 && look.y === 0) {
      return;
    }

    this.setLook(
      this.yaw - look.x * this.options.sensitivity,
      this.pitch - look.y * this.options.sensitivity,
    );
  }

  updateFromPlayer(player: PlayerAPI) {
    const position = player.getPosition();

    this.camera.position.set(
      position.x,
      position.y + this.options.height,
      position.z,
    );
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }

  getYaw() {
    return this.yaw;
  }

  getPitch() {
    return this.pitch;
  }

  setLook(yaw: number, pitch: number) {
    this.yaw = yaw;
    this.pitch = Math.min(
      this.options.maxPitch,
      Math.max(this.options.minPitch, pitch),
    );
  }
}
