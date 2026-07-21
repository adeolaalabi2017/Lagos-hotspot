import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = "1344x768" } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const supportedSizes = [
      "1024x1024",
      "768x1344",
      "864x1152",
      "1344x768",
      "1152x864",
      "1440x720",
      "720x1440",
    ];

    if (!supportedSizes.includes(size)) {
      return NextResponse.json(
        { error: `Unsupported size. Use one of: ${supportedSizes.join(", ")}` },
        { status: 400 }
      );
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const enhancedPrompt = `Professional business listing photo: ${prompt}. High quality, well-lit, modern aesthetic, suitable for a business directory website.`;

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: size,
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${imageBase64}`,
      prompt: enhancedPrompt,
      size,
    });
  } catch (error) {
    console.error("Image generation API error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
