import type { InputAPI } from "@/fps-core/input/InputAPI";

export type InputSource = InputAPI & {
  update(): void;
  enable(): void;
  disable(): void;
  dispose(): void;
};
