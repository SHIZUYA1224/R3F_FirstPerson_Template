"use client";

import { ChevronsUp } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { useInputStore } from "@/features/first-person/input-store";

const joystickRadius = 48;

export function MobileControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickPointer = useRef<number | null>(null);
  const lookPointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const [knob, setKnob] = useState<[number, number]>([0, 0]);

  function updateJoystick(event: PointerEvent<HTMLDivElement>) {
    const bounds = joystickRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const length = Math.hypot(rawX, rawY);
    const scale = length > joystickRadius ? joystickRadius / length : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    setKnob([x, y]);
    useInputStore.getState().setTouchMove([x / joystickRadius, -y / joystickRadius]);
  }

  function releaseJoystick(event: PointerEvent<HTMLDivElement>) {
    if (joystickPointer.current !== event.pointerId) {
      return;
    }

    joystickPointer.current = null;
    setKnob([0, 0]);
    useInputStore.getState().setTouchMove([0, 0]);
  }

  function startLook(event: PointerEvent<HTMLDivElement>) {
    lookPointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function updateLook(event: PointerEvent<HTMLDivElement>) {
    const active = lookPointer.current;
    if (!active || active.id !== event.pointerId) {
      return;
    }

    useInputStore
      .getState()
      .queueLookDelta(event.clientX - active.x, event.clientY - active.y, "touch");
    lookPointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function releaseLook(event: PointerEvent<HTMLDivElement>) {
    if (lookPointer.current?.id === event.pointerId) {
      lookPointer.current = null;
    }
  }

  return (
    <div
      data-testid="mobile-controls"
      className="pointer-events-none absolute inset-0 z-20 md:hidden"
    >
      <div
        aria-label="Look area"
        data-testid="mobile-look-zone"
        className="pointer-events-auto absolute bottom-0 right-0 top-16 w-1/2 touch-none"
        onPointerDown={startLook}
        onPointerMove={updateLook}
        onPointerCancel={releaseLook}
        onPointerUp={releaseLook}
      />
      <div
        ref={joystickRef}
        aria-label="Move joystick"
        data-testid="mobile-joystick"
        className="pointer-events-auto absolute bottom-8 left-8 h-32 w-32 touch-none rounded-full border border-white/20 bg-black/30 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur"
        onPointerDown={(event) => {
          if (joystickPointer.current !== null) {
            return;
          }

          joystickPointer.current = event.pointerId;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          updateJoystick(event);
        }}
        onPointerMove={(event) => {
          if (joystickPointer.current === event.pointerId) {
            updateJoystick(event);
          }
        }}
        onPointerCancel={releaseJoystick}
        onPointerUp={releaseJoystick}
      >
        <div
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-emerald-300/80 shadow-[0_0_30px_rgba(110,231,183,0.26)]"
          style={{
            transform: `translate(calc(-50% + ${knob[0]}px), calc(-50% + ${knob[1]}px))`,
          }}
        />
      </div>
      <button
        aria-label="Jump"
        data-testid="mobile-jump"
        className="pointer-events-auto absolute bottom-10 right-9 grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-amber-300/85 text-[#1a1306] shadow-[0_12px_40px_rgba(0,0,0,0.32)] backdrop-blur active:scale-95"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          useInputStore.getState().setTouchJump(true);
        }}
        onPointerCancel={() => useInputStore.getState().setTouchJump(false)}
        onPointerUp={() => useInputStore.getState().setTouchJump(false)}
      >
        <ChevronsUp aria-hidden="true" size={30} strokeWidth={2.4} />
      </button>
    </div>
  );
}
