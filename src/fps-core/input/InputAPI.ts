export type MouseDelta = {
  x: number;
  y: number;
};

export type InputAPI = {
  isPressed(code: string): boolean;
  wasPressed(code: string): boolean;
  wasReleased(code: string): boolean;
  getMouseDelta(): MouseDelta;
  lockPointer(): void;
  unlockPointer(): void;
  isPointerLocked(): boolean;
};
