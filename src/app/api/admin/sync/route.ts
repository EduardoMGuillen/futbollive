import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { readStore, writeStore } from "@/lib/store";
import { fetchSportsDbEvents } from "@/lib/thesportsdb";

async function authorized(request: Request) {
  const bearer = request.headers.get("authorization");
  return (await isAuthenticated()) || (process.env.CRON_SECRET && bearer === `Bearer ${process.env.CRON_SECRET}`);
}

async function synchronize(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const incoming = await fetchSportsDbEvents();
    const data = await readStore();
    const existing = new Map(data.events.map((event) => [event.id, event]));
    for (const event of incoming) {
      const current = existing.get(event.id);
      existing.set(event.id, current ? {
        ...event,
        featured: current.featured ?? event.featured,
        hidden: current.hidden,
        excludedFromLive: current.excludedFromLive,
        importance: current.importance ?? event.importance,
      } : event);
    }
    data.events = Array.from(existing.values());
    data.settings.lastSync = new Date().toISOString();
    await writeStore(data);
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/partido/[slug]", "page");
    return NextResponse.json({ ok: true, imported: incoming.length, total: data.events.length, lastSync: data.settings.lastSync });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "La sincronización falló." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  return synchronize(request);
}

export async function GET(request: Request) {
  return synchronize(request);
}
