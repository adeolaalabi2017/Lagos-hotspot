import { BookOpen, Coffee, Moon, Palette, Umbrella, UtensilsCrossed, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// Same family of deep, flat tones as the spot fallbacks (SpotPhoto).
const GUIDE_STYLE: Record<string, { tone: string; Icon: React.ElementType }> = {
  Guides: { tone: "oklch(0.30 0.045 55)", Icon: BookOpen },
  Nightlife: { tone: "oklch(0.28 0.06 255)", Icon: Moon },
  Beaches: { tone: "oklch(0.33 0.06 205)", Icon: Umbrella },
  Food: { tone: "oklch(0.34 0.09 35)", Icon: UtensilsCrossed },
  Culture: { tone: "oklch(0.34 0.07 75)", Icon: Palette },
  Cafes: { tone: "oklch(0.31 0.045 55)", Icon: Coffee },
  Budget: { tone: "oklch(0.31 0.06 160)", Icon: Wallet },
};

/**
 * A guide's cover photo, or, without one, a flat category-toned panel with the
 * category icon set large and cropped into the corner. Decorative either way:
 * the card's title carries the meaning.
 */
export function GuideCover({
  src,
  category,
  className,
}: {
  src?: string | null;
  category: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt="" loading="lazy" className={cn("object-cover", className)} />;
  }
  const { tone, Icon } = GUIDE_STYLE[category] ?? GUIDE_STYLE.Guides;
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden text-white", className)}
      style={{ backgroundColor: tone }}
    >
      <Icon strokeWidth={1} className="absolute -right-[6%] -bottom-[14%] h-[80%] w-auto aspect-square opacity-[0.16]" />
    </div>
  );
}
