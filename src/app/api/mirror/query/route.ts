import { NextResponse } from "next/server";

const retiredResponse = () =>
  NextResponse.json(
    {
      error: "Legacy route retired.",
      next: "Use /api/mirror/stream for public generated workspaces.",
    },
    { status: 410 }
  );

export async function GET() {
  return retiredResponse();
}

export async function POST() {
  return retiredResponse();
}
