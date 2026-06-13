import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "AIndia Check",
      short_name: "AIndia",
      description: "Pehle check karo: voice and photo AI checks for messages, payments, forms, and screenshots in your language.",
      start_url: "/aindia",
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      orientation: "portrait-primary",
      categories: ["utilities", "productivity", "education"],
      icons: [
        {
          src: "/favicon.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "/mirror-icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/mirror-icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      shortcuts: [
        {
          name: "Press to speak",
          short_name: "Speak",
          description: "Open AIndia voice input",
          url: "/aindia?mode=voice",
          icons: [{ src: "/mirror-icon-192.png", sizes: "192x192" }],
        },
        {
          name: "Send a photo",
          short_name: "Photo",
          description: "Open AIndia photo helper",
          url: "/aindia?mode=photo",
          icons: [{ src: "/mirror-icon-192.png", sizes: "192x192" }],
        },
        {
          name: "Check a message",
          short_name: "Check",
          description: "Open AIndia safety check",
          url: "/aindia?mode=message",
          icons: [{ src: "/mirror-icon-192.png", sizes: "192x192" }],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
