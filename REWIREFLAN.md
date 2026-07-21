# 🇳🇬 Rewire Plan: Nigerian Instagram Vendor Trust & Discovery Platform

> **Mission:** Repurpose ListingHub into a trust & discovery platform for Nigerian vendors/small businesses on Instagram — where buyers find **verified, reviewed** vendors and vendors build **credible** online presence beyond Instagram.

---

## 1. Brand Identity

| Element | Current | New |
|---------|---------|-----|
| **Name** | ListingHub | **NaijaVerify** |
| **Tagline** | "Business Directory & Listing Template" | **"Trusted Vendors. Verified Reviews. Naija Style."** |
| **Primary Color** | Orange (`oklch(0.637 0.237 25.331)`) | **Nigerian Deep Green** (`oklch(0.52 0.17 155)`) |
| **Currency** | USD ($) | **Naira (₦)** |
| **Market** | Global/Generic | **Nigerian Instagram vendors** |

### Color Palette Change

| Token | Current | New |
|-------|---------|-----|
| Primary | Orange-600 (`oklch(0.637 0.237 25.331)`) | **Deep Green** (`oklch(0.52 0.17 155)`) |
| Primary Foreground | White | White (unchanged) |
| Accent/Hover | Orange-700 | **Deep Green darker** (`oklch(0.45 0.17 155)`) |
| CTA Secondary | Amber/Gold | **Gold accent** (`oklch(0.75 0.15 85)`) — keeps warm Nigerian gold |
| Status Open | Emerald | Emerald (unchanged) |
| Status Closed | Red | Red (unchanged) |
| Verification Badge | N/A | **Gold/Amber** (`oklch(0.78 0.15 80)`) — distinct from primary |

> **Rationale:** Nigerian flag green + gold accent creates a distinctly Nigerian visual identity while maintaining the warm, approachable feel.

---

## 2. User Flow Rewire Map

### Current Flow → New Flow

```
CURRENT (Generic Directory)                    NEW (Nigerian Vendor Trust Platform)
─────────────────────────────                  ─────────────────────────────────────
Home Page                                      Home Page
├── "Explore Dream Places"                     ├── "Find Trusted Nigerian Vendors"
├── Search: Location + Category                ├── Search: What/Who + City + Category
├── Categories: Generic (12)                   ├── Categories: Nigerian-relevant (12)
├── "Popular Listings in Chicago"              ├── "Top Verified Vendors in Lagos"
├── How It Works: Demo→Package→Account         ├── How It Works: Search→Verify→Connect
├── Pricing: $0/$19/$29/$79                    ├── Pricing: ₦0/₦5K/₦12K/₦30K
├── Reviews: Generic names                     ├── Reviews: Nigerian names + verified buyer tags
├── CTA: "Add Listing"                         ├── CTA: "List Your Business"
└── Blog: Generic articles                     └── Blog: Nigerian vendor tips & stories

Grid Listings → Discover Vendors
├── Filters: Category, Rating, Price, Distance ├── Filters: Category, Trust Score, City, Verified Only
├── Sort: Default/Rated/Reviewed/Newest/Price  ├── Sort: Default/Most Trusted/Most Reviewed/Newest
├── Cards: Open/Closed, Featured, $$$          ├── Cards: Verified ✓, Trust Score ⭐, ₦₦₦, IG Handle
└── Bookmark heart                             └── Save vendor + Quick WhatsApp button

Single Listing → Vendor Profile
├── Gallery: Generic photos                    ├── Gallery: Product/service photos
├── About section                              ├── About + "Why Trust This Vendor"
├── Features & Amenities                       ├── Trust Signals: Verified, Reviews, Response Rate
├── Business Hours                             ├── Business Hours + "Usually responds in 2hrs"
├── Contact: Phone, Email, Website             ├── Contact: WhatsApp ⭐, Phone, Instagram ↗
├── "Book Now" button                          ├── "Chat on WhatsApp" button (primary CTA)
├── "Send Message" → coming soon               ├── "Send Message" → internal messaging
├── Social: FB/Twitter/IG/LinkedIn             ├── Social: Instagram ↗ (primary), Twitter, Facebook
└── Reviews section                            └── Reviews + "Verified Buyer" badges

Dashboard → Vendor Dashboard
├── "Hello, Shreethemes"                       ├── "Hello, [Nigerian Name]"
├── Stats: Listings/Views/Saved/Reviews        ├── Stats: Profile Views/Trust Score/Reviews/Messages
├── Activities: Generic                        ├── Activities: "New review from Adaora O."
├── Messages: Generic                          ├── Messages: Buyer inquiries
├── Invoices: $ amounts                        ├── Invoices: ₦ amounts

My Profile → Business Profile
├── Personal info form                         ├── Business info + Instagram handle + WhatsApp number
├── Social links                               ├── Social links (IG primary) + Verification documents
└── "Premium Member" badge                     └── "Verified Vendor" badge + Trust Level

My Bookings → Customer Orders
├── Booking cards with dates                   ├── Order inquiries from buyers
├── Tabs: All/Active/Completed/Cancelled       ├── Tabs: All/Pending/Completed/Declined
└── View Details / Cancel                      └── View / Respond / Mark Delivered

My Listings → My Products/Services
├── Listing cards with status                  ├── Product/service cards with status
├── Edit/Delete                                ├── Edit/Delete/Toggle Visibility
└── "Add New Listing"                          └── "Add Product/Service"

Bookmarks → Saved Vendors
├── Saved listings grid                        ├── Saved vendors grid
└── Remove / View                              └── Remove / View Profile / Message

Messages → Buyer Messages
├── Chat interface                             ├── Same chat interface (works for buyer-vendor)
└── Contact list                               └── Contact list with order context

Reviews → My Reviews
├── Rating summary + distribution              ├── Same + "Verified Purchase" tags
├── Reply to reviews                           ├── Reply to reviews
└── Generic names                              └── Nigerian names

Wallet → Earnings (₦)
├── Balance in $                               ├── Balance in ₦
├── Transactions                               ├── Transactions (₦)
└── Payment methods: Visa/Chase                └── Payment methods: Nigerian bank/Paystack

Add Listing → Add Product/Service
├── General Info → Title/Desc/Category/Tags    ├── Business Info → Product Name/Desc/Category/Tags
├── Location → Address/City/Country/Zip        ├── Location → Address/City/State (Nigerian states)
├── Media → Image upload                       ├── Media → Product photos (same)
├── Details → Price/Amenities/Hours            ├── Details → Price range (₦)/Features/Hours
└── Contact → Phone/Email/Website              └── Contact → WhatsApp/Phone/Instagram handle
```

---

## 3. Page-by-Page Rewire Details

### 3.1 Home Page

**Hero Section:**
- Headline: **"Find Trusted Nigerian Vendors"**
- Subheadline: "Discover verified businesses on Instagram. Read real reviews. Shop with confidence."
- Search: "Search vendors, products, or services..." + City dropdown (Lagos, Abuja, Port Harcourt, etc.) + Category dropdown
- Tabs: Fashion, Beauty, Food, Tech, Events, Services

**Categories Section (12 Nigerian-relevant):**
| # | Category | Icon | Nigerian Context |
|---|----------|------|-----------------|
| 1 | Fashion & Style | Sparkles | Ankara, Agbada, Ready-to-wear |
| 2 | Skincare & Beauty | Heart | Organic skincare, cosmetics |
| 3 | Hair & Wigs | Users | Human hair, braiding, wigs |
| 4 | Food & Catering | UtensilsCrossed | Meal prep, small chops, cakes |
| 5 | Tech & Gadgets | Code | Phones, laptops, accessories |
| 6 | Events & Planning | CalendarDays | Wedding planners, decorators |
| 7 | Artisan Crafts | Wrench | Leatherwork, beadwork |
| 8 | Home & Decor | Building2 | Furniture, interior decor |
| 9 | Photography | Camera | Wedding, portrait, event photography |
| 10 | Fitness & Wellness | Dumbbell | Gym, yoga, supplements |
| 11 | Auto Dealers | Car | Cars, parts, maintenance |
| 12 | Education | GraduationCap | Tutoring, courses, skills |

**Popular Vendors Section:**
- Heading: "Top Verified Vendors in Lagos"
- Each card shows: ✅ Verified badge, Trust Score (4.5/5), IG handle (@adas_fashion), Category badge, Location (Lagos, Nigeria)

**How It Works:**
- Step 1: **"Search & Discover"** — Find vendors by category, city, or product
- Step 2: **"Verify Trust"** — Check reviews, ratings, and verification status
- Step 3: **"Connect & Buy"** — Chat via WhatsApp or message directly

**Pricing (Naira):**
| Plan | Price | Features |
|------|-------|----------|
| Free | ₦0 | 3 Products, Basic Profile, 30-day availability |
| Starter | ₦5,000/mo | 10 Products, Verified Badge, Instagram Link, Full Support |
| Business | ₦12,000/mo | 25 Products, Trust Score Badge, Priority Listing, Analytics, Support |
| Premium | ₦30,000/mo | Unlimited Products, Featured Placement, Dedicated Support, Analytics |

**Reviews Section:**
- All Nigerian names (Adaora, Chidi, Fatima, Emeka, Zainab, Olumide)
- Reviews reference Nigerian businesses
- "Verified Buyer" tag on each review

**CTA:**
- "List Your Business" → dashboard-add-listing
- "Browse Vendors" → grid-listings

**Blog:**
- "5 Tips to Spot Fake Vendors on Instagram"
- "How to Build Trust as a Nigerian Online Seller"
- "Top 10 Lagos Vendors You Should Know in 2025"

---

### 3.2 Discover Vendors (Grid Listings)

**Page Hero:**
- Title: "Discover Vendors"
- Subtitle: "Find verified Nigerian businesses you can trust"

**Filter Sidebar:**
- **Categories** → Nigerian categories (match home page 12)
- **Trust Score** → Radio: All, 3+, 4+, 4.5+, 5 Stars
- **Location** → Checkboxes: Lagos, Abuja, Port Harcourt, Ibadan, Benin City, Kaduna, Enugu, Others
- **Verified Only** → Toggle switch
- **Price Range** → Slider ₦0–₦500,000

**Vendor Cards:**
- ✅ Verified badge (gold shield icon)
- Trust Score: ⭐ 4.5 (23 reviews)
- Instagram handle: @vendor_name
- Category badge
- Location: Lagos, Nigeria
- Price indicator: ₦₦ or ₦₦₦
- Quick WhatsApp button
- Save/Bookmark heart

**Sort Options:**
- Default, Most Trusted, Most Reviewed, Newest, Price Low–High

---

### 3.3 Vendor Profile (Single Listing)

**Top Section:**
- ✅ Verified Vendor badge (prominent)
- Trust Score: Large ⭐ 4.5 with visual indicator
- Instagram handle: @vendor_name with "Follow on Instagram ↗" link
- WhatsApp: "Chat on WhatsApp" as PRIMARY CTA button (green)
- Secondary: "Send Message" (internal)

**Trust Signals Sidebar (replaces Contact sidebar):**
- ✅ Verified Vendor
- ⭐ Trust Score: 4.5/5
- 📊 Response Rate: 92%
- ⏱️ Avg Response Time: 2 hours
- 📦 Delivery Track Record: 98% on time
- 🏆 Member Since: Jan 2024

**Gallery:** Product/service photos

**About:** Vendor story, what they sell, why trust them

**Features:** Product categories, payment methods (Paystack, Bank Transfer, POS), delivery zones

**Business Hours:** Nigerian timezone (WAT)

**Reviews:** With "Verified Buyer" badges prominently displayed

---

### 3.4 Vendor Dashboard

**Dashboard Home:**
- Welcome: "Hello, [Vendor Name]"
- Stats: Profile Views, Trust Score, Total Reviews, Active Products
- Recent Activity: "Adaora left a 5-star review", "New message from Chidi", "Your listing was approved"
- Messages preview
- Recent earnings (₦)

**Business Profile (was My Profile):**
- Business name, owner name, email, phone
- **Instagram Handle** (with follower count)
- **WhatsApp Number** (primary contact)
- Business category, description
- Verification status & documents upload area
- Social links (IG primary)

**Customer Orders (was My Bookings):**
- Order inquiries from buyers
- Tabs: All / Pending / Completed / Declined
- Actions: Respond, Mark Delivered, Decline

**My Products (was My Listings):**
- Product/service cards
- Tabs: All / Active / Pending / Expired
- Edit, Delete, Toggle Visibility

**Saved Vendors (was Bookmarks):**
- Same concept — vendors the user has saved/bookmarked

**Messages:**
- Same chat interface — buyer ↔ vendor messaging

**Reviews:**
- Rating summary + individual reviews
- "Verified Purchase" badges
- Reply functionality

**Earnings (was Wallet):**
- Balance in ₦
- Nigerian payment methods: Bank Account (GTBank, Access, etc.), Paystack
- Transactions in ₦

**Add Product/Service (was Add Listing):**
- Product Name, Description, Category, Tags
- Location: Nigerian states dropdown
- Product photos
- Price range in ₦
- Features/delivery info
- Contact: WhatsApp number, Phone, Instagram handle

---

## 3.5 Auth Pages

**Login:**
- "Sign in to NaijaVerify"
- Email + Password
- "Sign in with Google" option

**Register:**
- Two paths: "I'm a Buyer" / "I'm a Vendor"
- Vendor registration includes: Business name, Instagram handle, WhatsApp number

**Forgot Password / 2FA:**
- Same structure, branded with NaijaVerify

---

## 3.6 Other Pages

| Page | Changes |
|------|---------|
| **About Us** | Mission: Building trust in Nigerian online commerce. Team: Nigerian names. Story: Why we started NaijaVerify. |
| **Blog** | Nigerian vendor stories, tips, industry insights. Nigerian authors. |
| **Contact Us** | Nigerian address (Lagos), Nigerian phone, @naijaverify.com email |
| **Pricing** | ₦ plans as detailed above. "Most Trusted" badge on Business plan. |
| **Privacy Policy** | NDPR (Nigeria Data Protection Regulation) compliant language |
| **Help Center** | Nigerian-context FAQs, vendor guides, buyer guides |
| **FAQ** | Nigeria-specific: "How do I get verified?", "What payment methods are supported?", "How does the trust score work?" |
| **Author Profile** | → "Vendor Profile" (public view) — shows trust score, reviews, products |
| **Booking Page** | → "Order/Inquiry Page" — contact vendor about a product |
| **Coming Soon** | Same structure, NaijaVerify branding |
| **Error 404** | Same structure, NaijaVerify branding |

---

## 4. Mock Data Rewrite (Nigerian Context)

### Categories
```typescript
{ id: "1", name: "Fashion & Style", icon: "Sparkles", count: 245, color: "bg-green-100 text-green-700" }
{ id: "2", name: "Skincare & Beauty", icon: "Heart", count: 189, color: "bg-pink-100 text-pink-600" }
{ id: "3", name: "Hair & Wigs", icon: "Users", count: 156, color: "bg-purple-100 text-purple-600" }
{ id: "4", name: "Food & Catering", icon: "UtensilsCrossed", count: 134, color: "bg-amber-100 text-amber-700" }
{ id: "5", name: "Tech & Gadgets", icon: "Code", count: 98, color: "bg-blue-100 text-blue-600" }
{ id: "6", name: "Events & Planning", icon: "CalendarDays", count: 87, color: "bg-rose-100 text-rose-600" }
{ id: "7", name: "Artisan Crafts", icon: "Wrench", count: 76, color: "bg-orange-100 text-orange-600" }
{ id: "8", name: "Home & Decor", icon: "Building2", count: 112, color: "bg-teal-100 text-teal-600" }
{ id: "9", name: "Photography", icon: "Camera", count: 67, color: "bg-indigo-100 text-indigo-600" }
{ id: "10", name: "Fitness & Wellness", icon: "Dumbbell", count: 54, color: "bg-lime-100 text-lime-600" }
{ id: "11", name: "Auto Dealers", icon: "Car", count: 43, color: "bg-slate-100 text-slate-600" }
{ id: "12", name: "Education", icon: "GraduationCap", count: 89, color: "bg-cyan-100 text-cyan-600" }
```

### Listings/Vendors
```typescript
{ id: "1", title: "Ada's Fashion House", description: "Premium Ankara styles...", category: "Fashion & Style",
  price: "₦15,000 - ₦80,000", priceSign: "₦₦₦", image: "[Nigerian fashion image]",
  rating: 4.8, reviews: 156, location: "Victoria Island", city: "Lagos", country: "Nigeria",
  phone: "+234 801 234 5678", isFeatured: true, isOpen: true, instagramHandle: "@adas_fashion",
  isVerified: true, trustScore: 4.8, responseRate: "95%", responseTime: "1hr" }
```

### Nigerian Names for Reviews/Users
- Adaora Okafor, Chidi Nwankwo, Fatima Abdullahi, Emeka Obi, Zainab Bello, Olumide Adeyemi
- Ngozi Eze, Tunde Bakare, Aisha Mohammed, Kayode Fashola, Blessing Okoro, Ibrahim Garba

### Nigerian Cities
- Lagos, Abuja, Port Harcourt, Ibadan, Benin City, Kaduna, Enugu, Kano, Abeokuta, Calabar

### Pricing in Naira
```typescript
{ name: "Free", price: "₦0", period: "", features: ["3 Products", "Basic Profile", "30 Days Availability"] }
{ name: "Starter", price: "₦5,000", period: "/monthly", features: ["10 Products", "Verified Badge", "Instagram Link", "Full Support"] }
{ name: "Business", price: "₦12,000", period: "/monthly", features: ["25 Products", "Trust Score Badge", "Priority Listing", "Analytics", "Full Support"], isPopular: true }
{ name: "Premium", price: "₦30,000", period: "/monthly", features: ["Unlimited Products", "Featured Placement", "Dedicated Support", "Advanced Analytics", "Priority Verification"] }
```

---

## 5. Flow Improvements (Fixing Current Issues)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Category click from home doesn't pass param | Pass `category` param to grid-listings and auto-filter |
| 2 | Bookmark state not synced | Keep local for now (mock), but unify data source |
| 3 | Pricing buttons not wired | Wire "Get Started" → register page |
| 4 | Add Listing form no submission | Wire to toast "Product submitted for review" |
| 5 | Edit listing doesn't pre-fill | Keep as-is for now (would need real backend) |
| 6 | Bookmarks "View" missing ID | Fix to pass correct vendor ID |
| 7 | Filter categories inconsistent | Unify all categories to single Nigerian set |
| 8 | Shopping cart icon meaningless | Replace with "Saved Vendors" heart icon → bookmarks |
| 9 | Hero tabs are visual only | Wire tabs to filter grid-listings by category |
| 10 | "Book Now" → booking page | Change to "Chat on WhatsApp" or "Send Inquiry" |

---

## 6. Visual & Component Changes Summary

| Component | Change |
|-----------|--------|
| `globals.css` | Primary color → Nigerian deep green; all primary tokens updated |
| `Navbar.tsx` | Logo → "NaijaVerify" with green L; Cart → Saved icon; "Add Listing" → "List Business" |
| `Footer.tsx` | NaijaVerify branding; Nigerian address; Nigerian categories; NDPR link |
| `HomePage.tsx` | All sections rewired per §3.1 |
| `GridListingsPage.tsx` | → Discover Vendors; filters rewired; vendor cards |
| `SingleListingPage.tsx` | → Vendor Profile; trust signals; WhatsApp CTA |
| `DashboardHome.tsx` | Nigerian stats; Nigerian activities |
| `DashboardProfile.tsx` | → Business Profile; IG handle; WhatsApp; verification |
| `DashboardBookings.tsx` | → Customer Orders; Nigerian context |
| `DashboardListings.tsx` | → My Products; Nigerian context |
| `DashboardBookmarks.tsx` | → Saved Vendors |
| `DashboardMessages.tsx` | Same (buyer-vendor chat) |
| `DashboardReviews.tsx` | Nigerian names; Verified Buyer tags |
| `DashboardWallet.tsx` | → Earnings; ₦ currency; Nigerian banks |
| `DashboardAddListing.tsx` | → Add Product; Nigerian states; ₦; IG handle |
| `DashboardSidebar.tsx` | Renamed menu items; NaijaVerify branding |
| `PageHero.tsx` | Green gradient instead of orange |
| `mock-data.ts` | Complete rewrite with Nigerian data |
| All page components | NaijaVerify branding, Nigerian context |
| `layout.tsx` | Title → "NaijaVerify - Trusted Nigerian Vendors Directory" |
| Hero background image | Nigerian marketplace/city scene |

---

## 7. Implementation Order

| Phase | Tasks | Estimated Changes |
|-------|-------|------------------|
| **Phase 1: Brand & Color** | Update globals.css palette to green; update logo text; update layout.tsx title | 3 files |
| **Phase 2: Data Layer** | Rewrite mock-data.ts with Nigerian names, businesses, cities, ₦ pricing | 1 file |
| **Phase 3: Hero & Home** | Update hero image (generate Nigerian scene); rewrite all home sections | 1 file + 1 image |
| **Phase 4: Core Pages** | Update GridListings → Discover Vendors; SingleListing → Vendor Profile | 2 files |
| **Phase 5: Dashboard** | Update all 9 dashboard pages with Nigerian context | 9 files |
| **Phase 6: Layout Components** | Update Navbar, Footer, Sidebar, PageHero with NaijaVerify branding | 4 files |
| **Phase 7: Other Pages** | Update auth pages, content pages (About, Blog, Contact, etc.) | ~15 files |
| **Phase 8: Flow Fixes** | Fix category param passing, wire CTAs, fix bookmark navigation | Multiple files |
| **Phase 9: Verification** | Full browser test of all 28 routes | Testing |

---

## 8. Key Design Decisions for Review

| # | Decision | Options | Recommendation |
|---|----------|---------|---------------|
| 1 | **Brand name** | NaijaVerify / VendorNG / TrustMarket NG / NaijaVendor | **NaijaVerify** — emphasizes trust/verification, uniquely Nigerian |
| 2 | **Primary CTA** | "Chat on WhatsApp" / "Send Message" / "Book Now" | **"Chat on WhatsApp"** — primary for Nigeria; "Send Message" as secondary |
| 3 | **Trust Score display** | Number only / Badge + Number / Tier system (Bronze/Silver/Gold) | **Badge + Number** — simple but clear |
| 4 | **Verification badge** | Checkmark / Shield / Star | **Shield with checkmark** ✅ — conveys security/trust |
| 5 | **Shopping cart icon** | Remove / Replace with saved vendors / Keep | **Replace with "Saved" heart icon** — more relevant to directory |
| 6 | **Image generation** | Generate new Nigerian images / Use Unsplash Nigeria stock | **Generate AI images** — more cohesive and controlled |
| 7 | **Wallet payment methods** | Nigerian banks only / Add Paystack + Bank / Keep generic | **Paystack + Nigerian banks (GTBank, Access, First Bank)** |

---

**Awaiting your approval to proceed with implementation.**
