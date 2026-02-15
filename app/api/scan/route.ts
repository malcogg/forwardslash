import { NextResponse } from "next/server";
import Firecrawl from "@mendable/firecrawl-js";

const CATEGORY_PATTERNS: { label: string; patterns: RegExp[] }[] = [
  { label: "Products", patterns: [/\/product/i, /\/shop/i, /\/store/i, /\/p\//, /\/item/i, /\/catalog/i] },
  { label: "Blog", patterns: [/\/blog/i, /\/post/i, /\/article/i, /\/news/i, /\/journal/i] },
  { label: "Landing pages", patterns: [/\/landing/i, /\/lp\//, /\/offer/i, /\/campaign/i] },
  { label: "Services", patterns: [/\/service/i, /\/pricing/i, /\/plans/i, /\/solutions/i] },
  { label: "About/Contact", patterns: [/\/about/i, /\/contact/i, /\/team/i, /\/faq/i, /\/help/i] },
];

function categorizeUrl(url: string): string {
  const path = new URL(url).pathname.toLowerCase();
  for (const { label, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some((p) => p.test(path))) return label;
  }
  return "Other";
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const normalized = url.replace(/\/$/, "").replace(/^(?!https?:\/\/)/, "https://");
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Scan service not configured. Set FIRECRAWL_API_KEY." },
        { status: 503 }
      );
    }

    const firecrawl = new Firecrawl({ apiKey });

    const crawl = await firecrawl.crawl(normalized, {
      limit: 500,
      scrapeOptions: { formats: ["markdown"] },
    });

    if (!crawl.success || !crawl.data) {
      return NextResponse.json(
        { error: "Scan failed. Please check the URL and try again." },
        { status: 500 }
      );
    }

    const pages = crawl.data;
    const pageCount = pages.length;

    const categoryCounts = new Map<string, number>();
    categoryCounts.set("Products", 0);
    categoryCounts.set("Blog", 0);
    categoryCounts.set("Landing pages", 0);
    categoryCounts.set("Services", 0);
    categoryCounts.set("About/Contact", 0);
    categoryCounts.set("Other", 0);

    for (const page of pages) {
      const source = (page as { metadata?: { sourceURL?: string } }).metadata?.sourceURL;
      const u = source || "";
      const cat = categorizeUrl(u);
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }

    const categories = Array.from(categoryCounts.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

    if (categories.length === 0) {
      categories.push({ label: "Pages", count: pageCount });
    }

    return NextResponse.json({
      pageCount,
      categories,
      url: normalized.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json(
      { error: "Scan failed. Please try again." },
      { status: 500 }
    );
  }
}
