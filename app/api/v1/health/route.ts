import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "flash-one",
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    note: "No secrets. Detailed admin health requires an authenticated admin session in the admin UI.",
  });
}
