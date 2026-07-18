import { NextResponse } from "next/server";
import { updateLiveEventsOnce } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await updateLiveEventsOnce();
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron actualizar los marcadores.", events: [] },
      { status: 502, headers: { "cache-control": "no-store, max-age=0" } },
    );
  }
}
