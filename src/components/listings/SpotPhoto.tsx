import {
  Coffee,
  Flower2,
  MapPin,
  Music,
  Palette,
  ShoppingBag,
  Umbrella,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Food & Dining": UtensilsCrossed,
  Nightlife: Wine,
  "Beaches & Resorts": Umbrella,
  "Culture & Arts": Palette,
  "Cafes & Hangouts": Coffee,
  Shopping: ShoppingBag,
  "Events & Entertainment": Music,
  "Wellness & Spa": Flower2,
};

// A deep, flat tone per category, so a spot without a photo still reads as
// its kind at a glance. All stay dark enough for the white badges and text
// that cards and the detail header lay over this area.
const CATEGORY_TONES: Record<string, string> = {
  "Food & Dining": "oklch(0.34 0.09 35)",
  Nightlife: "oklch(0.28 0.06 255)",
  "Beaches & Resorts": "oklch(0.33 0.06 205)",
  "Culture & Arts": "oklch(0.34 0.07 75)",
  "Cafes & Hangouts": "oklch(0.31 0.045 55)",
  Shopping: "oklch(0.30 0.08 15)",
  "Events & Entertainment": "oklch(0.31 0.06 160)",
  "Wellness & Spa": "oklch(0.33 0.045 135)",
};

/**
 * A spot's cover photo, or, when it has none, a flat category-toned panel
 * with the category icon set large and cropped into the corner.
 *
 * `className` sizes it (height or aspect) and is applied in both cases.
 */
export function SpotPhoto({
  src,
  alt,
  category,
  className,
  loading,
}: {
  src?: string | null;
  alt: string;
  category: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  if (src) {
    return <img src={src} alt={alt} loading={loading} className={cn("object-cover", className)} />;
  }
  const Icon = CATEGORY_ICONS[category] ?? MapPin;
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative overflow-hidden text-white", className)}
      style={{ backgroundColor: CATEGORY_TONES[category] ?? "oklch(0.29 0.03 40)" }}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={1}
        className="absolute -right-[6%] -bottom-[12%] h-[78%] w-auto aspect-square opacity-[0.16]"
      />
    </div>
  );
}
