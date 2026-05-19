"use client";

import { Gamepad2, Keyboard, Smartphone } from "lucide-react";
import { useInputStore } from "@/features/first-person/input-store";
import type { InputSource } from "@/features/first-person/input-mapping";

const sourceLabel: Record<InputSource, string> = {
  idle: "Ready",
  keyboard: "Pointer",
  touch: "Touch",
  gamepad: "Gamepad",
};

export function ControlHud({ worldName }: { worldName: string }) {
  const activeSource = useInputStore((state) => state.activeSource);
  const Icon =
    activeSource === "touch"
      ? Smartphone
      : activeSource === "gamepad"
        ? Gamepad2
        : Keyboard;

  return (
    <>
      <div
        data-testid="control-hud"
        className="pointer-events-none absolute left-4 top-4 z-30 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded border border-white/15 bg-black/45 px-3 py-2 text-xs text-zinc-100 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur"
      >
        <span className="max-w-[38vw] truncate font-medium">{worldName}</span>
        <span className="h-4 w-px bg-white/20" />
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase text-emerald-200">
          <Icon aria-hidden="true" size={14} strokeWidth={2.2} />
          {sourceLabel[activeSource]}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
      </div>
    </>
  );
}
