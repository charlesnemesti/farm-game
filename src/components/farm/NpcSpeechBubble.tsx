"use client";

type NpcSpeechBubbleProps = {
  text: string;
  speaker?: string;
};

// Compact speech bubble shown above an NPC.
export function NpcSpeechBubble({ text, speaker }: NpcSpeechBubbleProps) {
  return (
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 sm:w-56"
      role="status"
      aria-live="polite"
    >
      <div className="relative rounded-xl border-2 border-[#4a3428] bg-[#fff8e7] px-3 py-2 text-center shadow-lg">
        {speaker ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#8b6914]">
            {speaker}
          </p>
        ) : null}
        <p className="text-xs leading-snug font-semibold text-[#4a3428]">{text}</p>
        <span
          className="absolute top-full left-1/2 block h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent border-t-[#4a3428]"
          aria-hidden
        />
        <span
          className="absolute top-full left-1/2 mt-[-7px] block h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-[#fff8e7]"
          aria-hidden
        />
      </div>
    </div>
  );
}
