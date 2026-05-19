import { WorldClient } from "@/app/world-client";
import { defaultWorld } from "@/features/worlds/world-manifest";

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-[#07090d] text-white">
      <WorldClient world={defaultWorld} />
    </main>
  );
}
