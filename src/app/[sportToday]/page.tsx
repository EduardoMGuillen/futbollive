import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { isEventToday, resolveSportToday, SPORT_TODAY_PAGES } from "@/lib/sport-today";
import { isPubliclyVisible } from "@/lib/utils";

export function generateStaticParams() {
  return SPORT_TODAY_PAGES.map((item) => ({ sportToday: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ sportToday: string }> }): Promise<Metadata> {
  const { sportToday } = await params;
  const page = resolveSportToday(sportToday);
  if (!page) return { title: "Agenda deportiva" };
  return {
    title: page.seoTitle,
    description: `Todos los partidos de ${page.sportName.toLowerCase()} de hoy con hora local, en vivo y dónde ver cada evento.`,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function SportTodayPage({ params }: { params: Promise<{ sportToday: string }> }) {
  const { sportToday } = await params;
  const page = resolveSportToday(sportToday);
  if (!page) notFound();
  await ensureFreshEvents();
  const data = await readStore();
  const events = data.events
    .filter((e) => !e.hidden && e.sportSlug === page.sportSlug && isPubliclyVisible(e) && isEventToday(e.startsAt))
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
  const heroClass = "isEsport" in page && page.isEsport
    ? `page-hero esports-hero game-hero game-${page.sportSlug}`
    : `page-hero sport-hero sport-${page.sportSlug}`;

  return (
    <>
      <section className={heroClass}><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / {page.sportName} hoy</div>
        <h1>{page.sportName} hoy</h1>
        <p>
          Partidos programados para hoy en tu hora local.{" "}
          <Link href={page.hubHref}>Ver agenda completa →</Link>
        </p>
      </div></section>
      <main className="container content-section">
        {events.length
          ? <div className="events-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
          : <div className="empty-state">No hay eventos de {page.sportName.toLowerCase()} programados para hoy.</div>}
      </main>
    </>
  );
}
