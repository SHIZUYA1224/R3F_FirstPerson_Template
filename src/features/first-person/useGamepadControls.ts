"use client";

import { useEffect } from "react";
import {
  emptyInputActions,
  mapGamepadState,
} from "@/features/first-person/input-mapping";
import { defaultFirstPersonPlayerConfig } from "@/features/first-person/player-config";
import { useInputStore } from "@/features/first-person/input-store";

export function useGamepadControls() {
  useEffect(() => {
    let frame = 0;

    const poll = () => {
      const gamepad = navigator.getGamepads?.().find((pad) => pad?.connected) ?? null;
      const actions = mapGamepadState(
        gamepad,
        undefined,
        defaultFirstPersonPlayerConfig.gamepadLookResponseCurve,
      );

      useInputStore.getState().setGamepadActions(
        actions.source === "gamepad" ? actions : emptyInputActions,
      );

      frame = requestAnimationFrame(poll);
    };

    frame = requestAnimationFrame(poll);

    return () => cancelAnimationFrame(frame);
  }, []);
}
