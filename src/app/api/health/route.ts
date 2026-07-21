import { readStore } from "@/lib/store";

export const dynamic = "force-static";
export const revalidate = 60;

/** Lightweight probe for uptime checks (AdSense, monitoring). No sync or external APIs. */
export async function GET() {
  const data = await readStore();
  const eventCount = data.events.filter((e) => !e.hidden).length;
  return Response.json(
    {
      ok: true,
      events: eventCount,
      lastSync: data.settings.lastSync ?? null,
    },
    {
      headers: {
        "cache-control": "public, max-age=60",
      },
    },
  );
}
