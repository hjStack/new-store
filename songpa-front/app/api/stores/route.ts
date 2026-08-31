const STORE_API_URL =
  process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function storesUrl() {
  return new URL("/api/stores", STORE_API_URL).toString();
}

export async function GET() {
  try {
    const response = await fetch(storesUrl(), { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { message: "Store API request failed." },
        { status: 502 },
      );
    }

    const data: unknown = await response.json();

    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { message: "Store API is unreachable." },
      { status: 502 },
    );
  }
}
