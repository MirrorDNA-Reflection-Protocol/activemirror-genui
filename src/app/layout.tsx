import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Active Mirror — AI That Builds What You Ask For",
  description: "Ask for a document, get a document. Ask for research, get a research surface. Ask for a chart, get live data. Active Mirror generates governed AI interfaces on demand.",
  keywords: [
    "generative UI",
    "AI workspace",
    "governed AI",
    "enterprise AI",
    "AI documents",
    "AI governance",
    "interactive AI",
    "N1 Intelligence",
  ],
  openGraph: {
    title: "Active Mirror — AI That Builds What You Ask For",
    description: "Documents, graphs, charts, and research surfaces materialize on demand. Governed. Sovereign. Instant.",
    siteName: "Active Mirror",
    type: "website",
    url: "https://activemirror.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Mirror — AI That Builds What You Ask For",
    description: "Documents, graphs, charts, and research surfaces materialize on demand.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Active Mirror",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://activemirror.ai" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
