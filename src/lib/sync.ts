import { fetchEspnEvents, fetchEspnLiveUpdate } from "./espn";
import { readStore, writeStore } from "./store";
import { fetchSportsDbEvents } from "./thesportsdb";
import type { SportsEvent } from "./types";
import { eventDurationMs } from "./utils";

export async function runSync() {
  const [espnResult, sportsDbResult] = await Promise.allSettled([fetchEspnEvents(), fetchSportsDbEvents()]);
  const espnEvents = espnResult.status === "fulfilled" ? espnResult.value : [];
  const sportsDbEvents = sportsDbResult.status === "fulfilled" ? sportsDbResult.value : [];

  // ESPN is the primary free source; TheSportsDB complements with events
  // (and lineups) that ESPN does not cover for the same matchup.
  const incoming: SportsEvent[] = [...espnEvents];
  const matchupKey = (event: SportsEvent) =>
    `${event.home.slug}|${event.away.slug}|${event.startsAt.slice(0, 10)}`;
  const seenMatchups = new Set(espnEvents.map(matchupKey));
  for (const event of sportsDbEvents) {
    if (!seenMatchups.has(matchupKey(event))) {
      seenMatchups.add(matchupKey(event));
      incoming.push(event);
    }
  }
  if (!incoming.length) throw new Error("Ninguna fuente devolvió eventos.");

  const data = await readStore();
  const existing = new Map(data.events.map((event) => [event.id, event]));
  for (const event of incoming) {
    const current = existing.get(event.id);
    existing.set(event.id, current ? {
      ...event,
      featured: current.featured ?? event.featured,
      hidden: current.hidden,
      excludedFromLive: current.excludedFromLive,
      homeLineup: event.homeLineup?.length ? event.homeLineup : current.homeLineup,
      awayLineup: event.awayLineup?.length ? event.awayLineup : current.awayLineup,
      broadcasts: event.broadcasts?.length ? event.broadcasts : current.broadcasts,
    } : event);
  }
  const merged = Array.from(existing.values());
  // Once real data exists, demo events disappear and old finished events are pruned.
  const hasRealData = merged.some((event) => event.source === "espn" || event.source === "thesportsdb");
  const now = Date.now();
  data.events = merged.filter((event) => {
    if (hasRealData && event.source === "demo") return false;
    if (event.status === "finished" && event.source !== "manual") {
      // Keep major tournaments (Mundial, Euro, Copa América) longer for SEO pages.
      const keepMs = event.importance >= 97 ? 21 * 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;
      if (now - new Date(event.startsAt).getTime() > keepMs) return false;
    }
    return true;
  });
  data.settings.lastSync = new Date().toISOString();
  await writeStore(data);
  return { imported: incoming.length, total: data.events.length, lastSync: data.settings.lastSync };
}

let inflight: Promise<unknown> | null = null;

export async function ensureFreshEvents(maxAgeMinutes = 10) {
  const data = await readStore();
  const last = data.settings.lastSync ? new Date(data.settings.lastSync).getTime() : 0;
  const stale = Date.now() - last > maxAgeMinutes * 60 * 1000;
  const onlyDemo = data.events.every((event) => event.source === "demo" || event.source === "manual");
  if (!stale && !onlyDemo) return;
  if (!inflight) {
    inflight = runSync().catch(() => null).finally(() => { inflight = null; });
  }
  await inflight;
}

export async function updateLiveEvents() {
  const data = await readStore();
  const now = Date.now();
  const candidates = data.events.filter((event) => {
    if (event.source !== "espn" || event.status === "finished") return false;
    const start = new Date(event.startsAt).getTime();
    return event.status === "live" || (start >= now - eventDurationMs(event) && start <= now + 30 * 60 * 1000);
  });
  const updates = (await Promise.all(candidates.map(fetchEspnLiveUpdate))).filter(
    (update): update is NonNullable<typeof update> => Boolean(update),
  );
  if (!updates.length) return { checked: candidates.length, updated: 0, events: [] };

  const byId = new Map(updates.map((update) => [update.id, update]));
  data.events = data.events.map((event) => {
    const update = byId.get(event.id);
    if (!update) return event;
    return {
      ...event,
      status: update.status,
      minute: update.minute,
      home: { ...event.home, score: update.homeScore },
      away: { ...event.away, score: update.awayScore },
      participants: update.participants?.length ? update.participants : event.participants,
      broadcasts: update.broadcasts?.length ? update.broadcasts : event.broadcasts,
      updatedAt: update.updatedAt,
    };
  });
  await writeStore(data);
  return { checked: candidates.length, updated: updates.length, events: updates };
}

let liveInflight: ReturnType<typeof updateLiveEvents> | null = null;

export function updateLiveEventsOnce() {
  if (!liveInflight) {
    liveInflight = updateLiveEvents().finally(() => {
      liveInflight = null;
    });
  }
  return liveInflight;
}
