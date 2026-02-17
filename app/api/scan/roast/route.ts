import { NextResponse } from "next/server";
import { estimateSiteAgeTech } from "@/lib/roast";
import { sanitizeWebsiteUrl, isValidUrl } from "@/lib/validation";

const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * POST /api/scan/roast
 * Lightweight homepage fetch + roast analysis. No Firecrawl credits.
 * Used in scan modal before signup.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawUrl = (body as { url?: string }).url;
    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const url = sanitizeWebsiteUrl(rawUrl);
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    if (!isValidUrl(normalized)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(normalized, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch site", fallback: true },
        { status: 200 }
      );
    }

    const html = await res.text();
    if (!html || html.length < 50) {
      return NextResponse.json(
        { error: "Empty or minimal response", fallback: true },
        { status: 200 }
      );
    }

    const result = estimateSiteAgeTech(html);
    return NextResponse.json({
      ...result,
      url: normalized.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out", fallback: true },
        { status: 200 }
      );
    }
    console.warn("Roast fetch error:", e);
    return NextResponse.json(
      { error: "Could not analyze site", fallback: true },
      { status: 200 }
    );
  }
}
