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
  title: "Active Mirror — Governed AI Interface",
  description:
    "Don't just chat with AI. Control what it shows, remembers, proves, and does. Active Mirror gives every AI action a memory boundary, authority boundary, proof trail, and approval path.",
  keywords: [
    "governed AI",
    "AI governance",
    "generative UI",
    "MirrorGate",
    "enterprise AI",
    "AI compliance",
  ],
  openGraph: {
    title: "Active Mirror — Governed AI Interface",
    description:
      "Active Mirror does not only generate answers. It generates controlled surfaces for action.",
    siteName: "Active Mirror",
    type: "website",
  },
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
