"use client";

import { create } from "zustand";
import {
  emptyInputActions,
  mapKeyboardState,
  mapTouchState,
  mergeInputActions,
  type InputActions,
  type InputSource,
  type MoveVector,
} from "@/features/first-person/input-mapping";

interface FirstPersonInputStore {
  activeSource: InputSource;
  pressedKeys: Set<string>;
  touchMove: [number, number];
  touchLookHold: [number, number];
  touchJump: boolean;
  gamepadActions: InputActions;
  lookDelta: [number, number];
  setKey: (code: string, pressed: boolean) => void;
  setTouchMove: (move: MoveVector) => void;
  setTouchLookHold: (look: MoveVector) => void;
  setTouchJump: (jump: boolean) => void;
  setGamepadActions: (actions: InputActions) => void;
  queueLookDelta: (x: number, y: number, source?: InputSource) => void;
  consumeFrameInput: () => InputActions;
  resetInput: () => void;
}

export const useInputStore = create<FirstPersonInputStore>((set, get) => ({
  activeSource: "idle",
  pressedKeys: new Set<string>(),
  touchMove: [0, 0],
  touchLookHold: [0, 0],
  touchJump: false,
  gamepadActions: emptyInputActions,
  lookDelta: [0, 0],
  setKey: (code, pressed) =>
    set((state) => {
      const pressedKeys = new Set(state.pressedKeys);
      if (pressed) {
        pressedKeys.add(code);
      } else {
        pressedKeys.delete(code);
      }
      return {
        pressedKeys,
        activeSource: pressed ? "keyboard" : state.activeSource,
      };
    }),
  setTouchMove: (move) =>
    set({
      touchMove: [move[0], move[1]],
      activeSource: "touch",
    }),
  setTouchLookHold: (look) =>
    set({
      touchLookHold: [look[0], look[1]],
      activeSource: "touch",
    }),
  setTouchJump: (jump) =>
    set({
      touchJump: jump,
      activeSource: "touch",
    }),
  setGamepadActions: (actions) =>
    set((state) => ({
      gamepadActions: actions,
      activeSource: actions.source === "gamepad" ? "gamepad" : state.activeSource,
    })),
  queueLookDelta: (x, y, source = "keyboard") =>
    set((state) => ({
      lookDelta: [state.lookDelta[0] + x, state.lookDelta[1] + y],
      activeSource: source === "idle" ? state.activeSource : source,
    })),
  consumeFrameInput: () => {
    const state = get();
    const keyboard = mapKeyboardState(state.pressedKeys);
    const touch = mapTouchState({
      move: state.touchMove,
      look: state.touchLookHold,
      jump: state.touchJump,
    });
    const look: InputActions = {
      ...emptyInputActions,
      look: state.lookDelta,
      source: state.activeSource,
    };
    const actions = mergeInputActions(keyboard, touch, state.gamepadActions, look);

    set({ lookDelta: [0, 0] });

    return actions;
  },
  resetInput: () =>
    set({
      activeSource: "idle",
      pressedKeys: new Set<string>(),
      touchMove: [0, 0],
      touchLookHold: [0, 0],
      touchJump: false,
      gamepadActions: emptyInputActions,
      lookDelta: [0, 0],
    }),
}));
