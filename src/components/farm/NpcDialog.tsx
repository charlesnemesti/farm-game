"use client";

type NpcDialogProps = {
  open: boolean;
  name: string;
  message: string;
  onClose: () => void;
};

// Simple dialogue box shown when the player clicks an NPC.
export function NpcDialog({ open, name, message, onClose }: NpcDialogProps) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[200] flex items-end justify-center p-4 pb-10">
      <button
        type="button"
        aria-label="Close dialogue"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-black/90 p-5 text-white shadow-2xl backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-farm-sun">{name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <p className="text-sm leading-relaxed text-white/90">{message}</p>
      </div>
    </div>
  );
}
