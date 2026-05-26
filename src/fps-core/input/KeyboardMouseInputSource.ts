import type { EventBus } from "@/fps-core/events/EventBus";
import type { MouseDelta } from "@/fps-core/input/InputAPI";
import type { InputSource } from "@/fps-core/input/InputSource";

const handledKeys = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
]);

export class KeyboardMouseInputSource implements InputSource {
  private enabled = false;
  private pressedKeys = new Set<string>();
  private pendingPressedKeys = new Set<string>();
  private pendingReleasedKeys = new Set<string>();
  private framePressedKeys = new Set<string>();
  private frameReleasedKeys = new Set<string>();
  private pendingMouseDelta: MouseDelta = { x: 0, y: 0 };
  private frameMouseDelta: MouseDelta = { x: 0, y: 0 };
  private pointerLocked = false;

  constructor(
    private readonly domElement: HTMLElement,
    private readonly events: EventBus,
  ) {}

  update() {
    this.framePressedKeys = new Set(this.pendingPressedKeys);
    this.frameReleasedKeys = new Set(this.pendingReleasedKeys);
    this.frameMouseDelta = { ...this.pendingMouseDelta };

    this.pendingPressedKeys.clear();
    this.pendingReleasedKeys.clear();
    this.pendingMouseDelta.x = 0;
    this.pendingMouseDelta.y = 0;
  }

  enable() {
    if (this.enabled) {
      return;
    }

    this.enabled = true;
    this.pointerLocked = this.isPointerLocked();
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleBlur);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("pointerlockchange", this.handlePointerLockChange);
    this.domElement.addEventListener("click", this.handleClick);
  }

  disable() {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.unlockPointer();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("pointerlockchange", this.handlePointerLockChange);
    this.domElement.removeEventListener("click", this.handleClick);
    this.reset();

    if (this.pointerLocked) {
      this.pointerLocked = false;
      this.events.emit("input:pointerlock:change", { locked: false });
    }
  }

  dispose() {
    this.disable();
  }

  isPressed(code: string) {
    return this.pressedKeys.has(code);
  }

  wasPressed(code: string) {
    return this.framePressedKeys.has(code);
  }

  wasReleased(code: string) {
    return this.frameReleasedKeys.has(code);
  }

  getMouseDelta() {
    return { ...this.frameMouseDelta };
  }

  lockPointer() {
    if (this.isPointerLocked() || !this.domElement.requestPointerLock) {
      return;
    }

    try {
      const result: unknown = this.domElement.requestPointerLock();
      if (isPromiseLike(result)) {
        void result.catch(() => undefined);
      }
    } catch {
      // Pointer Lock can fail outside a trusted user gesture.
    }
  }

  unlockPointer() {
    if (!this.isPointerLocked() || !document.exitPointerLock) {
      return;
    }

    try {
      const result: unknown = document.exitPointerLock();
      if (isPromiseLike(result)) {
        void result.catch(() => undefined);
      }
    } catch {
      // Ignore browser-specific pointer lock release failures.
    }
  }

  isPointerLocked() {
    return document.pointerLockElement === this.domElement;
  }

  private reset() {
    this.pressedKeys.clear();
    this.pendingPressedKeys.clear();
    this.pendingReleasedKeys.clear();
    this.framePressedKeys.clear();
    this.frameReleasedKeys.clear();
    this.pendingMouseDelta = { x: 0, y: 0 };
    this.frameMouseDelta = { x: 0, y: 0 };
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (handledKeys.has(event.code)) {
      event.preventDefault();
    }

    if (!this.pressedKeys.has(event.code)) {
      this.pendingPressedKeys.add(event.code);
    }
    this.pressedKeys.add(event.code);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    if (this.pressedKeys.has(event.code)) {
      this.pendingReleasedKeys.add(event.code);
    }
    this.pressedKeys.delete(event.code);
  };

  private handleBlur = () => {
    for (const code of this.pressedKeys) {
      this.pendingReleasedKeys.add(code);
    }
    this.pressedKeys.clear();
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isPointerLocked()) {
      return;
    }

    this.pendingMouseDelta.x += event.movementX;
    this.pendingMouseDelta.y += event.movementY;
  };

  private handlePointerLockChange = () => {
    const nextLocked = this.isPointerLocked();
    if (nextLocked === this.pointerLocked) {
      return;
    }

    this.pointerLocked = nextLocked;
    this.events.emit("input:pointerlock:change", { locked: nextLocked });
  };

  private handleClick = () => {
    this.lockPointer();
  };
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "catch" in value &&
    typeof value.catch === "function"
  );
}
