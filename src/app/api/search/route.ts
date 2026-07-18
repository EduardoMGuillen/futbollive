import { NextRequest, NextResponse } from "next/server";
import { isIndividualSport } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { eventTitle, isPubliclyVisible } from "@/lib/utils";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function score(label: string, query: string) {
  const value = normalize(label);
  const q = normalize(query);
  if (value === q) return 100;
  if (value.startsWith(q)) return 85;
  if (value.includes(q)) return 70;
  const words = q.split(/\s+/);
  return words.reduce((total, word) => total + (value.includes(word) ? 15 : 0), 0);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2) return NextResponse.json({ results: [] });
  const data = await readStore();
  const events = data.events.filter((event) => !event.hidden && isPubliclyVisible(event));
  const statusLabel = (status: string) => status === "live" ? "En vivo" : status === "finished" ? "Finalizado" : "Próximo";
  const people = new Map<string, { slug: string; name: string; logo?: string; individual: boolean }>();
  for (const event of events) {
    const individual = isIndividualSport(event);
    const list = event.participants?.length ? event.participants : [event.home, event.away];
    for (const person of list) {
      if (!people.has(person.slug)) {
        people.set(person.slug, {
          slug: person.slug,
          name: person.name,
          logo: person.logo,
          individual,
        });
      }
    }
  }
  const candidates = [
    ...events.map((event) => ({
      id: event.id,
      title: eventTitle(event),
      subtitle: `${event.league} · ${statusLabel(event.status)}`,
      startsAt: event.startsAt,
      href: `/partido/${event.slug}`,
      image: event.home.logo,
      type: "Evento" as const,
      score:
        score(`${eventTitle(event)} ${event.home.name} ${event.away.name} ${event.league}`, query) +
        (event.status === "live" ? 12 : event.status === "upcoming" ? 8 : 2),
    })),
    ...Array.from(people.values()).map((person) => ({
      id: person.slug,
      title: person.name,
      subtitle: person.individual ? "Atleta o piloto" : "Equipo o selección",
      href: person.individual ? `/atleta/${person.slug}` : `/equipo/${person.slug}`,
      image: person.logo,
      type: (person.individual ? "Atleta" : "Equipo") as "Atleta" | "Equipo",
      score: score(person.name, query),
    })),
    ...Array.from(new Map(events.map((event) => [event.leagueSlug, { slug: event.leagueSlug, name: event.league, sport: event.sport }])).values()).map((league) => ({
      id: league.slug, title: league.name, subtitle: league.sport, href: `/liga/${league.slug}`,
      type: "Competición" as const, score: score(league.name, query),
    })),
  ];
  return NextResponse.json({ results: candidates.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 8) });
}
