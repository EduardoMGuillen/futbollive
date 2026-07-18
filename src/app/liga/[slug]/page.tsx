import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { readStore } from "@/lib/store";
import { isPubliclyVisible } from "@/lib/utils";

export async function generateStaticParams() {
  const data = await readStore();
  return Array.from(new Set(data.events.filter((event) => !event.hidden).map((event) => event.leagueSlug))).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await readStore();
  const event = data.events.find((item) => item.leagueSlug === slug && !item.hidden);
  if (!event) return { title: "Competición" };
  const title = `${event.league}: partidos, horarios y dónde ver`;
  const description = `Calendario actualizado de ${event.league}: partidos de hoy, próximos eventos, horarios y opciones para verlos.`;
  return { title, description, alternates: { canonical: `/liga/${slug}` }, openGraph: { title, description, url: `/liga/${slug}` } };
}

export default async function LeaguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await readStore();
  const allEvents = data.events.filter((event) => event.leagueSlug === slug && !event.hidden);
  if (!allEvents.length) notFound();
  const events = allEvents
    .filter((event) => isPubliclyVisible(event))
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      const timeA = new Date(a.startsAt).getTime();
      const timeB = new Date(b.startsAt).getTime();
      return a.status === "finished" ? timeB - timeA : timeA - timeB;
    });
  const league = allEvents[0].league;
  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href={`/deporte/${allEvents[0].sportSlug}`}>{allEvents[0].sport}</Link> / {league}</div>
        <h1>{league}</h1>
        <p>Calendario, horarios y eventos disponibles de {league}.</p>
      </div></section>
      <section className="container content-section">
        <div className="section-head"><div><h2>Partidos</h2><p>Horarios mostrados automáticamente en tu zona local.</p></div></div>
        {events.length ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state">No hay próximos partidos disponibles.</div>}
      </section>
    </>
  );
}
