type PrismaListing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: string | null;
  image: string | null;
  rating: number;
  reviewCount: number;
  location: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  instagramHandle: string | null;
  isFeatured: boolean;
  isOpen: boolean;
  isVerified: boolean;
  isTrending: boolean;
  tags: string | null;
  amenities: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaHour = {
  id: string;
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

type PrismaMedia = {
  id: string;
  url: string;
  kind: string;
};

export interface PublicHotspot {
  id: string;
  title: string;
  description: string;
  category: string;
  priceLevel: 1 | 2 | 3 | 4 | null;
  image: string;
  rating: number;
  reviews: number;
  area: string;
  city: string;
  phone: string;
  whatsappNumber: string;
  instagramHandle: string;
  isFeatured: boolean;
  isOpen: boolean;
  isTrending: boolean;
  isVerified: boolean;
  isClosed: boolean;
  tags: string[];
  amenities: string[];
  vibeScore: number;
  lat: number | null;
  lng: number | null;
  gallery: string[];
  hours: { day: string; time: string }[];
  createdAt: string;
  updatedAt: string;
}

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatHour(time: string | null | undefined): string | null {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function vibeScore(row: {
  rating: number;
  reviewCount: number;
  isTrending: boolean;
  isVerified: boolean;
}): number {
  const base =
    60 +
    row.rating * 5 +
    (row.isTrending ? 5 : 0) +
    (row.isVerified ? 3 : 0) +
    Math.min(15, row.reviewCount);
  return Math.min(99, Math.max(0, Math.round(base)));
}

function priceLevelFromString(price: string | null): 1 | 2 | 3 | 4 | null {
  if (!price) return null;
  const n = Number(price);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function projectHours(hours: PrismaHour[] | undefined): {
  day: string;
  time: string;
}[] {
  if (!hours || hours.length === 0) return [];
  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  return sorted.map((h) => {
    const day = DAY_LABELS[h.dayOfWeek] ?? `Day ${h.dayOfWeek}`;
    if (h.isClosed) return { day, time: "Closed" };
    const opens = formatHour(h.opensAt);
    const closes = formatHour(h.closesAt);
    if (opens && closes) return { day, time: `${opens} – ${closes}` };
    return { day, time: "Hours unavailable" };
  });
}

function projectBase(
  listing: PrismaListing,
  hours: PrismaHour[] | undefined,
  media: PrismaMedia[] | undefined
): PublicHotspot {
  const gallery = (media ?? [])
    .filter((m) => m.kind === "image")
    .map((m) => m.url);

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description ?? "",
    category: listing.category,
    priceLevel: priceLevelFromString(listing.price),
    image: listing.image ?? "",
    rating: listing.rating ?? 0,
    reviews: listing.reviewCount ?? 0,
    area: listing.location ?? "",
    city: listing.city ?? "Lagos",
    phone: listing.phone ?? "",
    whatsappNumber: listing.whatsappNumber ?? "",
    instagramHandle: listing.instagramHandle ?? "",
    isFeatured: listing.isFeatured,
    isOpen: listing.isOpen,
    isTrending: listing.isTrending,
    isVerified: listing.isVerified,
    isClosed: !listing.isOpen,
    tags: splitCsv(listing.tags),
    amenities: splitCsv(listing.amenities),
    vibeScore: vibeScore({
      rating: listing.rating ?? 0,
      reviewCount: listing.reviewCount ?? 0,
      isTrending: listing.isTrending,
      isVerified: listing.isVerified,
    }),
    lat: listing.lat,
    lng: listing.lng,
    gallery,
    hours: projectHours(hours),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };
}

export function toPublicHotspot(
  listing: PrismaListing & { hours?: PrismaHour[]; media?: PrismaMedia[] }
): PublicHotspot {
  return projectBase(listing, listing.hours, listing.media);
}

export function toPublicHotspotDetail(
  listing: PrismaListing & {
    hours?: PrismaHour[];
    media?: PrismaMedia[];
  }
): PublicHotspot {
  const base = projectBase(listing, listing.hours, listing.media);
  return {
    ...base,
    description: listing.description ?? "",
    gallery: (listing.media ?? [])
      .filter((m) => m.kind === "image" && m.url !== listing.image)
      .map((m) => m.url),
    hours: projectHours(listing.hours),
  };
}
