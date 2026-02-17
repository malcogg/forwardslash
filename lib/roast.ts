/**
 * Website roast — detect old-school tech signals from HTML.
 * Light-hearted, never mean. Used to hook users before signup.
 */

export type RoastResult = {
  ageScore: number;
  reasons: string[];
  roastLevel: string;
  roastEmoji: string;
};

const ROAST_LEVELS: { min: number; level: string; emoji: string }[] = [
  { min: 80, level: "Grandpa site – it's seen some things... let's bring it into 2026!", emoji: "👴" },
  { min: 50, level: "Stuck in the 2010s – time for a glow-up", emoji: "😂" },
  { min: 30, level: "A bit retro – could use some fresh energy", emoji: "✨" },
  { min: 0, level: "Looking pretty decent already – nice foundation!", emoji: "👍" },
];

export function estimateSiteAgeTech(html: string): RoastResult {
  const signals: { ageScore: number; reasons: string[] } = {
    ageScore: 0,
    reasons: [],
  };

  const lower = html.toLowerCase();

  // Classic old-school CMS
  if (lower.includes("wp-content") || lower.includes("wordpress.org")) {
    signals.ageScore += 40;
    signals.reasons.push("WordPress (classic vibes)");
  }
  if (lower.includes("joomla") || lower.includes("drupal-7")) {
    signals.ageScore += 50;
    signals.reasons.push("Joomla or older Drupal");
  }

  // Old site builders
  if (lower.includes('generator" content="wix') || lower.includes('generator" content="weebly')) {
    signals.ageScore += 30;
    signals.reasons.push("Wix/Weebly classic builder");
  }

  // Old copyright years
  const oldCopyright = html.match(/©\s*(19\d{2}|200\d)/);
  if (oldCopyright) {
    signals.ageScore += 25;
    signals.reasons.push(`Copyright ${oldCopyright[0]} – hasn't been updated in a while`);
  }

  // No HTTPS signals in content
  if (!lower.includes("https://") && html.length < 5000) {
    signals.ageScore += 20;
    signals.reasons.push("Mixed or non-HTTPS");
  }

  // No modern frameworks
  if (
    !lower.includes("react") &&
    !lower.includes("vue") &&
    !lower.includes("next") &&
    !lower.includes("angular")
  ) {
    signals.ageScore += 20;
    signals.reasons.push("No modern JS framework detected");
  }

  // Table layouts (very old)
  if (lower.includes("<table") && lower.includes("layout")) {
    signals.ageScore += 35;
    signals.reasons.push("Table-based layout (classic 90s energy)");
  }

  // Marquee / blink (ancient)
  if (lower.includes("<marquee") || lower.includes("<blink")) {
    signals.ageScore += 40;
    signals.reasons.push("Marquee or blink tags – peak 2002");
  }

  // Generic fallback if we found nothing
  if (signals.reasons.length === 0) {
    signals.reasons.push("Standard site setup");
  }

  const level = ROAST_LEVELS.find((r) => signals.ageScore >= r.min) ?? ROAST_LEVELS[ROAST_LEVELS.length - 1];
  return {
    ageScore: Math.min(signals.ageScore, 100),
    reasons: signals.reasons,
    roastLevel: level.level,
    roastEmoji: level.emoji,
  };
}
