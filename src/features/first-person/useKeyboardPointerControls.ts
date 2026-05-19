"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useInputStore } from "@/features/first-person/input-store";

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

export function useKeyboardPointerControls(containerRef: RefObject<HTMLElement | null>) {
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const requestPointerLock = useCallback(() => {
    const element = containerRef.current;
    if (!element || document.pointerLockElement === element) {
      return;
    }

    element.requestPointerLock?.();
  }, [containerRef]);

  useEffect(() => {
    const store = useInputStore.getState();

    function onKeyDown(event: KeyboardEvent) {
      if (handledKeys.has(event.code)) {
        event.preventDefault();
      }
      store.setKey(event.code, true);
    }

    function onKeyUp(event: KeyboardEvent) {
      store.setKey(event.code, false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (document.pointerLockElement !== containerRef.current) {
        return;
      }

      useInputStore.getState().queueLookDelta(event.movementX, event.movementY, "keyboard");
    }

    function onPointerLockChange() {
      setIsPointerLocked(document.pointerLockElement === containerRef.current);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [containerRef]);

  return { isPointerLocked, requestPointerLock };
}
