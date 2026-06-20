import { FarmScene } from "@/components/farm/FarmScene";

// Fullscreen farm background; planting grid is invisible over the furrows.
export default function Home() {
  return (
    <main className="relative min-h-screen w-full">
      <FarmScene />
    </main>
  );
}
