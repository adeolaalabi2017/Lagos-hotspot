"use client";

import React from "react";
import { useRouter } from "@/lib/router";
import { blogPosts } from "@/data/mock-data";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import PageHero from "@/components/layout/PageHero";

const blogFullContent: Record<string, string[]> = {
  "1": [
    "Lagos is a city of layers. Beyond the well-known spots on Victoria Island and Ikoyi lies a whole other Lagos — one that locals have been keeping to themselves for years. From hidden rooftop bars with panoramic views of the lagoon to underground art spaces in Yaba, there's a secret Lagos waiting to be discovered.",
    "Take Buki's Hidden Garden in Surulere, for example. Tucked behind an unassuming gate on Adeniran Ogunsanya Street, this rooftop bar offers craft cocktails and live jazz every Thursday. Most people walk past without a second glance, but those who know find one of the most intimate evening experiences in Lagos.",
    "In Yaba, the creative hub often called 'Yabacon Valley,' you'll find Artnery — a gallery and event space hidden inside what looks like an old warehouse. They host weekly art exhibitions, poetry slams, and live music that draws Lagos' creative crowd. The entrance is marked only by a small flame painted on the door — fitting for a city that runs on creative fire.",
    "For food lovers, Mama Ebo's Suya Spot in Agege is legendary among locals but virtually unknown to outsiders. Operating only after 8 PM from a makeshift grill on the roadside, Mama Ebo has been serving what many call the best suya in Lagos for over 15 years. No website, no Instagram — just word of mouth and the unmistakable aroma of perfectly spiced meat wafting through the neighborhood."
  ],
  "2": [
    "Lagos nightlife is unlike anything else in Africa. The city pulses with energy from dusk till dawn, and the options are as diverse as the city itself. Whether you're looking for upscale cocktails in Victoria Island or street parties in Surulere, Lagos has a spot for every vibe and every budget.",
    "Let's start with the upscale scene. Quilox on Ozumba Mbadiwe Avenue remains the king of Lagos nightlife — if you can get past the door. The dress code is strict, the drinks are expensive (expect to pay ₦15,000+ for a cocktail), and the crowd is Lagos' elite. But the experience? Absolutely unmatched. The DJ lineup features top international acts, and the sound system is world-class.",
    "For a more relaxed vibe, head to Sailors Lounge in Lekki. This waterfront bar offers stunning views of the lagoon, especially at sunset. The cocktails are creative, the music is Afrobeat-heavy, and the crowd is a mix of expats and young professionals. Pro tip: get there by 6 PM on weekends to secure a waterfront table.",
    "If you want the authentic Lagos party experience, you need to hit the streets. From the iconic Oba Akran street parties in Ikeja to the makeshift beach parties at Elegushi, the real Lagos nightlife happens where the people are. Just follow the music — you'll find it."
  ],
  "3": [
    "Lagos is blessed with some of West Africa's most beautiful coastline, and the beach scene here is thriving. From the popular Elegushi Beach to the secluded Tarkwa Bay, there's a beach for every mood — whether you want to party, relax, or catch some waves.",
    "Elegushi Beach is the most popular and accessible beach in Lagos. Located in Lekki, it's just a 20-minute drive from Victoria Island. The beach is lined with cabanas, bars, and food vendors. On weekends, it transforms into a party destination with live DJs and massive crowds. Entry is ₦1,000 per person, and cabanas start at ₦10,000.",
    "For a more secluded experience, take a boat to Tarkwa Bay. This island beach is only accessible by boat from Marina or Tarzan Jetty, which adds to its charm. The water is calmer here, making it perfect for swimming. There are a few local food shacks serving fresh fish and pepper soup, but no fancy facilities — and that's exactly the appeal.",
    "If you're looking for luxury, Oniru Private Beach offers a premium beach experience with resort-style amenities, including a pool, restaurant, and beachside cabanas. Entry is pricier (₦5,000-₦10,000 depending on the day), but the experience is more refined and the crowd is more curated."
  ],
  "4": [
    "Suya is more than just food in Lagos — it's a cultural institution. From the spicy, smoky aroma that fills the evening air to the communal experience of standing around the mai suya's grill, suya is woven into the fabric of Lagos life. But with suya spots on nearly every corner, which ones truly stand out?",
    "Our top pick is Mai Suya Atiko in Surulere. This spot has been operating for over 20 years and has perfected the art of Northern Nigerian grilling. The beef suya here is perfectly spiced — the yaji (spice mix) has just the right balance of heat, and the meat is always tender. A stick costs ₦1,500, and trust us, you'll want at least three.",
    "In Victoria Island, Suya Republic has brought the suya experience indoors with air conditioning and proper seating. While purists might scoff at the concept, the quality is undeniable. They offer unique variations like suya wraps, suya bowls, and even suya pizza. It's pricier (₦3,000-₦5,000 per serving) but worth it for the experience.",
    "For the authentic roadside experience, the suya spot near University of Lagos (UNILAG) gate is legendary. Students have been coming here for decades, and the mai suya knows most of his customers by name. It's cheap (₦500-₦1,000 per stick), delicious, and quintessentially Lagos."
  ],
  "5": [
    "Lagos is experiencing a cultural renaissance, and the city's art scene is at the heart of it. From world-class galleries in Ikoyi to grassroots creative spaces in Yaba, Lagos' art and culture scene is vibrant, diverse, and deeply rooted in the Nigerian experience.",
    "Freedom Park on Lagos Island is where it all began. Once a colonial-era prison, this space has been transformed into a cultural hub hosting art exhibitions, live music, theater performances, and the annual Lagos Festival of Poetry. The park itself is a work of art — the preserved prison cells now serve as gallery spaces, creating a powerful juxtaposition between past and present.",
    "Rele Gallery in Ikoyi has become the epicenter of contemporary Nigerian art. Founded by Adenrele Sonariwo, the gallery represents some of Nigeria's most exciting young artists and has hosted exhibitions that have drawn international attention. Their quarterly exhibitions are must-attend events for Lagos' art crowd.",
    "For a more immersive experience, visit the Nike Art Gallery in Lekki. With five floors of Nigerian art, it's the largest gallery in West Africa. Owner Nike Davies-Okundaye has spent decades preserving and promoting Nigerian textile arts, and the gallery features everything from traditional Adire fabric to contemporary paintings."
  ],
  "6": [
    "Think you need to spend big to enjoy Lagos? Think again. One of the best things about this city is that some of its most memorable experiences cost next to nothing. Here are 20 amazing things to do in Lagos for under ₦5,000 — proof that the best things in life are (almost) free.",
    "Start with a visit to Freedom Park (₦1,000 entry). This former colonial prison turned cultural center is one of the most atmospheric spots in Lagos. Browse the art installations, enjoy the gardens, and soak in the history. On weekends, there's often live music or poetry readings included in the entry fee.",
    "Take a canoe ride through Makoko (₦500-₦1,000). This floating community on the Lagos Lagoon is one of the most unique neighborhoods in the world. Local guides offer canoe tours that take you through the waterways, giving you a glimpse into life on the water. It's an eye-opening experience that you won't find in any guidebook.",
    "Visit the Lekki Conservation Centre (₦2,000 entry). Walk the longest canopy walkway in Africa, spot monkeys and tropical birds, and enjoy the peace and quiet of nature in the middle of Lagos. It's a perfect escape from the city's hustle and a great spot for photography."
  ],
};

export default function BlogDetailPage() {
  const { navigate, params } = useRouter();
  const postId = params.postId;
  const post = blogPosts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div>
        <PageHero title="Post Not Found" subtitle="The blog post you're looking for doesn't exist." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Button variant="outline" onClick={() => navigate("blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const fullContent = blogFullContent[post.id] || [post.excerpt];
  const relatedPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div>
      <PageHero
        title=""
        subtitle=""
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("blog")}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <div className="mb-8">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {post.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{post.author}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-xl overflow-hidden mb-8">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          )}
        </div>

        {/* Article Content */}
        <article className="prose prose-gray max-w-none">
          {fullContent.map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
              {paragraph}
            </p>
          ))}
        </article>

        <Separator className="my-10" />

        {/* Related Posts */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <Card
                key={relPost.id}
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                onClick={() => navigate("blog-detail", { postId: relPost.id })}
              >
                <div className="h-40 overflow-hidden">
                  {relPost.image && (
                    <img
                      src={relPost.image}
                      alt={relPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <CardContent className="pt-4">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {relPost.category}
                  </Badge>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {relPost.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {relPost.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{relPost.author}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{relPost.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
