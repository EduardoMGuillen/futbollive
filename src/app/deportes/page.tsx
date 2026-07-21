import type { Metadata } from "next";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { LocalTime } from "@/components/LocalTime";
import { TeamLogo } from "@/components/TeamLogo";
import { getEspnSportsCatalog } from "@/lib/espn";
import { getLeagueCatalog } from "@/lib/leagues";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { ESPORTS_GAMES, sportIcon } from "@/lib/sports";
import { compareHomepageEvents, isPubliclyVisible } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Todos los deportes: fútbol, tenis, NBA, F1, UFC y más",
  description: "Explora la agenda completa por deporte: fútbol, baloncesto, béisbol, tenis, automovilismo, MMA, golf, rugby y más.",
  alternates: { canonical: "/deportes" },
};
export const dynamic = "force-dynamic";

export default async function SportsIndexPage() {
  await ensureFreshEvents();
  const catalog = getEspnSportsCatalog();
  const leagueCatalog = getLeagueCatalog();
  const data = await readStore();
  const visible = data.events.filter((e) => !e.hidden && isPubliclyVisible(e));
  const liveSlugs = new Set(visible.filter((e) => e.status === "live").map((e) => e.sportSlug));
  const counts = new Map<string, number>();
  for (const event of visible) counts.set(event.sportSlug, (counts.get(event.sportSlug) || 0) + 1);
  const heroEvent = visible.filter((e) => e.status === "live" || e.status === "upcoming").sort(compareHomepageEvents)[0];

  const tiles = catalog.map((sport) => ({
    ...sport,
    count: counts.get(sport.slug) || 0,
    live: liveSlugs.has(sport.slug),
  }));
  tiles.sort((a, b) => {
    if (a.live !== b.live) return a.live ? -1 : 1;
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name, "es");
  });

  return (
    <>
      <section className="hero deportes-hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow"><i /> Directorio</span>
              <h1>Todos los <span>deportes</span></h1>
              <p>Elige un deporte o competición. Horarios locales, en vivo y dónde ver cada evento.</p>
            </div>
            {heroEvent && (
              <Link href={`/partido/${heroEvent.slug}`} className="hero-card">
                <div className="hero-card-top"><span>{heroEvent.league}</span><span>{heroEvent.status === "live" ? "En vivo" : "Destacado"}</span></div>
                <div className="hero-match">
                  <div><TeamLogo name={heroEvent.home.name} src={heroEvent.home.logo} size={56} /><span>{heroEvent.home.name}</span></div>
                  <b>{heroEvent.status === "live" ? `${heroEvent.home.score ?? 0} – ${heroEvent.away.score ?? 0}` : "VS"}</b>
                  <div><TeamLogo name={heroEvent.away.name} src={heroEvent.away.logo} size={56} /><span>{heroEvent.away.name}</span></div>
                </div>
                <div className="hero-schedule">
                  <LocalTime iso={heroEvent.startsAt} mode="day" as="strong" />
                  <LocalTime iso={heroEvent.startsAt} mode="time" as="span" />
                  {heroEvent.status === "upcoming" && <Countdown startsAt={heroEvent.startsAt} className="countdown-badge countdown-hero" />}
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>
      <main className="container content-section">
        <div className="sports-directory">
          {tiles.map((sport) => (
            <Link key={sport.slug} href={`/deporte/${sport.slug}`} className={`sport-tile ${sport.live ? "sport-tile-live" : ""}`}>
              <span className="sport-tile-icon" aria-hidden>{sportIcon(sport.slug)}</span>
              <strong>{sport.name}</strong>
              <small>{sport.count > 0 ? `${sport.count} evento${sport.count === 1 ? "" : "s"}` : "Ver competiciones"}</small>
              {sport.live && <span className="live-badge"><i /> EN VIVO</span>}
            </Link>
          ))}
        </div>
        <div className="section-head" style={{ marginTop: 36 }}>
          <div><span className="eyebrow">ESPORTS</span><h2>Deportes electrónicos</h2></div>
          <p><Link href="/esports">Ver hub de esports →</Link></p>
        </div>
        <div className="sports-directory">
          {ESPORTS_GAMES.map((game) => {
            const count = counts.get(game.slug) || 0;
            return (
              <Link key={game.slug} href={`/esports/${game.slug}`} className={`sport-tile game-tile game-${game.slug}`}>
                <span className="sport-tile-icon" aria-hidden>{sportIcon(game.slug)}</span>
                <strong>{game.name}</strong>
                <small>{count > 0 ? `${count} serie${count === 1 ? "" : "s"}` : "Sin series ahora"}</small>
              </Link>
            );
          })}
        </div>
        <p style={{ marginTop: 28, color: "var(--muted)" }}>
          <Link href="/blog">Blog</Link> · {leagueCatalog.length} competiciones en catálogo
        </p>
      </main>
    </>
  );
}
