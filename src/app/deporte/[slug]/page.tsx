import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { EventCard } from "@/components/EventCard";
import { readStore } from "@/lib/store";

export async function generateStaticParams() {
  const data = await readStore();
  return Array.from(new Set(data.events.filter((event) => !event.hidden).map((event) => event.sportSlug))).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await readStore();
  const event = data.events.find((item) => item.sportSlug === slug);
  if (!event) return { title: "Deporte" };
  const title = `${event.sport} hoy: partidos, horarios y dónde ver`;
  const description = `Consulta todos los eventos de ${event.sport.toLocaleLowerCase("es")} de hoy, horarios locales, competiciones y dónde ver cada partido legalmente.`;
  return {
    title,
    description,
    alternates: { canonical: `/deporte/${slug}` },
    openGraph: { title, description, url: `/deporte/${slug}` },
  };
}

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await readStore();
  const events = data.events.filter((event) => event.sportSlug === slug && !event.hidden);
  if (!events.length) notFound();
  const sport = events[0].sport;
  const leagues = Array.from(new Map(events.map((event) => [event.leagueSlug, event.league])).entries());

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs">Inicio / Deportes / {sport}</div>
        <h1>{sport}</h1>
        <p>Partidos, horarios y eventos destacados de {sport.toLocaleLowerCase("es")} en tu hora local.</p>
      </div></section>
      <div className="container content-section category-layout">
        <div>
          <div className="section-head"><div><h2>Agenda de {sport}</h2><p>{events.length} eventos disponibles</p></div></div>
          <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
        </div>
        <aside className="sidebar">
          <div className="league-list"><h3>Competiciones</h3>{leagues.map(([leagueSlug, name]) => <Link href={`/liga/${leagueSlug}`} key={leagueSlug}>{name}<span>›</span></Link>)}</div>
          <AdSlot variant="box" banner={data.banners.find((banner) => banner.position === "feed")} />
        </aside>
      </div>
    </>
  );
}
