import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const renovate = localFont({
  src: [
    { path: "./fonts/LTRenovate-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/LTRenovate-Italic.otf", weight: "400", style: "italic" },
    { path: "./fonts/LTRenovate-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/LTRenovate-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/LTRenovate-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/LTRenovate-ExtraBold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-renovate",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: "/" },
  category: "Landscape Architecture",
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={renovate.variable}>
      <body>{children}</body>
    </html>
  );
}
