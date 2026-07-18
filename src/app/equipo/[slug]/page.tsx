import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { TeamLogo } from "@/components/TeamLogo";
import { readStore } from "@/lib/store";

export async function generateStaticParams() {
  const data = await readStore();
  return Array.from(new Set(data.events.filter((event) => !event.hidden).flatMap((event) => [event.home.slug, event.away.slug]))).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await readStore();
  const event = data.events.find((item) => (item.home.slug === slug || item.away.slug === slug) && !item.hidden);
  if (!event) return { title: "Equipo" };
  const team = event.home.slug === slug ? event.home : event.away;
  const title = `${team.name}: próximos partidos, horarios y dónde ver`;
  const description = `Consulta cuándo juega ${team.name}, sus próximos partidos, horarios locales, rivales y dónde ver cada encuentro.`;
  return {
    title,
    description,
    alternates: { canonical: `/equipo/${slug}` },
    openGraph: { title, description, url: `/equipo/${slug}`, images: team.logo ? [{ url: team.logo }] : undefined },
  };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await readStore();
  const events = data.events.filter((event) => (event.home.slug === slug || event.away.slug === slug) && !event.hidden);
  if (!events.length) notFound();
  const participant = events.map((event) => event.home.slug === slug ? event.home : event.away)[0];
  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs">Inicio / Equipos / {participant.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <TeamLogo name={participant.name} src={participant.logo} size={76} />
          <div><h1>{participant.name}</h1><p>Próximos partidos y resultados recientes.</p></div>
        </div>
      </div></section>
      <section className="container content-section">
        <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
      </section>
    </>
  );
}
