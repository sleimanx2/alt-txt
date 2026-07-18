import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alt-TXT — Better ways of working",
  description:
    "Alt-TXT is an intelligence lab that finds leverage, redesigns how companies work, and builds systems around measurable outcomes.",
  applicationName: "Alt-TXT",
  keywords: ["Alt-TXT", "intelligence lab", "business systems", "AI", "automation"],
  openGraph: {
    title: "Alt-TXT — Better ways of working",
    description: "We don’t sell AI. We sell better ways of working.",
    type: "website",
    siteName: "Alt-TXT",
  },
  twitter: {
    card: "summary",
    title: "Alt-TXT — Better ways of working",
    description: "We don’t sell AI. We sell better ways of working.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
