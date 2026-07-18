import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getSeedData } from "./seed";
import type { SportsEvent, StoreData } from "./types";
import { eventDurationMs, isPubliclyVisible } from "./utils";

const dataPath = path.join(process.cwd(), "data", "store.json");
let memoryStore: StoreData | null = null;

function refreshTemporalStatuses(data: StoreData) {
  const now = Date.now();
  const banners = [...(data.banners || [])];
  const defaults = [
    { id: "top-1", title: "Tu marca puede estar aquí", label: "PUBLICIDAD", position: "top" as const, active: true },
    { id: "feed-1", title: "Espacio premium disponible", label: "PATROCINADO", position: "feed" as const, active: true },
    { id: "sidebar-1", title: "Conecta con fans del deporte", label: "PUBLICIDAD", position: "sidebar" as const, active: true },
    { id: "detail-1", title: "Patrocina este encuentro", label: "PATROCINADO", position: "detail" as const, active: true },
    { id: "footer-1", title: "Tu marca frente a fans reales", label: "PUBLICIDAD", position: "footer" as const, active: true },
  ];
  for (const banner of defaults) {
    if (!banners.some((item) => item.position === banner.position)) banners.push(banner);
  }
  return {
    ...data,
    banners,
    events: data.events.map((event) => {
      if (event.status === "finished") return event;
      // A fresh ESPN status is authoritative (important for delayed starts).
      const sourceAge = now - new Date(event.updatedAt).getTime();
      if (event.source === "espn" && sourceAge < 2 * 60 * 1000) return event;
      const elapsed = now - new Date(event.startsAt).getTime();
      if (elapsed >= eventDurationMs(event)) return { ...event, status: "finished" as const, minute: undefined };
      if (elapsed >= 0) return { ...event, status: "live" as const, minute: event.minute || "EN VIVO" };
      return { ...event, status: "upcoming" as const, minute: undefined };
    }),
  };
}

function database() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function readStore(): Promise<StoreData> {
  const db = database();
  if (db) {
    const { data, error } = await db.from("site_state").select("data").eq("id", "main").maybeSingle();
    if (!error && data?.data) {
      memoryStore = refreshTemporalStatuses(data.data as StoreData);
      return structuredClone(memoryStore);
    }
  }
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    memoryStore = refreshTemporalStatuses(parsed);
    return structuredClone(memoryStore);
  } catch {
    if (!memoryStore) memoryStore = getSeedData();
    return structuredClone(refreshTemporalStatuses(memoryStore));
  }
}

export async function writeStore(data: StoreData): Promise<StoreData> {
  memoryStore = structuredClone(data);
  const db = database();
  if (db) {
    const { error } = await db.from("site_state").upsert({
      id: "main",
      data,
      updated_at: new Date().toISOString(),
    });
    if (!error) return data;
  }
  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    const temporary = `${dataPath}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(temporary, dataPath);
  } catch {
    // Serverless filesystems can be read-only; memory keeps the current instance functional.
  }
  return data;
}

export async function listEvents(options?: {
  sport?: string;
  status?: string;
  query?: string;
  includeHidden?: boolean;
  includeFinished?: boolean;
}) {
  const { events } = await readStore();
  const query = options?.query?.trim().toLocaleLowerCase("es");
  return events
    .filter((event) => options?.includeHidden || !event.hidden)
    .filter((event) => options?.includeFinished || isPubliclyVisible(event))
    .filter((event) => !options?.sport || event.sportSlug === options.sport)
    .filter((event) => !options?.status || event.status === options.status)
    .filter(
      (event) =>
        !query ||
        [event.eventName, event.home.name, event.away.name, event.league, event.sport].some((value) =>
          value &&
          value.toLocaleLowerCase("es").includes(query),
        ),
    )
    .sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
}

export async function getEvent(slug: string) {
  const { events } = await readStore();
  return events.find((event) => event.slug === slug && !event.hidden);
}

export async function upsertEvent(event: SportsEvent) {
  const data = await readStore();
  const index = data.events.findIndex((item) => item.id === event.id);
  if (index >= 0) data.events[index] = event;
  else data.events.unshift(event);
  await writeStore(data);
  return event;
}

export async function deleteEvent(id: string) {
  const data = await readStore();
  data.events = data.events.filter((event) => event.id !== id);
  await writeStore(data);
}
