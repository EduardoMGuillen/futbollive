import { fetchEspnEvents, fetchEspnLiveUpdate } from "./espn";
import {
  fetchPandaScoreEvents,
  fetchPandaScoreMatchById,
  pandaScoreIdFromSlug,
  updatePandaScoreLiveEvents,
} from "./pandascore";
import { getEvent, readStore, upsertEvent, writeStore } from "./store";
import { fetchSportsDbEvents } from "./thesportsdb";
import type { SportsEvent } from "./types";
import { eventDurationMs } from "./utils";

export async function runSync() {
  const [espnResult, sportsDbResult, pandaResult] = await Promise.allSettled([
    fetchEspnEvents(),
    fetchSportsDbEvents(),
    fetchPandaScoreEvents(),
  ]);
  const espnEvents = espnResult.status === "fulfilled" ? espnResult.value : [];
  const sportsDbEvents = sportsDbResult.status === "fulfilled" ? sportsDbResult.value : [];
  const pandaEvents = pandaResult.status === "fulfilled" ? pandaResult.value : [];

  // ESPN is the primary free source; TheSportsDB complements with events
  // (and lineups) that ESPN does not cover for the same matchup.
  // PandaScore owns esports exclusively, so it never collides with the others.
  const incoming: SportsEvent[] = [...espnEvents, ...pandaEvents];
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
  const nowMs = Date.now();
  for (const event of incoming) {
    const current = existing.get(event.id);
    // El scoreboard puede venir de caché (hasta 15 min); si el actualizador en
    // vivo tocó el evento hace poco, su marcador es más fresco y debe ganar.
    const keepLiveFields =
      current &&
      (current.status === "live" || current.status === "finished") &&
      event.status !== "finished" &&
      nowMs - new Date(current.updatedAt).getTime() < 5 * 60 * 1000;
    existing.set(event.id, current ? {
      ...event,
      ...(keepLiveFields ? {
        status: current.status,
        minute: current.minute,
        home: { ...event.home, score: current.home.score ?? event.home.score },
        away: { ...event.away, score: current.away.score ?? event.away.score },
        updatedAt: current.updatedAt,
      } : {}),
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
  const hasRealData = merged.some(
    (event) => event.source === "espn" || event.source === "thesportsdb" || event.source === "pandascore",
  );
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

function liveCandidates(events: SportsEvent[], now = Date.now()) {
  return events.filter((event) => {
    if ((event.source !== "espn" && event.source !== "pandascore") || event.status === "finished") return false;
    const start = new Date(event.startsAt).getTime();
    return event.status === "live" || (start >= now - eventDurationMs(event) && start <= now + 30 * 60 * 1000);
  });
}

export async function updateLiveEvents() {
  const data = await readStore();
  const candidates = liveCandidates(data.events);
  const espnCandidates = candidates.filter((event) => event.source === "espn");
  const pandaCandidates = candidates.filter((event) => event.source === "pandascore");
  const [espnUpdatesRaw, pandaUpdates] = await Promise.all([
    Promise.all(espnCandidates.map(fetchEspnLiveUpdate)),
    updatePandaScoreLiveEvents(pandaCandidates),
  ]);
  const updates = [
    ...espnUpdatesRaw.filter((update): update is NonNullable<typeof update> => Boolean(update)),
    ...pandaUpdates,
  ];
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

let lastLiveCheck = 0;

/**
 * Refresca marcadores en vivo durante el render del servidor cuando los datos
 * del store están viejos. Necesario en serverless sin base de datos compartida:
 * las actualizaciones hechas por /api/live en otra instancia no llegan aquí.
 */
export async function ensureLiveScores(maxAgeSeconds = 60) {
  const now = Date.now();
  if (now - lastLiveCheck < maxAgeSeconds * 1000) return;
  const data = await readStore();
  const candidates = liveCandidates(data.events, now);
  if (!candidates.length) return;
  const stalest = Math.min(...candidates.map((event) => new Date(event.updatedAt).getTime()));
  if (now - stalest < maxAgeSeconds * 1000) return;
  lastLiveCheck = now;
  await updateLiveEventsOnce().catch(() => null);
}

/**
 * Resuelve un evento por slug para páginas de detalle.
 * En serverless sin store compartido, los partidos de PandaScore (LoL, Valorant, CS2)
 * pueden aparecer en /esports pero faltar en la instancia que sirve /partido/[slug].
 */
export async function resolveEvent(slug: string) {
  const existing = await getEvent(slug);
  if (existing) return existing;

  const matchId = pandaScoreIdFromSlug(slug);
  if (matchId) {
    const fetched = await fetchPandaScoreMatchById(matchId);
    if (fetched) {
      // Conserva el slug de la URL para que los enlaces del listado sigan funcionando.
      const event = { ...fetched, slug };
      await upsertEvent(event);
      return event;
    }
  }

  await ensureFreshEvents();
  return getEvent(slug);
}
