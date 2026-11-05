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

/**
 * A spot's cover photo, or a dark placeholder with its category icon when it
 * has none. The placeholder is dark on purpose: cards and the detail header
 * lay white text and badges over this area.
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
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-foreground text-background",
        className
      )}
    >
      <Icon className="h-10 w-10 opacity-30" aria-hidden="true" />
      <span className="text-xs opacity-70">No photo yet</span>
    </div>
  );
}
