import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Sans, Newsreader, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fallbackOrigin = "https://alt-txt.com";

const siteName = "Alt-TXT";
const defaultTitle = "Alt-TXT | Redesigning how work gets done";
const defaultDescription =
  "Alt-TXT is an intelligence lab that redesigns how companies work: finding leverage, protecting judgment, and building systems where AI is the tool, not the pitch.";
const ogDescription =
  "We redesign how work gets done. AI is today’s best tool, not the pitch.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e8e6e1",
  colorScheme: "light",
};

const display = IBM_Plex_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

async function resolveOrigin() {
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

  if (!host) return fallbackOrigin;

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return fallbackOrigin;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = await resolveOrigin();
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    applicationName: siteName,
    authors: [{ name: siteName, url: fallbackOrigin }],
    creator: siteName,
    publisher: siteName,
    category: "business",
    keywords: [
      "Alt-TXT",
      "intelligence lab",
      "ways of working",
      "AI agents",
      "business transformation",
      "human judgment",
      "operations",
    ],
    alternates: {
      canonical: "/",
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
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: defaultTitle,
      description: ogDescription,
      type: "website",
      locale: "en_US",
      url: origin,
      siteName,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "Alt-TXT proof sheet: We redesign how work gets done.",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: ogDescription,
      images: [
        {
          url: socialImage,
          alt: "Alt-TXT proof sheet: We redesign how work gets done.",
        },
      ],
    },
  };
}

function JsonLd({ origin }: { origin: string }) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${fallbackOrigin}/#organization`,
        name: siteName,
        alternateName: "ALT—TXT",
        url: fallbackOrigin,
        email: "hello@alt-txt.com",
        description: defaultDescription,
        logo: `${fallbackOrigin}/apple-touch-icon.png`,
        sameAs: ["https://krekib.com", "https://cejour.la"],
        contactPoint: [
          {
            "@type": "ContactPoint",
            email: "hello@alt-txt.com",
            contactType: "sales",
            availableLanguage: ["English"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${fallbackOrigin}/#website`,
        url: fallbackOrigin,
        name: siteName,
        description: ogDescription,
        publisher: { "@id": `${fallbackOrigin}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${origin}/#webpage`,
        url: origin,
        name: defaultTitle,
        isPartOf: { "@id": `${fallbackOrigin}/#website` },
        about: { "@id": `${fallbackOrigin}/#organization` },
        description: defaultDescription,
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const origin = await resolveOrigin();

  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd origin={origin} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
