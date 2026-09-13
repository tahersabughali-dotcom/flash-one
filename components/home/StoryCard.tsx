import { heroCopy } from "@/data/hero";
import { PlayIcon } from "@/components/ui/icons";

export function StoryCard() {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-3 rounded-full border border-white/70 bg-white/50 px-4 py-2.5 text-left shadow-(--shadow-glass) backdrop-blur-md"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-blue text-white shadow-(--shadow-button)">
        <PlayIcon className="size-4 translate-x-px" />
      </span>
      <span className="pr-2 text-sm font-semibold uppercase tracking-[0.16em] text-navy">
        {heroCopy.storyLabel}
      </span>
    </button>
  );
}
