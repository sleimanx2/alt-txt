import type { Metadata } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Sans, Newsreader, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const fallbackOrigin = "https://alt-txt.com";

const display = IBM_Plex_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : host?.includes("localhost")
        ? "http"
        : "https";

  let origin = fallbackOrigin;
  if (host) {
    try {
      origin = new URL(`${protocol}://${host}`).origin;
    } catch {
      // Keep a stable canonical origin when a proxy sends a malformed host.
    }
  }

  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: "Alt-TXT — Better ways of working",
    description:
      "Alt-TXT is an intelligence lab that removes bad assumptions, finds leverage, and redesigns how companies work.",
    applicationName: "Alt-TXT",
    openGraph: {
      title: "Alt-TXT — Better ways of working",
      description: "We don’t sell AI. We sell better ways of working.",
      type: "website",
      siteName: "Alt-TXT",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
