import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { useInputStore } from "@/features/first-person/input-store";
import { useKeyboardPointerControls } from "@/features/first-person/useKeyboardPointerControls";

function PointerHarness() {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useKeyboardPointerControls(ref);

  return (
    <div
      ref={ref}
      data-testid="pointer-target"
      onPointerDown={controls.beginPointerLook}
      onPointerMove={controls.updatePointerLook}
      onPointerUp={controls.endPointerLook}
    />
  );
}

describe("keyboard and pointer controls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useInputStore.getState().resetInput();
  });

  it("falls back to drag look when pointer lock is unavailable", async () => {
    const requestPointerLock = vi.fn(() =>
      Promise.reject(new DOMException("not available", "SecurityError")),
    );
    Object.defineProperty(HTMLElement.prototype, "requestPointerLock", {
      configurable: true,
      value: requestPointerLock,
    });

    render(<PointerHarness />);

    const target = screen.getByTestId("pointer-target");
    fireEvent.pointerDown(target, {
      pointerType: "mouse",
      pointerId: 7,
      button: 0,
      clientX: 120,
      clientY: 160,
    });
    fireEvent.pointerMove(target, {
      pointerType: "mouse",
      pointerId: 7,
      buttons: 1,
      clientX: 150,
      clientY: 140,
    });

    const actions = useInputStore.getState().consumeFrameInput();
    expect(requestPointerLock).toHaveBeenCalledTimes(1);
    expect(actions.source).toBe("keyboard");
    expect(actions.look).toEqual([30, -20]);

    fireEvent.pointerUp(target, {
      pointerType: "mouse",
      pointerId: 7,
      button: 0,
      clientX: 150,
      clientY: 140,
    });
    await Promise.resolve();
  });
});
