import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/store";

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get("sport") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const query = request.nextUrl.searchParams.get("q") || undefined;
  const events = await listEvents({ sport, status, query });
  return NextResponse.json(
    { count: events.length, events, updatedAt: new Date().toISOString() },
    { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
