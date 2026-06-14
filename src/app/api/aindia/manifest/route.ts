import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "AIndia Answers",
      short_name: "AIndia",
      description:
        "Poocho kuch bhi: voice, photo, or message answers with source, safety checks, local-first routing, and one next step in your language.",
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
          name: "Ask by voice",
          short_name: "Speak",
          description: "Ask AIndia by voice through the reflective turn",
          url: "/aindia?mode=voice",
          icons: [{ src: "/mirror-icon-192.png", sizes: "192x192" }],
        },
        {
          name: "Send a photo",
          short_name: "Photo",
          description: "Ask about a form, bill, notice, or screenshot with source and safety rails",
          url: "/aindia?mode=photo",
          icons: [{ src: "/mirror-icon-192.png", sizes: "192x192" }],
        },
        {
          name: "Ask about a message",
          short_name: "Message",
          description: "Understand a message, source it, and slow down risky action",
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
