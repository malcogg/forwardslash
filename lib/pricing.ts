/**
 * AI Chatbot pricing — page-based tiers, 1 or 2 years.
 *
 * < 50 pages:    $550 (1yr), $850 (2yr)
 * 50-200 pages:  $550 at 50, scales to 4× then −10% at 200 → $1980 max. Linear.
 * 200-500 pages: $1980 at 200, scales to $3200 at 500.
 * 500+:          Contact us
 */

export const TIER_LABELS = {
  under50: "< 50 pages",
  "50-200": "50–200 pages",
  "200-500": "200–500 pages",
  "500+": "500+ pages",
} as const;

export type TierKey = keyof typeof TIER_LABELS;

export function getTierFromPages(pages: number): TierKey | null {
  if (pages < 50) return "under50";
  if (pages < 200) return "50-200";
  if (pages < 500) return "200-500";
  return "500+";
}

export function getPriceFromPagesAndYears(pages: number, years: 1 | 2): number | null {
  if (pages >= 500) return null; // Contact us
  if (years !== 1 && years !== 2) return null;

  if (pages < 50) {
    return years === 1 ? 550 : 850;
  }

  if (pages < 200) {
    // $550 at 50, 4×550=2200 then −10% = $1980 at 200. Linear scale.
    const minPrice = 550;
    const maxPrice = 550 * 4 * 0.9; // 1980
    const t = (pages - 50) / (200 - 50);
    const price1yr = Math.round(minPrice + (maxPrice - minPrice) * t);
    return years === 1 ? price1yr : Math.round(price1yr * (850 / 550));
  }

  if (pages < 500) {
    // $1980 at 200, $3200 at 500. Linear. (proposed tier pricing)
    const minPrice = 1980;
    const maxPrice = 3200;
    const t = (pages - 200) / (500 - 200);
    const price1yr = Math.round(minPrice + (maxPrice - minPrice) * t);
    return years === 1 ? price1yr : Math.round(price1yr * (850 / 550));
  }

  return null;
}

export function getPriceForTier(
  pages: number,
  years: 1 | 2
): { price: number; tier: TierKey } | { price: null; tier: "500+"; contactUs: true } {
  const tier = getTierFromPages(pages);
  if (tier === "500+") {
    return { price: null, tier: "500+", contactUs: true };
  }
  const price = getPriceFromPagesAndYears(pages, years);
  return { price: price ?? 0, tier: tier! };
}
