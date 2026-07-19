import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BackLink } from "@/components/BackLink";
import { EventCard } from "@/components/EventCard";
import { getEspnSportsCatalog } from "@/lib/espn";
import { isEsportSlug } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { isPubliclyVisible } from "@/lib/utils";

export async function generateStaticParams() {
  const catalog = getEspnSportsCatalog();
  const data = await readStore();
  const slugs = new Set([
    ...catalog.map((sport) => sport.slug),
    ...data.events.filter((event) => !event.hidden).map((event) => event.sportSlug),
  ]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalogSport = getEspnSportsCatalog().find((item) => item.slug === slug);
  const data = await readStore();
  const event = data.events.find((item) => item.sportSlug === slug);
  const sport = event?.sport || catalogSport?.name;
  if (!sport) return { title: "Deporte" };
  const title = `${sport} hoy: partidos, horarios y dónde ver`;
  const description = `Consulta todos los eventos de ${sport.toLocaleLowerCase("es")} de hoy, horarios locales, competiciones y dónde ver cada evento.`;
  return {
    title,
    description,
    alternates: { canonical: `/deporte/${slug}` },
    openGraph: { title, description, url: `/deporte/${slug}` },
  };
}

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Los esports tienen su propio hub con hero y rosters.
  if (isEsportSlug(slug)) redirect(`/esports/${slug}`);
  const catalogSport = getEspnSportsCatalog().find((item) => item.slug === slug);
  const data = await readStore();
  const allEvents = data.events.filter((event) => event.sportSlug === slug && !event.hidden);
  const sport = allEvents[0]?.sport || catalogSport?.name;
  if (!sport) notFound();
  const events = allEvents
    .filter((event) => isPubliclyVisible(event))
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      const timeA = new Date(a.startsAt).getTime();
      const timeB = new Date(b.startsAt).getTime();
      return a.status === "finished" ? timeB - timeA : timeA - timeB;
    });
  const leagues = Array.from(new Map(
    (events.length ? events : allEvents).map((event) => [event.leagueSlug, event.league]),
  ).entries());

  return (
    <>
      <section className="page-hero"><div className="container">
        <BackLink href="/deportes" label="Volver a todos los deportes" />
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href="/deportes">Deportes</Link> / {sport}</div>
        <h1>{sport}</h1>
        <p>Partidos, horarios y eventos destacados de {sport.toLocaleLowerCase("es")} en tu hora local.</p>
      </div></section>
      <div className="container content-section category-layout">
        <div>
          <div className="section-head"><div><h2>Agenda de {sport}</h2><p>{events.length} eventos disponibles</p></div></div>
          {events.length ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state">No hay próximos eventos disponibles.</div>}
        </div>
        <aside className="sidebar">
          <div className="league-list">
            <h3>Competiciones</h3>
            {leagues.length
              ? leagues.map(([leagueSlug, name]) => <Link href={`/liga/${leagueSlug}`} key={leagueSlug}>{name}<span>›</span></Link>)
              : <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>Sin competiciones activas.</p>}
          </div>
          <AdSlot variant="box" banner={data.banners.find((banner) => banner.position === "feed")} />
        </aside>
      </div>
    </>
  );
}
