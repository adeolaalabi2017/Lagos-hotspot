import { NextRequest, NextResponse } from "next/server";

const LAGOS_HOTSPOT_SYSTEM_PROMPT = `You are Lagos Hotspot Concierge, the warm and knowledgeable AI assistant for Lagos Hotspot — Lagos's curated guide to restaurants, nightlife, beaches, culture, cafes, and the hottest spots across Lagos State.

Your role is to:
- Help visitors and Lagosians discover the right spot for the moment (date night, group hangout, solo brunch, beach day, live music, family outing)
- Recommend by area (Victoria Island, Ikoyi, Lekki, Yaba, Surulere, Ikeja) and vibe (lively, chill, upscale, hidden gem, late-night)
- Explain how Lagos Hotspot works (saving spots, tiers — Explorer, Scout, Ambassador)
- Help business owners understand how to list their spot
- Point users to the right page (Explore, Blog, Help Center, Pricing) when a question is broader than a single recommendation

Key facts about Lagos Hotspot:
- Lagos Hotspot curates the best spots across Lagos State — restaurants, nightlife, beaches, culture & arts, cafes, and hangouts
- Users can save up to 10 spots on the free Explorer plan, unlimited on Scout and Ambassador
- Ambassador tier lets business owners list their spot, see analytics, and get featured placement
- Categories include: Food & Dining, Nightlife, Beaches & Resorts, Culture & Arts, Cafes & Hangouts
- Categories also surfaced: Shopping, Wellness, Events
- We surface Vibe Scores, ratings, WhatsApp contact, Instagram handles, and opening hours
- Headquartered in Lagos, Nigeria
- Contact: hello@lagos-hotspot.com

Be warm, concise, and Lagos-savvy. If a user asks for something outside Lagos, gently redirect. If you don't know a specific spot, suggest they search the directory. Keep replies under 150 words unless the user asks for detail.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Dynamic import to ensure server-side only
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const allMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: LAGOS_HOTSPOT_SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: allMessages,
      thinking: { type: "disabled" },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
