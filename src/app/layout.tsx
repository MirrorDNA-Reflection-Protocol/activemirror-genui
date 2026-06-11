import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./active-mirror-site.css";
import "./active-mirror-redesign.css";
import "./active-mirror-genui.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://activemirror.ai"),
  title: {
    default: "Active Mirror - Reviewable AI Workspaces for Real Business Workflows",
    template: "%s | Active Mirror",
  },
  description: "Bring one workflow your current AI cannot safely finish. Active Mirror scopes it, builds a reviewable workspace, and keeps sources, approvals, and next actions visible.",
  keywords: [
    "generative UI",
    "AI workflow proof sprint",
    "reviewable AI workspace",
    "source-backed AI decision brief",
    "AI governance evidence trail",
    "private context AI workflow",
    "AI evidence workspace",
    "AI approval workflow",
    "AI workspace",
    "reviewable AI",
    "enterprise AI",
    "AI documents",
    "AI files",
    "AI work records",
    "AI review workflow",
    "sensitive data approval",
    "N1 Intelligence",
  ],
  openGraph: {
    title: "Active Mirror — Show the work.",
    description: "Bring one workflow your current AI cannot safely finish. Active Mirror scopes it, builds a reviewable workspace, and keeps sources, approvals, and next actions visible.",
    siteName: "Active Mirror",
    type: "website",
    url: "https://activemirror.ai",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Active Mirror - Show the work" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Mirror — Show the work.",
    description: "Bring one workflow your current AI cannot safely finish. Active Mirror scopes it, builds a reviewable workspace, and keeps sources, approvals, and next actions visible.",
    images: ["/og.png"],
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
      data-scroll-behavior="smooth"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
