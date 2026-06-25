import Link from "next/link";

// Prominent return control for the docs page (game HUD stays fixed on top).
export function DocsBackToFarmButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 rounded-lg border border-[#4a3428]/35 bg-[#f5e6c8]/95 px-4 py-2 text-sm font-bold text-[#4a3428] shadow-md transition hover:bg-[#e8d4a8] ${className}`}
    >
      <span aria-hidden>←</span>
      Back to farm
    </Link>
  );
}
