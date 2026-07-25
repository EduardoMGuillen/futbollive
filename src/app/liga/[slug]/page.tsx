import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Radio, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BackLink } from "@/components/BackLink";
import { ExpandableEventList } from "@/components/ExpandableEventList";
import { FavoriteLeagueButton } from "@/components/FavoriteEntityButtons";
import { GroupStandingsPanel } from "@/components/GroupStandingsPanel";
import { LandingHeroCard } from "@/components/LandingHeroCard";
import { LeagueStandingsPanel } from "@/components/LeagueStandingsPanel";
import { TournamentBracket } from "@/components/TournamentBracket";
import { buildKnockoutBracket } from "@/lib/bracket";
import { isSearchOrAdsCrawler } from "@/lib/crawler";
import { fetchEspnResults, fetchLeagueStandings, fetchLeagueStandingsGrouped } from "@/lib/espn";
import { allLeagueSlugs, resolveLeagueBySlug } from "@/lib/leagues";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import type { SportsEvent } from "@/lib/types";
import { compareHomepageEvents, isPubliclyVisible, siteUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const data = await readStore();
  const fromStore = data.events.filter((e) => !e.hidden).map((e) => e.leagueSlug);
  return allLeagueSlugs(fromStore).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalog = resolveLeagueBySlug(slug);
  const data = await readStore();
  const fromEvent = data.events.find((e) => e.leagueSlug === slug && !e.hidden);
  const league = catalog?.league || fromEvent?.league;
  if (!league) return { title: "Competición" };
  const title = `${league}: calendario, cuadro eliminatorio y dónde ver`;
  const description = `Partidos de ${league}: en vivo, horarios locales, resultados, clasificación y dónde ver cada encuentro.`;
  return { title, description, alternates: { canonical: `/liga/${slug}` }, openGraph: { title, description, url: `/liga/${slug}` } };
}

function splitEvents(events: SportsEvent[]) {
  const visible = events.filter((e) => isPubliclyVisible(e));
  const live = visible.filter((e) => e.status === "live");
  const upcoming = visible
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const finished = visible
    .filter((e) => e.status === "finished")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const hero = live.sort(compareHomepageEvents)[0] || upcoming[0] || finished[0];
  return { live, upcoming, finished, hero, visible };
}

const LEAGUE_BLURBS: Record<string, string> = {
  "copa-del-mundo-fifa": "Mundial FIFA 2026 en USA, México y Canadá: fase de grupos, eliminatorias y final con hora local.",
  "uefa-champions-league": "La Champions: fases, cruces y dónde ver cada partido de la máxima competición europea.",
  laliga: "LaLiga EA Sports: jornada a jornada, clasificación y próximos partidos.",
  "premier-league": "Premier League: agenda, resultados y dónde ver cada jornada.",
  "liga-mx": "Liga MX: partidos, clasificación y transmisiones para Latinoamérica.",
};

export default async function LeaguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureFreshEvents();
  const catalog = resolveLeagueBySlug(slug);
  const data = await readStore();
  const fromStore = data.events.filter((e) => e.leagueSlug === slug && !e.hidden);
  if (!catalog && !fromStore.length) notFound();

  const sportSlug = catalog?.sportSlug || fromStore[0]?.sportSlug || "futbol";
  const sport = catalog?.sport || fromStore[0]?.sport || "Fútbol";
  const leagueName = catalog?.league || fromStore[0]?.league || slug;
  const path = catalog?.path || fromStore.find((e) => e.sourceLeaguePath)?.sourceLeaguePath;
  const isWorldCup = slug === "copa-del-mundo-fifa" || path === "soccer/fifa.world";

  const year = new Date().getUTCFullYear();
  const crawler = await isSearchOrAdsCrawler();
  // Always pull archive for knockout tournaments / World Cup so bracket + phases are complete.
  // Skip for AdSense crawlers — archive fetch is heavy and caused “site unavailable”.
  let archiveEvents: SportsEvent[] = [];
  if (!crawler && path && (isWorldCup || fromStore.filter((e) => e.status === "finished").length < 8 || fromStore.every((e) => !e.roundLabel && !e.phase))) {
    archiveEvents = await Promise.race([
      fetchEspnResults(path, year),
      new Promise<SportsEvent[]>((resolve) => setTimeout(() => resolve([]), 3_000)),
    ]);
  }
  // Prefer archive fields (roundLabel/phase) when store is stale.
  const merged = new Map<string, SportsEvent>();
  for (const e of fromStore) merged.set(e.id, e);
  for (const e of archiveEvents) {
    const prev = merged.get(e.id);
    merged.set(e.id, prev ? {
      ...prev,
      ...e,
      roundLabel: e.roundLabel || prev.roundLabel,
      phase: e.phase && e.phase !== "other" ? e.phase : prev.phase,
      home: { ...e.home, score: e.home.score ?? prev.home.score },
      away: { ...e.away, score: e.away.score ?? prev.away.score },
      featured: prev.featured ?? e.featured,
    } : e);
  }
  const allEvents = Array.from(merged.values());
  const { live, upcoming, finished, hero } = splitEvents(allEvents);
  // Include finished from archive for display even if past public window on league page.
  const agenda = [
    ...live,
    ...upcoming,
    ...allEvents
      .filter((e) => e.status === "finished")
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
  ];
  const uniqueAgenda = Array.from(new Map(agenda.map((e) => [e.id, e])).values());

  const [standingsFlat, standingsGrouped] = path && !crawler
    ? await Promise.all([
      Promise.race([
        fetchLeagueStandings(path),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_000)),
      ]),
      Promise.race([
        fetchLeagueStandingsGrouped(path),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_000)),
      ]),
    ])
    : [null, null];
  const showGroups = Boolean(standingsGrouped && standingsGrouped.length > 1);
  const flatStandings = !showGroups && standingsFlat?.length ? standingsFlat : null;
  const hasStandings = showGroups || Boolean(flatStandings?.length);
  const bracket = buildKnockoutBracket(allEvents);
  const baseUrl = siteUrl();
  const resultsHref = path
    ? `/resultados?deporte=${encodeURIComponent(sportSlug)}&torneo=${encodeURIComponent(path)}&anio=${year}`
    : "/resultados";
  const blurb = LEAGUE_BLURBS[slug] || `Calendario, clasificación y horarios de ${leagueName} en tu zona local.`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        name: leagueName,
        url: `${baseUrl}/liga/${slug}`,
        sport,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          { "@type": "ListItem", position: 2, name: sport, item: `${baseUrl}/deporte/${sportSlug}` },
          { "@type": "ListItem", position: 3, name: leagueName, item: `${baseUrl}/liga/${slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `┬┐Cuándo son los partidos de ${leagueName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: upcoming[0]
                ? `El próximo partido de ${leagueName} es ${upcoming[0].home.name} vs ${upcoming[0].away.name}. Consulta horarios locales en Dónde Juega.`
                : `Revisa el calendario de ${leagueName} en Dónde Juega para próximos partidos y resultados.`,
            },
          },
          {
            "@type": "Question",
            name: `┬┐Dónde ver ${leagueName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Abre cualquier partido de ${leagueName} para ver canales y plataformas de transmisión según tu país.`,
            },
          },
          {
            "@type": "Question",
            name: `┬┐Hay tabla de posiciones de ${leagueName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: hasStandings
                ? `Sí: en esta página encontrarás la clasificación actualizada de ${leagueName}.`
                : `Cuando la fuente publique la clasificación de ${leagueName}, aparecerá en esta landing.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <section className={`page-hero sport-hero league-landing-hero sport-${sportSlug} league-${slug}`}>
        <div className="container">
          <BackLink href={`/deporte/${sportSlug}`} label={`Volver a ${sport}`} />
          <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href={`/deporte/${sportSlug}`}>{sport}</Link> / {leagueName}</div>
          <div className="sport-landing-grid">
            <div className="sport-landing-copy">
              <span className="eyebrow"><i /> {sport}</span>
              <h1>{leagueName}</h1>
              <p>{blurb}</p>
              <div className="hero-actions">
                <Link className="primary-btn" href={resultsHref}><Trophy size={18} /> Resultados {year}</Link>
                <Link className="secondary-btn" href={`/en-vivo?deporte=${sportSlug}`}><Radio size={18} /> Agenda</Link>
                <FavoriteLeagueButton league={{ slug, name: leagueName, sportSlug }} />
              </div>
              <div className="sport-stat-pills">
                <span><Radio size={16} /> {live.length} en vivo</span>
                <span><CalendarDays size={16} /> {upcoming.length} próximos</span>
                <span><Trophy size={16} /> {finished.length || allEvents.filter((e) => e.status === "finished").length} finalizados</span>
              </div>
            </div>
            {hero && <LandingHeroCard event={hero} />}
          </div>
        </div>
      </section>

      <div className="container content-section">
        {showGroups && standingsGrouped && (
          <GroupStandingsPanel
            groups={standingsGrouped}
            title={isWorldCup ? "Fase de grupos ┬╖ Mundial 2026" : "Clasificación por grupos"}
          />
        )}
        {flatStandings && (
          <LeagueStandingsPanel standings={flatStandings} title={`Tabla ┬╖ ${leagueName}`} variant="full" />
        )}
        {bracket.length > 0 && (
          <div className="league-bracket-wrap">
            <TournamentBracket columns={bracket} />
          </div>
        )}
      </div>

      <div className="container content-section category-layout">
        <div>
          {uniqueAgenda.length ? (
            <ExpandableEventList
              events={uniqueAgenda}
              title={`Partidos ┬╖ ${leagueName}`}
              eyebrow="CALENDARIO"
              initialCount={15}
              enableTeamFilter
            />
          ) : (
            <div className="empty-state">
              <strong>Sin partidos en agenda ahora</strong>
              <span>Esta competición puede estar entre ventanas. Revisa resultados históricos o vuelve más cerca del inicio.</span>
              <p style={{ marginTop: 16 }}><Link className="primary-btn" href={resultsHref}>Ver resultados</Link></p>
            </div>
          )}
        </div>
        <aside className="sidebar">
          {flatStandings && <LeagueStandingsPanel standings={flatStandings} variant="compact" />}
          <div className="league-list premium-aside">
            <h3>Explorar</h3>
            <Link href={resultsHref}>Archivo {year}<span>ΓÇ║</span></Link>
            <Link href={`/deporte/${sportSlug}`}>Más {sport}<span>ΓÇ║</span></Link>
            {isWorldCup && <Link href="/blog">Blog Mundial 2026<span>ΓÇ║</span></Link>}
            <Link href={`/en-vivo?deporte=${sportSlug}`}>Agenda completa<span>ΓÇ║</span></Link>
          </div>
          <AdSlot variant="box" banner={data.banners.find((b) => b.position === "sidebar")} />
          <section className="panel faq-panel">
            <h3>FAQ ┬╖ {leagueName}</h3>
            <details open>
              <summary>┬┐Cuándo son los próximos partidos?</summary>
              <p>{upcoming[0] ? `Próximo: ${upcoming[0].home.name} vs ${upcoming[0].away.name}.` : "Sin próximos partidos confirmados en la agenda."}</p>
            </details>
            <details>
              <summary>┬┐Dónde ver {leagueName}?</summary>
              <p>Entra a la ficha de cada partido para canales y plataformas según tu país.</p>
            </details>
            <details>
              <summary>┬┐Hay clasificación?</summary>
              <p>{hasStandings ? "Sí, en esta misma página." : "Cuando la fuente la publique, aparecerá aquí."}</p>
            </details>
          </section>
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
