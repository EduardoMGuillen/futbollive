import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { readStore } from "@/lib/store";

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
  const description = `Calendario actualizado de ${event.league}: partidos de hoy, próximos eventos, horarios y opciones legales para verlos.`;
  return { title, description, alternates: { canonical: `/liga/${slug}` }, openGraph: { title, description, url: `/liga/${slug}` } };
}

export default async function LeaguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await readStore();
  const events = data.events.filter((event) => event.leagueSlug === slug && !event.hidden);
  if (!events.length) notFound();
  const league = events[0].league;
  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href={`/deporte/${events[0].sportSlug}`}>{events[0].sport}</Link> / {league}</div>
        <h1>{league}</h1>
        <p>Calendario, horarios y eventos disponibles de {league}.</p>
      </div></section>
      <section className="container content-section">
        <div className="section-head"><div><h2>Partidos</h2><p>Horarios mostrados automáticamente en tu zona local.</p></div></div>
        <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
      </section>
    </>
  );
}
