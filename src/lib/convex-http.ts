const baseUrl = (process.env.NEXT_PUBLIC_CONVEX_URL || "").replace(/\/$/, "");

export async function convexFetch<T = unknown>(
  path: string,
  args: Record<string, unknown>
): Promise<T | null> {
  const [modulePath, functionName] = path.split(":");
  const url = `${baseUrl}/api/function`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: functionName,
      args,
      format: "json",
    }),
  });

  if (!res.ok) {
    throw new Error(`Convex error: ${res.status}`);
  }

  const data = await res.json();
  return data?.value ?? null;
}
