import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spotName, area = "Lagos" } = body;

    if (!spotName || typeof spotName !== "string") {
      return NextResponse.json(
        { error: "Spot name is required" },
        { status: 400 }
      );
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const searchQuery = `${spotName} ${area} Lagos Nigeria review experience vibe`;
    const searchResults = await zai.functions.invoke("web_search", {
      query: searchQuery,
      num: 8,
    });

    const searchContext = searchResults
      .slice(0, 6)
      .map(
        (r: { name: string; snippet: string; url: string; host_name: string }, i: number) =>
          `${i + 1}. ${r.name}\n   ${r.snippet}\n   Source: ${r.host_name}`
      )
      .join("\n\n");

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a spot reputation analyst for Lagos Hotspot, a Lagos hotspot discovery platform. Analyze web search results about a Lagos spot and provide a short reputation snapshot. Be objective. Format your response as a structured summary with: 1) A buzz score (0-100), 2) Key highlights (positive signals), 3) Watch-outs (negative signals), 4) Best for (the kind of outing the spot suits). Keep it concise but informative. Do not invent facts that are not supported by the search results.",
        },
        {
          role: "user",
          content: `Summarize public reputation for this Lagos spot: "${spotName}" in ${area}\n\nSearch Results:\n${searchContext}\n\nProvide a reputation snapshot.`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const analysis = completion.choices[0]?.message?.content;

    return NextResponse.json({
      spotName,
      area,
      searchResults: searchResults.slice(0, 6).map(
        (r: { name: string; snippet: string; url: string; host_name: string; date: string }) => ({
          title: r.name,
          snippet: r.snippet,
          url: r.url,
          source: r.host_name,
          date: r.date,
        })
      ),
      analysis,
    });
  } catch (error) {
    console.error("Spot reputation API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze spot reputation" },
      { status: 500 }
    );
  }
}
