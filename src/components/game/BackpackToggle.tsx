"use client";

type BackpackToggleProps = {
  onClick: () => void;
};

function BackpackIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className="h-7 w-7 fill-current sm:h-8 sm:w-8"
    >
      <path d="M12 8h8v2h2c1.7 0 3 1.3 3 3v12c0 1.7-1.3 3-3 3H10c-1.7 0-3-1.3-3-3V13c0-1.7 1.3-3 3-3h2V8zm2 2v2h4v-2h-4zm-4 4v10h16V14H10zm5 2h2v6h-2v-6zm4 0h2v6h-2v-6z" />
    </svg>
  );
}

// Bottom-screen backpack button to reopen the inventory menu.
export function BackpackToggle({ onClick }: BackpackToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tutorial="backpack-toggle"
      className="pointer-events-auto fixed bottom-5 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-2 rounded-2xl border-2 border-[#4a3428]/80 bg-[#d4a574] px-4 py-2.5 text-sm font-bold text-[#4a3428] shadow-[0_6px_0_#6d4c41,0_10px_24px_rgba(0,0,0,0.45)] transition hover:bg-[#e8bc8a] hover:translate-y-px hover:shadow-[0_5px_0_#6d4c41,0_8px_20px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_3px_0_#6d4c41,0_6px_16px_rgba(0,0,0,0.35)] sm:bottom-6 sm:px-5 sm:py-3"
      aria-label="Open inventory"
    >
      <BackpackIcon />
      <span>Inventory</span>
    </button>
  );
}
