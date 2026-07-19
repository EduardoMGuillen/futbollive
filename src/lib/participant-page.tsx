import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { EventCard } from "@/components/EventCard";
import { TeamLogo } from "@/components/TeamLogo";
import { isEsport, isIndividualSport } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { isPubliclyVisible } from "@/lib/utils";
import type { SportsEvent } from "@/lib/types";

function matchesParticipant(event: SportsEvent, slug: string) {
  if (event.home.slug === slug || event.away.slug === slug) return true;
  return Boolean(event.participants?.some((participant) => participant.slug === slug));
}

function participantFromEvent(event: SportsEvent, slug: string) {
  if (event.home.slug === slug) return event.home;
  if (event.away.slug === slug) return event.away;
  return event.participants?.find((participant) => participant.slug === slug) || event.home;
}

export async function generateParticipantStaticParams(kind: "equipo" | "atleta") {
  const data = await readStore();
  const slugs = new Set<string>();
  // Los equipos de esports viven en /esports/[game]/equipo/[slug].
  for (const event of data.events.filter((event) => !event.hidden && !isEsport(event))) {
    const individual = isIndividualSport(event);
    if (kind === "atleta" && !individual) continue;
    if (kind === "equipo" && individual) continue;
    slugs.add(event.home.slug);
    slugs.add(event.away.slug);
    for (const participant of event.participants || []) slugs.add(participant.slug);
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateParticipantMetadata(slug: string, kind: "equipo" | "atleta"): Promise<Metadata> {
  const data = await readStore();
  const event = data.events.find((item) => matchesParticipant(item, slug) && !item.hidden && !isEsport(item) && (kind === "atleta" ? isIndividualSport(item) : !isIndividualSport(item)));
  if (!event) return { title: kind === "atleta" ? "Atleta" : "Equipo" };
  const participant = participantFromEvent(event, slug);
  const noun = kind === "atleta" ? "próximos eventos" : "próximos partidos";
  const title = `${participant.name}: ${noun}, horarios y dónde ver`;
  const description = kind === "atleta"
    ? `Consulta la agenda de ${participant.name}, horarios locales y dónde ver cada evento.`
    : `Consulta cuándo juega ${participant.name}, sus próximos partidos, horarios locales y dónde ver cada encuentro.`;
  return {
    title,
    description,
    alternates: { canonical: `/${kind}/${slug}` },
    openGraph: { title, description, url: `/${kind}/${slug}`, images: participant.logo ? [{ url: participant.logo }] : undefined },
  };
}

export async function ParticipantPage({
  slug,
  kind,
}: {
  slug: string;
  kind: "equipo" | "atleta";
}) {
  const data = await readStore();
  const allEvents = data.events.filter((event) =>
    matchesParticipant(event, slug) &&
    !event.hidden &&
    !isEsport(event) &&
    (kind === "atleta" ? isIndividualSport(event) : !isIndividualSport(event)),
  );
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
  const participant = participantFromEvent(allEvents[0], slug);
  const crumb = kind === "atleta" ? "Atletas" : "Equipos";
  const backHref = `/deporte/${allEvents[0].sportSlug}`;
  const backLabel = `Volver a ${allEvents[0].sport}`;
  return (
    <>
      <section className="page-hero"><div className="container">
        <BackLink href={backHref} label={backLabel} />
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / {crumb} / {participant.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <TeamLogo name={participant.name} src={participant.logo} size={76} />
          <div>
            <h1>{participant.name}</h1>
            <p>{kind === "atleta" ? "Próximos eventos y horarios." : "Próximos partidos y horarios."}</p>
          </div>
        </div>
      </div></section>
      <section className="container content-section">
        {events.length
          ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
          : <div className="empty-state">{kind === "atleta" ? "No hay próximos eventos disponibles." : "No hay próximos partidos disponibles."}</div>}
      </section>
    </>
  );
}
