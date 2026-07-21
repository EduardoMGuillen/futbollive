import { readStore } from "@/lib/store";

export const dynamic = "force-static";
export const revalidate = 60;

const DEFAULT_TZ = "America/Mexico_City";

function syncMeta(iso: string | null | undefined) {
  const timezone = process.env.SITE_TIMEZONE?.trim() || DEFAULT_TZ;
  if (!iso) {
    return {
      lastSync: null,
      lastSyncUtc: null,
      lastSyncLocal: null,
      timezone,
      minutesSinceSync: null,
      syncStale: true,
    };
  }
  const minutesSinceSync = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  const lastSyncLocal = new Intl.DateTimeFormat("es-MX", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
  return {
    lastSync: iso,
    lastSyncUtc: iso,
    lastSyncLocal: `${lastSyncLocal} (${timezone})`,
    timezone,
    minutesSinceSync,
    syncStale: minutesSinceSync > 90,
  };
}

/** Lightweight probe for uptime checks (AdSense, monitoring). No sync or external APIs. */
export async function GET() {
  const data = await readStore();
  const eventCount = data.events.filter((e) => !e.hidden).length;
  return Response.json(
    {
      ok: true,
      events: eventCount,
      ...syncMeta(data.settings.lastSync),
    },
    {
      headers: {
        "cache-control": "public, max-age=60",
      },
    },
  );
}
