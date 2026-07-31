// Mock data for Lagos Hotspot — Lagos Hotspot Discovery Platform

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  hotspotTitle: string;
  isVerified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  slug: string;
  content: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  image: string;
  hotspotCount: number;
  popularCategories: string[];
}

// ─── Categories ──────────────────────────────────────────
export const categories: Category[] = [
  { id: "food-dining", name: "Food & Dining", icon: "UtensilsCrossed", count: 248, color: "bg-primary/10 text-primary" },
  { id: "nightlife", name: "Nightlife", icon: "Wine", count: 156, color: "bg-primary/15 text-primary" },
  { id: "beaches", name: "Beaches & Resorts", icon: "Umbrella", count: 42, color: "bg-accent text-accent-foreground" },
  { id: "culture-arts", name: "Culture & Arts", icon: "Palette", count: 89, color: "bg-accent text-accent-foreground" },
  { id: "cafes", name: "Cafes & Hangouts", icon: "Coffee", count: 134, color: "bg-secondary text-secondary-foreground" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", count: 198, color: "bg-secondary text-secondary-foreground" },
  { id: "events", name: "Events & Entertainment", icon: "Music", count: 67, color: "bg-primary/10 text-primary" },
  { id: "wellness", name: "Wellness & Spa", icon: "Flower2", count: 73, color: "bg-accent text-accent-foreground" },
];

// ─── Lagos Neighborhoods ─────────────────────────────────
export const neighborhoods: Neighborhood[] = [
  {
    id: "victoria-island",
    name: "Victoria Island",
    description: "Lagos' premier business and entertainment district with upscale dining, clubs, and waterfront views",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    hotspotCount: 187,
    popularCategories: ["Food & Dining", "Nightlife", "Cafes & Hangouts"],
  },
  {
    id: "ikoyi",
    name: "Ikoyi",
    description: "Exclusive residential area with boutique restaurants, art galleries, and the famous Ikoyi Club",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    hotspotCount: 143,
    popularCategories: ["Food & Dining", "Culture & Arts", "Wellness & Spa"],
  },
  {
    id: "lekki",
    name: "Lekki",
    description: "Fast-growing area with beach resorts, shopping malls, and a vibrant food scene",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    hotspotCount: 156,
    popularCategories: ["Beaches & Resorts", "Shopping", "Food & Dining"],
  },
  {
    id: "yaba",
    name: "Yaba",
    description: "Lagos' tech hub with a young creative energy, street food culture, and art spaces",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
    hotspotCount: 89,
    popularCategories: ["Cafes & Hangouts", "Culture & Arts", "Food & Dining"],
  },
  {
    id: "surulere",
    name: "Surulere",
    description: "The heart of Lagos culture with live music venues, local bukas, and vibrant street life",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
    hotspotCount: 112,
    popularCategories: ["Events & Entertainment", "Food & Dining", "Culture & Arts"],
  },
  {
    id: "ikeja",
    name: "Ikeja",
    description: "State capital with government offices, shopping centers, and the famous Computer Village",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80",
    hotspotCount: 98,
    popularCategories: ["Shopping", "Food & Dining", "Cafes & Hangouts"],
  },
];
// ─── Hotspots (moved to Prisma; see src/lib/public-listing.ts) ──

// ─── Reviews ─────────────────────────────────────────────
export const reviews: Review[] = [
  {
    id: "1",
    user: "Chidi Nwosu",
    avatar: "CN",
    rating: 5,
    date: "2 days ago",
    comment: "Absolutely incredible dining experience! The jollof rice here is on another level. The ambiance is perfect for a date night. Will definitely be coming back.",
    hotspotTitle: "Yellow Chilli",
    isVerified: true,
  },
  {
    id: "2",
    user: "Funke Adeyemi",
    avatar: "FA",
    rating: 5,
    date: "1 week ago",
    comment: "Best nightclub in Lagos, hands down! The DJ was amazing and the crowd was great. VIP experience was worth every naira.",
    hotspotTitle: "Quilox Nightclub",
    isVerified: true,
  },
  {
    id: "3",
    user: "Emeka Obi",
    avatar: "EO",
    rating: 4,
    date: "3 days ago",
    comment: "Elegushi never disappoints! The sunset views are breathtaking. Just wish the parking was better organized on weekends.",
    hotspotTitle: "Elegushi Beach",
    isVerified: true,
  },
  {
    id: "4",
    user: "Amara Eze",
    avatar: "AE",
    rating: 5,
    date: "5 days ago",
    comment: "Terra Kulture is a gem! The art exhibitions are always thought-provoking and the bookshop has the best collection of African literature in Lagos.",
    hotspotTitle: "Terra Kulture",
    isVerified: true,
  },
  {
    id: "5",
    user: "Tunde Bakare",
    avatar: "TB",
    rating: 5,
    date: "1 day ago",
    comment: "Thursday night live music at Bogobiri is a must-experience! The Afrobeat band was incredible. Great cocktails too.",
    hotspotTitle: "Bogobiri House",
    isVerified: true,
  },
  {
    id: "6",
    user: "Ngozi Okonkwo",
    avatar: "NO",
    rating: 5,
    date: "4 days ago",
    comment: "Nok by Alara is a culinary masterpiece. The pan-African menu is creative and delicious. The space itself is breathtaking — David Adjaye outdid himself.",
    hotspotTitle: "Nok by Alara",
    isVerified: true,
  },
];

// ─── Blog Posts ──────────────────────────────────────────
export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Hidden Gems in Lagos Only Locals Know About",
    excerpt: "From secret rooftop bars to underground art spaces, discover the Lagos that tourists never see...",
    image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80",
    author: "Adaeze Okoro",
    authorAvatar: "AO",
    date: "Feb 28, 2025",
    readTime: "8 min read",
    category: "Guides",
    slug: "hidden-gems-lagos",
  },
  {
    id: "2",
    title: "The Ultimate Guide to Lagos Nightlife in 2025",
    excerpt: "From upscale lounges in VI to street parties in Surulere, here's your complete guide to partying in Lagos...",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    author: "Chinedu Eze",
    authorAvatar: "CE",
    date: "Feb 25, 2025",
    readTime: "12 min read",
    category: "Nightlife",
    slug: "lagos-nightlife-guide-2025",
  },
  {
    id: "3",
    title: "Lagos Beach Guide: From Elegushi to Tarkwa Bay",
    excerpt: "Explore Lagos' stunning coastline with our comprehensive guide to the best beaches and beach clubs...",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    author: "Folake Adebayo",
    authorAvatar: "FA",
    date: "Feb 20, 2025",
    readTime: "10 min read",
    category: "Beaches",
    slug: "lagos-beach-guide",
  },
  {
    id: "4",
    title: "Where to Find the Best Suya in Lagos",
    excerpt: "A culinary journey through Lagos' most iconic street food — from the suya spots that locals swear by...",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    author: "Obi Nwanze",
    authorAvatar: "ON",
    date: "Feb 15, 2025",
    readTime: "6 min read",
    category: "Food",
    slug: "best-suya-lagos",
  },
  {
    id: "5",
    title: "Art and Culture: Exploring Lagos' Creative Scene",
    excerpt: "From Freedom Park to Rele Gallery, discover the spaces driving Lagos' cultural renaissance...",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80",
    author: "Adaeze Okoro",
    authorAvatar: "AO",
    date: "Feb 10, 2025",
    readTime: "9 min read",
    category: "Culture",
    slug: "lagos-creative-scene",
  },
  {
    id: "6",
    title: "Lagos on a Budget: 20 Things to Do Under ₦5,000",
    excerpt: "You don't need to break the bank to enjoy Lagos. Here are 20 amazing experiences that won't empty your wallet...",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
    author: "Chinedu Eze",
    authorAvatar: "CE",
    date: "Feb 5, 2025",
    readTime: "7 min read",
    category: "Guides",
    slug: "lagos-on-budget",
  },
];

// ─── Help Articles ───────────────────────────────────────
export const helpArticles: HelpArticle[] = [
  {
    id: "1",
    title: "How to Find the Best Hotspots in Your Area",
    excerpt: "Learn how to use Lagos Hotspot's search and filter features to discover amazing places near you",
    category: "Getting Started",
    icon: "Search",
    slug: "find-best-hotspots",
    content: [
      "Lagos Hotspot makes it easy to discover the hottest spots in Lagos. Start by using the search bar at the top of the homepage — you can search by name, area, or category. For example, typing 'suya' will show you all the best suya spots across Lagos, while 'Victoria Island' will filter results to that area.",
      "Use our filter system to narrow down results by category (Food & Dining, Nightlife, Beaches, etc.), price level (Budget-friendly to Luxury), and vibe score. The vibe score is a great indicator of how popular and trending a spot is right now — spots with a score above 80 are currently very hot!",
      "You can also browse by area. Lagos is divided into popular neighborhoods on Lagos Hotspot, including Victoria Island, Ikoyi, Lekki, Yaba, Surulere, and more. Each area page shows the top-rated and trending spots in that neighborhood.",
      "Don't forget to check the 'Open Now' filter if you're looking for something at this very moment. We update opening hours regularly, and many spots have different hours on weekends vs weekdays. Pro tip: save spots you want to visit later so you can quickly access them from your dashboard!"
    ],
  },
  {
    id: "2",
    title: "Writing Helpful Reviews",
    excerpt: "Tips for writing reviews that help other Lagosians discover great spots",
    category: "Community",
    icon: "Star",
    slug: "writing-helpful-reviews",
    content: [
      "Great reviews help the entire Lagos Hotspot community make better decisions. When writing a review, be specific about your experience — instead of saying 'the food was good,' mention what you ordered and what made it special. For example: 'The jollof rice at Yellow Chilli had the perfect smoky flavor, and the asun was generously portioned.'",
      "Include practical details that others will find useful: How was the parking? Did you need a reservation? What's the best time to visit? Is it good for dates, family outings, or business meetings? These details make your review far more valuable than a simple star rating.",
      "Be honest and fair. If you had a negative experience, describe what happened without being overly harsh. Business owners read these reviews too, and constructive feedback helps them improve. Remember that one bad day doesn't necessarily mean a bad spot — consider the overall picture.",
      "Photos make a huge difference! If possible, include photos of the food, ambiance, or view. Lagos Hotspot reviews with photos get 3x more engagement and are far more helpful to people deciding whether to visit a spot."
    ],
  },
  {
    id: "3",
    title: "Understanding Vibe Scores",
    excerpt: "What our vibe scores mean and how they're calculated for each hotspot",
    category: "Features",
    icon: "Flame",
    slug: "understanding-vibe-scores",
    content: [
      "The Vibe Score is Lagos Hotspot's unique way of measuring how 'hot' a spot is right now. Scores range from 0 to 100, with higher scores indicating a spot that's currently trending, popular, and highly recommended by the community.",
      "Vibe Scores are calculated from multiple factors: review ratings and recency (40%), current popularity and visit frequency (25%), social media buzz and mentions (20%), and listing completeness (15%). This means a spot can't simply buy a high score — it must be earned through genuine popularity and community engagement.",
      "A score above 80 means the spot is currently very hot and trending — expect it to be busy, especially on weekends. Scores between 60-79 indicate a popular, well-regarded spot. Scores below 60 might mean the spot is new, hasn't been reviewed much yet, or is currently less popular.",
      "Vibe Scores are updated weekly, so they reflect the current state of a spot rather than historical performance. This means seasonal spots like beach clubs might have higher scores in dry season and lower scores during the rains. Always check the score before heading out!"
    ],
  },
  {
    id: "4",
    title: "Submitting a New Hotspot",
    excerpt: "How to add a new hotspot to Lagos Hotspot and help grow the Lagos community",
    category: "Getting Started",
    icon: "Plus",
    slug: "submitting-new-hotspot",
    content: [
      "Know a great spot that's not on Lagos Hotspot yet? You can submit it through your dashboard! Click 'Add Spot' from the dashboard sidebar, and you'll be taken to the submission form. Fill in as much detail as possible — name, area, category, address, and a brief description.",
      "The more information you provide, the faster we can verify and publish the listing. Include the spot's WhatsApp number, Instagram handle, and typical price range if you know them. Photos are especially helpful — you can upload up to 5 photos of the spot.",
      "Our team reviews all submissions within 24-48 hours. We verify that the spot exists, check the information provided, and may reach out to the business for additional details. Once approved, the listing goes live and you'll get a notification.",
      "As a thank-you for contributing to the community, users who submit spots that get approved earn a contribution badge on their profile. Top contributors are featured on our community page and get early access to new Lagos Hotspot features!"
    ],
  },
  {
    id: "5",
    title: "Managing Your Saved Spots",
    excerpt: "How to save, organize, and share your favorite Lagos hotspots",
    category: "Features",
    icon: "Heart",
    slug: "managing-saved-spots",
    content: [
      "Found a spot you want to try? Hit the heart icon to save it! You can save any hotspot on Lagos Hotspot by clicking the heart button on the listing card or detail page. Saved spots are accessible from your dashboard under 'Saved Spots'.",
      "Explorer plan users can save up to 10 spots, while Scout and Ambassador users enjoy unlimited saves. Your saved spots are organized by category and area, making it easy to find the right spot for any occasion — whether it's date night, a business lunch, or a weekend beach trip.",
      "You can share your saved spots collection with friends via a shareable link. This is great for planning group outings — create a collection of spots for a birthday dinner, a weekend itinerary, or a Lagos visitor's guide. Friends can view your collection without needing an Lagos Hotspot account.",
      "Lagos Hotspot also sends you notifications when your saved spots have special events, new reviews, or changes to operating hours. This way, you'll always be in the loop about your favorite places in Lagos!"
    ],
  },
  {
    id: "6",
    title: "Contacting a Hotspot via WhatsApp",
    excerpt: "How to reach hotspots directly through WhatsApp for reservations and inquiries",
    category: "Features",
    icon: "MessageCircle",
    slug: "contacting-via-whatsapp",
    content: [
      "Most Lagos businesses use WhatsApp as their primary communication channel, and Lagos Hotspot makes it easy to reach them directly. Every hotspot listing includes a WhatsApp button — just click it to open a WhatsApp chat with the business.",
      "When reaching out via WhatsApp, be specific about what you need: 'Hi, I'd like to make a reservation for 4 people this Saturday at 7 PM' works much better than a simple 'Hello.' Mention that you found them on Lagos Hotspot — many businesses offer special deals to Lagos Hotspot users!",
      "For reservations at popular spots like Yellow Chilli, Nok by Alara, or beach clubs on Elegushi, we recommend booking at least 2-3 days in advance. Weekend slots fill up quickly, especially during the festive season (December in Lagos is next level!).",
      "If a hotspot doesn't respond on WhatsApp within a few hours, try their phone number (also listed on their Lagos Hotspot page) or check their Instagram for updates. Some smaller spots may have limited WhatsApp hours but respond faster on Instagram DMs."
    ],
  },
];

// ─── FAQ Items ───────────────────────────────────────────
export const faqItems: FAQItem[] = [
  {
    question: "What is Lagos Hotspot?",
    answer: "Lagos Hotspot is Lagos' premier hotspot discovery platform. We help you find the best restaurants, clubs, beaches, cultural centers, and more across Lagos State. Think of us as your personal guide to the pulse of Lagos.",
    category: "General",
  },
  {
    question: "Is Lagos Hotspot free to use?",
    answer: "Yes! Browsing and discovering hotspots on Lagos Hotspot is completely free. You can search, filter, and read reviews without creating an account. Sign up to save spots, write reviews, and get personalized recommendations.",
    category: "General",
  },
  {
    question: "How are vibe scores calculated?",
    answer: "Vibe scores (0-100) are calculated based on a combination of factors including review ratings, popularity, social media buzz, and how recently the spot has been active. A score above 80 means the spot is currently very hot and trending!",
    category: "Features",
  },
  {
    question: "Can I submit a new hotspot?",
    answer: "Absolutely! If you know a great spot in Lagos that's not on Lagos Hotspot yet, you can submit it through your dashboard. Our team will review the submission and add it to the platform within 24-48 hours.",
    category: "Features",
  },
  {
    question: "How do I contact a hotspot?",
    answer: "Each hotspot listing includes a WhatsApp button, phone number, and Instagram handle. The WhatsApp button is the fastest way to reach most spots for reservations, inquiries, or orders.",
    category: "Features",
  },
  {
    question: "Are the reviews on Lagos Hotspot verified?",
    answer: "We mark reviews as 'verified' when they come from users who have demonstrably visited the hotspot. This helps ensure the authenticity and reliability of reviews on our platform.",
    category: "Reviews",
  },
  {
    question: "What areas in Lagos does Lagos Hotspot cover?",
    answer: "We cover all major areas in Lagos State including Victoria Island, Ikoyi, Lekki, Yaba, Surulere, Ikeja, Lagos Island, Ajah, Apapa, and more. We're constantly expanding our coverage.",
    category: "General",
  },
  {
    question: "How do I report inaccurate information?",
    answer: "If you spot any inaccurate information on a hotspot listing, please use the 'Report' button on the listing page or contact us through the Help Center. We take accuracy seriously and will update listings promptly.",
    category: "Support",
  },
];

// ─── Pricing Plans ───────────────────────────────────────
export const pricingPlans = [
  {
    id: "free",
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Discover Lagos hotspots",
    features: [
      "Browse all hotspots",
      "Read reviews",
      "Search & filter",
      "Save up to 10 spots",
      "Basic area filters",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "scout",
    name: "Scout",
    price: "₦2,999",
    period: "/month",
    description: "For Lagos insiders",
    features: [
      "Everything in Explorer",
      "Unlimited saved spots",
      "Early access to new spots",
      "Personalized recommendations",
      "Trending alerts",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "ambassador",
    name: "Ambassador",
    price: "₦9,999",
    period: "/month",
    description: "For business owners",
    features: [
      "Everything in Scout",
      "List your business",
      "Analytics dashboard",
      "Featured placement",
      "Respond to reviews",
      "WhatsApp integration",
      "Custom branding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

// ─── Price level display helper ──────────────────────────
export const priceLevelLabel = (level: 1 | 2 | 3 | 4): string => {
  const labels: Record<number, string> = {
    1: "Budget-friendly",
    2: "Moderate",
    3: "Premium",
    4: "Luxury",
  };
  return labels[level];
};

export const priceLevelSymbol = (level: 1 | 2 | 3 | 4): string => {
  return "₦".repeat(level);
};

// ─── Dashboard Stats ─────────────────────────────────────
export interface DashboardStat {
  label: string;
  value: string;
  change?: string;
  icon: string;
}

export const dashboardStats: DashboardStat[] = [
  { label: "Saved Spots", value: "24", change: "+3 this week", icon: "Heart" },
  { label: "Reviews Written", value: "12", change: "+2 this week", icon: "Star" },
  { label: "Spots Visited", value: "38", change: "+5 this month", icon: "MapPin" },
  { label: "Vibe Contributions", value: "56", change: "+8 this month", icon: "Flame" },
];

// ─── Messages ────────────────────────────────────────────
export interface Message {
  id: string;
  sender: string;
  avatar: string;
  time: string;
  text: string;
  unread: number;
}

export const messages: Message[] = [
  {
    id: "1",
    sender: "Yellow Chilli",
    avatar: "YC",
    time: "2 hours ago",
    text: "Thank you for your review! We'd love to welcome you back for our weekend brunch.",
    unread: 1,
  },
  {
    id: "2",
    sender: "Bogobiri House",
    avatar: "BH",
    time: "1 day ago",
    text: "This Thursday's Afrobeat night features Femi Kuti's band! Limited tables available.",
    unread: 0,
  },
  {
    id: "3",
    sender: "Lagos Hotspot Team",
    avatar: "ES",
    time: "3 days ago",
    text: "Welcome to Lagos Hotspot! Start exploring Lagos' hottest spots and save your favorites.",
    unread: 0,
  },
];

// ─── Invoices ────────────────────────────────────────────
export interface Invoice {
  id: string;
  packageName: string;
  orderId: string;
  status: "Paid" | "Unpaid" | "On Hold";
  dueDate: string;
  amount: string;
}

export const invoices: Invoice[] = [
  { id: "1", packageName: "Ambassador Plan", orderId: "ES-2025-001", status: "Paid", dueDate: "Mar 15, 2025", amount: "₦9,999" },
  { id: "2", packageName: "Featured Placement", orderId: "ES-2025-002", status: "Unpaid", dueDate: "Mar 20, 2025", amount: "₦4,999" },
  { id: "3", packageName: "Scout Plan", orderId: "ES-2025-003", status: "Paid", dueDate: "Feb 15, 2025", amount: "₦2,999" },
];

// ─── Activities ──────────────────────────────────────────
export interface Activity {
  id: string;
  type: "review" | "save" | "visit" | "share";
  text: string;
  time: string;
}

export const recentActivities: Activity[] = [
  { id: "1", type: "review", text: "You reviewed Yellow Chilli", time: "2 hours ago" },
  { id: "2", type: "save", text: "You saved Bogobiri House", time: "5 hours ago" },
  { id: "3", type: "visit", text: "You visited Elegushi Beach", time: "1 day ago" },
  { id: "4", type: "share", text: "You shared Nok by Alara", time: "2 days ago" },
  { id: "5", type: "save", text: "You saved Sailors Lounge", time: "3 days ago" },
];
