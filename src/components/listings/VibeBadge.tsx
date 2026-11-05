import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The vibe score pill laid over a spot's photo. The score starts at 60 before
 * anyone has reviewed a spot (see convex/hotspots.ts), so a spot with no
 * reviews shows "New" instead of a number that would read as earned.
 */
export function VibeBadge({
  score,
  reviews,
  className,
}: {
  score: number;
  reviews: number;
  className?: string;
}) {
  const isNew = reviews === 0;
  return (
    <span
      title={isNew ? "No reviews yet, so no vibe score" : `Vibe score ${score} out of 100, from ratings and reviews`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm",
        className
      )}
    >
      {isNew ? (
        "New"
      ) : (
        <>
          <Flame className="h-3 w-3 text-orange-400" aria-hidden="true" />
          <span className="sr-only">Vibe score</span>
          <span aria-hidden="true">Vibe</span> {score}
        </>
      )}
    </span>
  );
}
