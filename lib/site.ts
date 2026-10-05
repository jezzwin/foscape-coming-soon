const fallbackUrl = "https://foscape.com";

const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? fallbackUrl
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : fallbackUrl);

export const siteConfig = {
  name: "Foscape",
  domain: "FOSCAPE.COM",
  url: rawUrl.replace(/\/$/, ""),
  title: "Foscape — Coming Soon",
  tagline: "Where water meets living.",
  description:
    "Foscape is coming soon. Premium koi ponds, aquascapes and water-led landscape environments. Where water meets living.",
  keywords: [
    "Foscape",
    "koi pond design",
    "aquascape",
    "water feature design",
    "landscape architecture",
    "premium koi ponds",
    "aquatic landscaping",
    "Aqua55",
  ],
  locale: "en_US",
  themeColor: "#021523",
} as const;

export type BackgroundMode = "video" | "image";

/**
 * Edit `mode` to switch the backdrop between the koi film and the still pond.
 * Source-level only — there is no public UI for this.
 */
export const backgroundConfig = {
  mode: "video" as BackgroundMode,
};
