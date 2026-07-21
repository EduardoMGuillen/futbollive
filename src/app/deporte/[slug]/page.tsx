import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronRight, Radio, Trophy } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BackLink } from "@/components/BackLink";
import { ExpandableEventList } from "@/components/ExpandableEventList";
import { LandingHeroCard } from "@/components/LandingHeroCard";
import { getEspnSportsCatalog } from "@/lib/espn";
import { getLeagueCatalog } from "@/lib/leagues";
import { sportIcon, isEsportSlug } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { SPORT_TODAY_PAGES } from "@/lib/sport-today";
import { compareHomepageEvents, isPubliclyVisible, siteUrl } from "@/lib/utils";

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

const SPORT_COPY: Record<string, string> = {
  futbol: "La agenda completa del fútbol mundial: ligas top, mundiales y torneos continentales con hora local.",
  baloncesto: "NBA, Euroliga y más. Marcadores en vivo y próximos tip-offs en tu zona.",
  beisbol: "MLB y béisbol internacional con horarios locales y resultados.",
  tenis: "ATP, WTA y Grand Slams: partidos del día y próximas rondas.",
  automovilismo: "Fórmula 1 y más: sesiones, carrera y clasificación.",
  mma: "UFC y cartelera: pelea principal, horarios y dónde ver.",
};

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (isEsportSlug(slug)) redirect(`/esports/${slug}`);
  await ensureFreshEvents();
  const catalogSport = getEspnSportsCatalog().find((item) => item.slug === slug);
  const data = await readStore();
  const allEvents = data.events.filter((event) => event.sportSlug === slug && !event.hidden);
  const sport = allEvents[0]?.sport || catalogSport?.name;
  if (!sport) notFound();

  const visible = allEvents.filter((event) => isPubliclyVisible(event));
  const live = visible.filter((e) => e.status === "live").sort(compareHomepageEvents);
  const upcoming = visible
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const finished = visible
    .filter((e) => e.status === "finished")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const agenda = [...live, ...upcoming, ...finished];
  const hero = live[0] || upcoming.sort(compareHomepageEvents)[0] || finished[0];

  const catalogLeagues = getLeagueCatalog().filter((item) => item.sportSlug === slug);
  const leaguesFromEvents = Array.from(new Map(allEvents.map((e) => [e.leagueSlug, e.league])).entries());
  const leagues = leaguesFromEvents.length
    ? leaguesFromEvents
    : catalogLeagues.map((item) => [item.leagueSlug, item.league] as const);

  const todayPage = SPORT_TODAY_PAGES.find((p) => p.sportSlug === slug);
  const baseUrl = siteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${sport} en vivo`,
        url: `${baseUrl}/deporte/${slug}`,
        description: `Agenda de ${sport} con horarios locales y dónde ver.`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Deportes", item: `${baseUrl}/deportes` },
          { "@type": "ListItem", position: 3, name: sport, item: `${baseUrl}/deporte/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <section className={`page-hero sport-hero sport-landing-hero sport-${slug}`}>
        <div className="container">
          <BackLink href="/deportes" label="Volver a todos los deportes" />
          <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href="/deportes">Deportes</Link> / {sport}</div>
          <div className="sport-landing-grid">
            <div className="sport-landing-copy">
              <span className="eyebrow"><span aria-hidden>{sportIcon(slug)}</span> Agenda {sport}</span>
              <h1>{sport}.<br /><span>En un solo lugar.</span></h1>
              <p>{SPORT_COPY[slug] || `Partidos, horarios y competiciones de ${sport.toLocaleLowerCase("es")} en tu hora local.`}</p>
              <div className="hero-actions">
                <Link className="primary-btn" href={`/en-vivo?deporte=${slug}`}><Radio size={18} /> Ver en vivo</Link>
                {todayPage && (
                  <Link className="secondary-btn" href={`/${todayPage.slug}`}>
                    <CalendarDays size={18} /> Hoy
                  </Link>
                )}
              </div>
              <div className="sport-stat-pills">
                <span><Radio size={16} /> {live.length} en vivo</span>
                <span><CalendarDays size={16} /> {upcoming.length} próximos</span>
                <span><Trophy size={16} /> {leagues.length} competiciones</span>
              </div>
            </div>
            {hero && <LandingHeroCard event={hero} />}
          </div>
        </div>
      </section>

      <div className="container content-section category-layout">
        <div>
          {agenda.length ? (
            <ExpandableEventList
              events={agenda}
              title={`Partidos de ${sport}`}
              eyebrow="AGENDA"
              initialCount={15}
              enableTeamFilter
            />
          ) : (
            <div className="empty-state">
              <strong>Sin eventos en agenda ahora</strong>
              <span>Explora las competiciones disponibles o consulta resultados.</span>
            </div>
          )}
        </div>
        <aside className="sidebar">
          <div className="league-list premium-aside">
            <h3>Competiciones</h3>
            {leagues.length
              ? leagues.slice(0, 20).map(([leagueSlug, name]) => (
                <Link href={`/liga/${leagueSlug}`} key={leagueSlug}>{name}<span>›</span></Link>
              ))
              : <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>Sin competiciones en catálogo.</p>}
            {leagues.length > 20 && (
              <Link href={`/en-vivo?deporte=${slug}`} className="aside-more">Ver todas <ChevronRight size={14} /></Link>
            )}
          </div>
          <Link className="secondary-btn" href={`/resultados?deporte=${slug}`} style={{ justifyContent: "center" }}>Ver resultados</Link>
          <AdSlot variant="box" banner={data.banners.find((banner) => banner.position === "sidebar")} />
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
