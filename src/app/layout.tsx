import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./active-mirror-site.css";
import "./active-mirror-genui.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://activemirror.ai"),
  title: {
    default: "Active Mirror - Reflective Work OS",
    template: "%s | Active Mirror",
  },
  description: "Active Mirror reflects the request, builds the workspace, and keeps proof, permissions, memory, and next actions visible.",
  keywords: [
    "generative UI",
    "GenUI browser OS",
    "generated work OS",
    "AI browser",
    "AI workspace",
    "AI operating system",
    "governed AI",
    "enterprise AI",
    "AI documents",
    "AI files",
    "browser automation",
    "computer use",
    "MirrorSeed",
    "AI vault",
    "AI governance",
    "interactive AI",
    "N1 Intelligence",
  ],
  openGraph: {
    title: "Active Mirror - Reflective Work OS",
    description: "Active Mirror reflects the request, builds the workspace, and keeps proof, permissions, memory, and next actions visible.",
    siteName: "Active Mirror",
    type: "website",
    url: "https://activemirror.ai",
    images: [{ url: "/mirror-icon-512.png", width: 512, height: 512, alt: "Active Mirror" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Mirror - Reflective Work OS",
    description: "Active Mirror reflects the request, builds the workspace, and keeps proof, permissions, memory, and next actions visible.",
    images: ["/mirror-icon-512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Active Mirror",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://activemirror.ai" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090d12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
