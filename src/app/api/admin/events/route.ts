import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { deleteEvent, listEvents, upsertEvent } from "@/lib/store";
import type { SportsEvent } from "@/lib/types";
import { slugify } from "@/lib/utils";

const eventSchema = z.object({
  id: z.string().optional(),
  home: z.string().min(1),
  away: z.string().min(1),
  sport: z.string().min(1),
  league: z.string().min(1),
  startsAt: z.string().min(1),
  status: z.enum(["live", "upcoming", "finished"]),
  venue: z.string().optional(),
  country: z.string().optional(),
  importance: z.coerce.number().min(0).max(100),
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
  excludedFromLive: z.boolean().optional(),
  homeLogo: z.string().optional(),
  awayLogo: z.string().optional(),
});

async function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function GET() {
  if (!(await isAuthenticated())) return unauthorized();
  return NextResponse.json({ events: await listEvents({ includeHidden: true, includeFinished: true }) });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorized();
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los campos del evento." }, { status: 400 });
  const input = parsed.data;
  const id = input.id || `manual-${Date.now()}`;
  const event: SportsEvent = {
    id,
    slug: `${slugify(input.home)}-vs-${slugify(input.away)}-${id}`,
    sport: input.sport,
    sportSlug: slugify(input.sport),
    league: input.league,
    leagueSlug: slugify(input.league),
    home: { name: input.home, slug: slugify(input.home), logo: input.homeLogo || undefined },
    away: { name: input.away, slug: slugify(input.away), logo: input.awayLogo || undefined },
    startsAt: new Date(input.startsAt).toISOString(),
    status: input.status,
    venue: input.venue,
    country: input.country,
    importance: input.importance,
    featured: input.featured,
    hidden: input.hidden,
    excludedFromLive: input.excludedFromLive,
    source: "manual",
    updatedAt: new Date().toISOString(),
  };
  await upsertEvent(event);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ event });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) return unauthorized();
  const body = (await request.json().catch(() => null)) as SportsEvent | null;
  if (!body?.id) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  body.updatedAt = new Date().toISOString();
  await upsertEvent(body);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/partido/${body.slug}`);
  return NextResponse.json({ event: body });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return unauthorized();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el ID." }, { status: 400 });
  await deleteEvent(id);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
