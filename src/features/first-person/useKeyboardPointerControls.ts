"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
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
  const [isDragLooking, setIsDragLooking] = useState(false);
  const dragPointer = useRef<{ id: number; x: number; y: number } | null>(null);

  const requestPointerLock = useCallback(async () => {
    const element = containerRef.current;
    if (!element || document.pointerLockElement === element) {
      return Boolean(element);
    }

    if (!element.requestPointerLock) {
      return false;
    }

    try {
      await Promise.resolve(element.requestPointerLock());
      return document.pointerLockElement === element;
    } catch {
      return false;
    }
  }, [containerRef]);

  const beginPointerLook = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }

      const element = containerRef.current;
      if (!element) {
        return;
      }

      event.preventDefault();
      element.focus({ preventScroll: true });

      const pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };

      dragPointer.current = pointer;
      setIsDragLooking(true);
      try {
        element.setPointerCapture?.(pointer.id);
      } catch {
        // Some browsers only allow capture for trusted pointer events.
      }

      void requestPointerLock().then((locked) => {
        if (locked || document.pointerLockElement === element) {
          dragPointer.current = null;
          setIsDragLooking(false);
        }
      });
    },
    [containerRef, requestPointerLock],
  );

  const updatePointerLook = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (document.pointerLockElement === containerRef.current) {
        return;
      }

      const active = dragPointer.current;
      if (!active || active.id !== event.pointerId) {
        return;
      }

      event.preventDefault();
      useInputStore
        .getState()
        .queueLookDelta(event.clientX - active.x, event.clientY - active.y, "keyboard");
      dragPointer.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    },
    [containerRef],
  );

  const endPointerLook = useCallback((event: PointerEvent<HTMLElement>) => {
    if (dragPointer.current?.id !== event.pointerId) {
      return;
    }

    dragPointer.current = null;
    setIsDragLooking(false);
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // The browser may already release capture after pointerup/cancel.
    }
  }, []);

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

    function onBlur() {
      dragPointer.current = null;
      setIsDragLooking(false);
      store.resetInput();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
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
      const locked = document.pointerLockElement === containerRef.current;
      setIsPointerLocked(locked);
      if (locked) {
        dragPointer.current = null;
        setIsDragLooking(false);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [containerRef]);

  return {
    isPointerLocked,
    isDragLooking,
    beginPointerLook,
    updatePointerLook,
    endPointerLook,
    requestPointerLock,
  };
}
