import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const num = Math.min(parseInt(searchParams.get("num") || "10"), 20);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const results = await zai.functions.invoke("web_search", {
      query,
      num,
    });

    const formattedResults = results.map(
      (r: { name: string; snippet: string; url: string; host_name: string; date: string; favicon: string }) => ({
        title: r.name,
        snippet: r.snippet,
        url: r.url,
        source: r.host_name,
        date: r.date,
        favicon: r.favicon,
      })
    );

    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
    });
  } catch (error) {
    console.error("Web search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform web search" },
      { status: 500 }
    );
  }
}
