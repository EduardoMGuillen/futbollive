import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { TeamLogo } from "@/components/TeamLogo";
import { isEsport, participantHref } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { eventMatchesMatchup, matchupSlug, parseMatchupSlug } from "@/lib/vs";
import { isPubliclyVisible, siteUrl } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const data = await readStore();
  const seen = new Set<string>();
  for (const event of data.events) {
    if (event.hidden || event.format === "multi" || isEsport(event)) continue;
    seen.add(matchupSlug(event.home.name, event.away.name));
  }
  return Array.from(seen).slice(0, 400).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseMatchupSlug(slug);
  if (!parsed) return { title: "Enfrentamiento" };
  const data = await readStore();
  const event = data.events.find(
    (item) =>
      !item.hidden &&
      eventMatchesMatchup(item.home.slug, item.away.slug, parsed.left, parsed.right),
  );
  const leftName = event
    ? (event.home.slug === parsed.left || event.away.slug === parsed.left
      ? (event.home.slug === parsed.left ? event.home.name : event.away.name)
      : parsed.left.replace(/-/g, " "))
    : parsed.left.replace(/-/g, " ");
  const rightName = event
    ? (event.home.slug === parsed.right || event.away.slug === parsed.right
      ? (event.home.slug === parsed.right ? event.home.name : event.away.name)
      : parsed.right.replace(/-/g, " "))
    : parsed.right.replace(/-/g, " ");
  const title = `${leftName} vs ${rightName}: historial, horarios y dónde ver`;
  const description = `Enfrentamientos entre ${leftName} y ${rightName}: próximos partidos, resultados recientes y opciones de transmisión.`;
  return {
    title,
    description,
    keywords: [`${leftName} vs ${rightName}`, `${leftName} ${rightName}`, `dónde ver ${leftName} vs ${rightName}`],
    alternates: { canonical: `/vs/${slug}` },
    openGraph: { title, description, url: `/vs/${slug}` },
  };
}

export default async function MatchupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseMatchupSlug(slug);
  if (!parsed) notFound();
  await ensureFreshEvents();
  const data = await readStore();
  const matches = data.events
    .filter(
      (event) =>
        !event.hidden &&
        !isEsport(event) &&
        event.format !== "multi" &&
        eventMatchesMatchup(event.home.slug, event.away.slug, parsed.left, parsed.right),
    )
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  if (!matches.length) notFound();

  const sample = matches[0];
  const left = sample.home.slug === parsed.left || sample.away.slug === parsed.left
    ? (sample.home.slug === parsed.left ? sample.home : sample.away)
    : sample.home;
  const right = left.slug === sample.home.slug ? sample.away : sample.home;

  const upcoming = matches.filter((e) => e.status === "upcoming" || e.status === "live").filter(isPubliclyVisible);
  const finished = matches.filter((e) => e.status === "finished" && isPubliclyVisible(e));
  const leftWins = finished.filter((e) => {
    const leftScore = e.home.slug === left.slug ? (e.home.score ?? 0) : (e.away.score ?? 0);
    const rightScore = e.home.slug === right.slug ? (e.home.score ?? 0) : (e.away.score ?? 0);
    return leftScore > rightScore;
  }).length;
  const rightWins = finished.filter((e) => {
    const leftScore = e.home.slug === left.slug ? (e.home.score ?? 0) : (e.away.score ?? 0);
    const rightScore = e.home.slug === right.slug ? (e.home.score ?? 0) : (e.away.score ?? 0);
    return rightScore > leftScore;
  }).length;
  const draws = finished.length - leftWins - rightWins;
  const baseUrl = siteUrl();
  const title = `${left.name} vs ${right.name}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        name: title,
        url: `${baseUrl}/vs/${slug}`,
        sport: sample.sport,
        competitor: [
          { "@type": "SportsTeam", name: left.name },
          { "@type": "SportsTeam", name: right.name },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Cuándo juegan ${left.name} y ${right.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: upcoming[0]
                ? `El próximo enfrentamiento es ${upcoming[0].league}: consulta el horario local en Dónde Juega.`
                : `No hay un próximo ${title} confirmado en la agenda actual.`,
            },
          },
          {
            "@type": "Question",
            name: `¿Cuál es el historial reciente ${left.name} vs ${right.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: finished.length
                ? `En los encuentros recientes visibles: ${left.name} ${leftWins}, ${right.name} ${rightWins}${draws > 0 ? `, empates ${draws}` : ""}.`
                : "Aún no hay resultados recientes en la agenda.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <section className={`page-hero sport-hero sport-${sample.sportSlug}`}><div className="container">
        <div className="breadcrumbs">
          <Link href="/">Inicio</Link> / <Link href={`/deporte/${sample.sportSlug}`}>{sample.sport}</Link> / VS
        </div>
        <div className="matchup-hero">
          <Link href={participantHref(sample, left.slug)} className="matchup-side">
            <TeamLogo name={left.name} src={left.logo} size={72} />
            <strong>{left.name}</strong>
          </Link>
          <div className="matchup-center">
            <span className="eyebrow"><i /> HISTORIAL</span>
            <h1>{title}</h1>
            <p>
              {finished.length} resultado{finished.length === 1 ? "" : "s"} · {leftWins}-{draws}-{rightWins}
            </p>
          </div>
          <Link href={participantHref(sample, right.slug)} className="matchup-side">
            <TeamLogo name={right.name} src={right.logo} size={72} />
            <strong>{right.name}</strong>
          </Link>
        </div>
      </div></section>
      <div className="container content-section">
        {upcoming.length > 0 && (
          <section className="content-section" style={{ paddingTop: 0 }}>
            <div className="section-head"><div><h2>Próximos enfrentamientos</h2></div></div>
            <div className="events-grid">{upcoming.map((event) => <EventCard event={event} key={event.id} />)}</div>
          </section>
        )}
        <section className="content-section">
          <div className="section-head"><div><h2>Resultados recientes</h2></div></div>
          {finished.length
            ? <div className="events-grid">{finished.slice(0, 12).map((event) => <EventCard event={event} key={event.id} />)}</div>
            : <div className="empty-state">Sin resultados recientes visibles.</div>}
        </section>
        <section className="panel faq-panel">
          <h2>Preguntas frecuentes</h2>
          <details open>
            <summary>¿Dónde ver {title}?</summary>
            <p>Abre la ficha de cada partido para ver canales y plataformas según tu país.</p>
          </details>
          <details>
            <summary>¿En qué competiciones se enfrentan?</summary>
            <p>{Array.from(new Set(matches.map((m) => m.league))).join(", ")}.</p>
          </details>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
