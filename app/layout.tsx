import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const fallbackOrigin = "https://alt-txt-living-field.sleiman757321.chatgpt.site";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : fallbackOrigin;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: "Alt-TXT — Better ways of working",
    description:
      "Alt-TXT is an intelligence lab that removes bad assumptions, finds leverage, and redesigns how companies work.",
    applicationName: "Alt-TXT",
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
    },
    keywords: ["Alt-TXT", "intelligence lab", "business systems", "AI", "automation"],
    openGraph: {
      title: "Alt-TXT — Better ways of working",
      description: "We don’t sell AI. We sell better ways of working.",
      type: "website",
      siteName: "Alt-TXT",
      images: [
        {
          url: socialImage,
          width: 1693,
          height: 929,
          alt: "We sell AI, corrected to: We sell better ways of working.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Alt-TXT — Better ways of working",
      description: "We don’t sell AI. We sell better ways of working.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
