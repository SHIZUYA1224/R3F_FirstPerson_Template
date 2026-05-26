import type { FPSPlugin } from "@/fps-core/core/FPSPlugin";

export function createDebugPlugin(): FPSPlugin {
  const disposers: Array<() => void> = [];

  return {
    id: "debug-plugin",
    install(context) {
      disposers.push(
        context.events.on("player:jump", () => {
          console.log("player jumped");
        }),
      );
    },
    update(_delta, context) {
      const position = context.player.getPosition();
      console.log("position", position.x, position.y, position.z);
    },
    dispose() {
      for (const dispose of disposers.splice(0)) {
        dispose();
      }
      console.log("debug plugin disposed");
    },
  };
}
