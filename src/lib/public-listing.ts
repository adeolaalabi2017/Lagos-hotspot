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
