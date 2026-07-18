import { CalendarCheck, ChevronRight, Clock3, Radio, SearchCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Countdown } from "@/components/Countdown";
import { EventCard } from "@/components/EventCard";
import { LocalTime } from "@/components/LocalTime";
import { TeamLogo } from "@/components/TeamLogo";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { compareHomepageEvents, eventTitle, isPubliclyVisible } from "@/lib/utils";
import { sportIcon } from "@/lib/sports";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Partidos de hoy: horarios, en vivo y dónde ver",
  description: "Consulta los partidos de hoy y próximos eventos de fútbol, NBA, MLB, tenis y más. Horarios locales, sedes, participantes y dónde ver.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Partidos de hoy y dónde verlos | Dónde Juega" },
};

export default async function Home() {
  await ensureFreshEvents();
  const data = await readStore();
  const visible = data.events.filter((event) => !event.hidden && isPubliclyVisible(event));
  const importantLive = visible
    .filter((event) => event.status === "live" && !event.excludedFromLive && event.importance >= data.settings.liveThreshold)
    .sort(compareHomepageEvents)
    .slice(0, data.settings.maxFeaturedLive);
  const upcoming = visible
    .filter((event) => event.status === "upcoming")
    .sort(compareHomepageEvents)
    .slice(0, 6);
  const recentResults = visible
    .filter((event) => event.status === "finished")
    .sort((a, b) => {
      const byScore = compareHomepageEvents(a, b);
      if (byScore !== 0) return byScore;
      return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
    })
    .slice(0, 4);
  const heroEvent = importantLive[0] || upcoming[0];
  const sports = Array.from(new Map(visible.map((event) => [event.sportSlug, event.sport])).entries());

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow"><i /> Tu agenda deportiva</span>
              <h1>Todo el deporte.<br /><span>En un solo lugar.</span></h1>
              <p>Descubre los partidos más importantes del día, horarios en tu zona y toda la información para saber dónde juegan.</p>
              <div className="hero-actions">
                <Link className="primary-btn" href="/en-vivo"><Radio size={18} /> Ver eventos en vivo</Link>
                <Link className="secondary-btn" href="/buscar"><SearchCheck size={18} /> Explorar partidos</Link>
              </div>
            </div>
            {heroEvent && (
              <Link href={`/partido/${heroEvent.slug}`} className="hero-card">
                <div className="hero-card-top">
                  <span>{heroEvent.league}</span>
                  <span>{heroEvent.status === "live" ? "En vivo" : "Próximo"}</span>
                </div>
                <span className="live-badge"><i /> {heroEvent.status === "live" ? heroEvent.minute || "EN VIVO" : "PRÓXIMO"}</span>
                {heroEvent.format === "multi" ? <div className="hero-multi">
                  <h2>{eventTitle(heroEvent)}</h2>
                  <span>{heroEvent.participants?.slice(0, 3).map((participant) => participant.name).join(" · ") || "Participantes por confirmar"}</span>
                </div> : <div className="hero-match">
                  <div><TeamLogo name={heroEvent.home.name} src={heroEvent.home.logo} size={64} /><span>{heroEvent.home.name}</span></div>
                  <b>{heroEvent.status === "live" ? `${heroEvent.home.score ?? 0} – ${heroEvent.away.score ?? 0}` : "VS"}</b>
                  <div><TeamLogo name={heroEvent.away.name} src={heroEvent.away.logo} size={64} /><span>{heroEvent.away.name}</span></div>
                </div>}
                <div className="hero-schedule">
                  <LocalTime iso={heroEvent.startsAt} mode="day" as="strong" />
                  <LocalTime iso={heroEvent.startsAt} mode="time" as="span" />
                  {heroEvent.status === "upcoming" && <Countdown startsAt={heroEvent.startsAt} className="countdown-badge countdown-hero" />}
                </div>
              </Link>
            )}
          </div>
          <div className="stats-strip">
            <div><Clock3 size={22} /><span><strong>Hora local automática</strong><small>Sin hacer conversiones</small></span></div>
            <div><CalendarCheck size={22} /><span><strong>Agenda actualizada</strong><small>Partidos y competiciones</small></span></div>
            <div><ShieldCheck size={22} /><span><strong>Información segura</strong><small>Sin alojar transmisiones</small></span></div>
          </div>
        </div>
      </section>

      <div className="container"><AdSlot banner={data.banners.find((banner) => banner.position === "top")} /></div>

      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow"><i /> Explora</span><h2>Todos tus deportes</h2></div>
            <Link className="section-link" href="/deportes">Ver todos <ChevronRight size={17} /></Link>
          </div>
          <div className="sports-row">
            {sports.map(([slug, name]) => <Link key={slug} href={`/deporte/${slug}`}><span>{sportIcon(slug)}</span>{name}</Link>)}
          </div>
        </div>
      </section>
      {recentResults.length > 0 && <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow"><i /> Marcadores</span><h2>Finalizados recientemente</h2></div>
            <Link className="section-link" href="/resultados">Todos los resultados <ChevronRight size={17} /></Link>
          </div>
          <div className="events-grid">{recentResults.map((event) => <EventCard event={event} key={event.id} />)}</div>
        </div>
      </section>}

      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow"><i /> Selección editorial</span><h2>En vivo ahora</h2><p>Solo los eventos más importantes. Sin ruido.</p></div>
            <Link className="section-link" href="/en-vivo">Ver todos <ChevronRight size={17} /></Link>
          </div>
          {importantLive.length ? <div className="events-grid">{importantLive.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state">No hay eventos destacados en vivo en este momento. Revisa los próximos partidos.</div>}
        </div>
      </section>

      <div className="container"><AdSlot banner={data.banners.find((banner) => banner.position === "feed")} /></div>

      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow"><i /> Agenda</span><h2>Próximos destacados</h2><p>Los eventos que no querrás perderte.</p></div>
            <Link className="section-link" href="/en-vivo?estado=upcoming">Calendario completo <ChevronRight size={17} /></Link>
          </div>
          <div className="events-grid">{upcoming.map((event) => <EventCard event={event} key={event.id} />)}</div>
        </div>
      </section>
    </>
  );
}
