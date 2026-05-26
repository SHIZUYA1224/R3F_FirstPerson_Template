import type { FPSContext } from "@/fps-core/core/FPSContext";

export type FPSPlugin = {
  id: string;
  install(context: FPSContext): void;
  update?(delta: number, context: FPSContext): void;
  enable?(): void;
  disable?(): void;
  dispose?(): void;
};
