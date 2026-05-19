import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileControls } from "@/features/first-person/MobileControls";
import { ControlHud } from "@/features/first-person/ControlHud";
import { useInputStore } from "@/features/first-person/input-store";

describe("mobile control UI", () => {
  afterEach(() => {
    useInputStore.getState().resetInput();
  });

  it("renders touch movement, look, and jump surfaces", () => {
    render(<MobileControls />);

    expect(screen.getByTestId("mobile-controls")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-joystick")).toHaveAccessibleName("Move joystick");
    expect(screen.getByTestId("mobile-look-zone")).toHaveAccessibleName("Look area");
    expect(screen.getByTestId("mobile-jump")).toHaveAccessibleName("Jump");
  });
});

describe("control HUD", () => {
  afterEach(() => {
    useInputStore.getState().resetInput();
  });

  it("shows the world name and active input mode", () => {
    useInputStore.getState().setTouchMove([0.5, 0]);
    render(<ControlHud worldName="Starter Room" />);

    expect(screen.getByTestId("control-hud")).toHaveTextContent("Starter Room");
    expect(screen.getByTestId("control-hud")).toHaveTextContent("Touch");
  });
});
