export type BlogBlock =
  | { type: "p"; content: string }
  | { type: "h2"; content: string }
  | { type: "ul"; items: string[] }
  | { type: "link"; href: string; label: string; hint?: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  coverEmoji: string;
  /** Partido relacionado (redirect CTA). */
  relatedMatchSlug?: string;
  body: BlogBlock[];
};

/** Final Mundial 2026 — datos del store ESPN (Spain 1–0 Argentina). */
export const WORLD_CUP_FINAL = {
  slug: "spain-vs-argentina-760517",
  home: "Spain",
  away: "Argentina",
  score: "1 – 0",
  venue: "MetLife Stadium",
  country: "USA",
  startsAt: "2026-07-19T19:00:00.000Z",
  leagueHref: "/liga/copa-del-mundo-fifa",
} as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "mundial-2026-usa-guia",
    title: "Mundial 2026 en USA, México y Canadá: guía para seguir cada partido",
    description: "Sedes, formato ampliado y cómo usar Dónde Juega para horarios locales, en vivo y dónde ver la Copa del Mundo FIFA.",
    publishedAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    category: "Mundial 2026",
    tags: ["mundial-2026", "fifa", "usa"],
    coverEmoji: "🏆",
    body: [
      { type: "p", content: "La Copa del Mundo FIFA 2026 se disputa por primera vez en tres países anfitriones: Estados Unidos, México y Canadá. En Dónde Juega puedes consultar la agenda completa con hora automática en tu zona, marcadores en vivo, fase de grupos, cuadro eliminatorio y opciones oficiales de transmisión." },
      { type: "h2", content: "Formato y sedes" },
      { type: "p", content: "El torneo cuenta con 48 selecciones. Desde MetLife Stadium hasta estadios en Ciudad de México y Toronto, cada partido aparece en la landing del Mundial con contexto de fase (grupos, octavos, final) y sede." },
      { type: "link", href: "/liga/copa-del-mundo-fifa", label: "Abrir landing Copa del Mundo FIFA", hint: "Grupos, puntos y bracket hasta la final" },
      { type: "link", href: "/resultados?deporte=futbol&torneo=soccer/fifa.world&anio=2026", label: "Archivo de resultados 2026" },
      { type: "link", href: `/partido/${WORLD_CUP_FINAL.slug}`, label: "Ver la final España vs Argentina", hint: `Marcador ${WORLD_CUP_FINAL.score}` },
    ],
  },
  {
    slug: "mundial-2026-resultados",
    title: "Resultados del Mundial 2026: resumen por fases",
    description: "Repaso de la fase de grupos y eliminatorias del Mundial 2026, con la final España 1-0 Argentina.",
    publishedAt: "2026-07-18T10:00:00.000Z",
    updatedAt: "2026-07-20T10:30:00.000Z",
    category: "Mundial 2026",
    tags: ["mundial-2026", "resultados"],
    coverEmoji: "📊",
    relatedMatchSlug: WORLD_CUP_FINAL.slug,
    body: [
      { type: "p", content: "Los marcadores del Mundial 2026 se consultan en tiempo real durante el torneo y permanecen en el archivo de resultados. Filtra por Copa del Mundo FIFA y año 2026 para ver todos los partidos terminados." },
      { type: "h2", content: "Fases del torneo" },
      { type: "ul", items: [
        "Fase de grupos: tablas por grupo con puntos y diferencia de goles",
        "Octavos, cuartos y semifinales: cuadro eliminatorio en la landing",
        `Final: ${WORLD_CUP_FINAL.home} ${WORLD_CUP_FINAL.score} ${WORLD_CUP_FINAL.away} en ${WORLD_CUP_FINAL.venue}`,
      ]},
      { type: "link", href: `/partido/${WORLD_CUP_FINAL.slug}`, label: "Ficha de la final", hint: "Cronología, sede y dónde se transmitió" },
      { type: "link", href: "/liga/copa-del-mundo-fifa", label: "Ver grupos y bracket completo" },
      { type: "p", content: "Datos de marcadores verificados con ESPN." },
    ],
  },
  {
    slug: "espana-campeona-mundial-2026",
    title: "España, campeona del Mundial 2026",
    description: "La Roja gana el Mundial 2026: España 1-0 Argentina en MetLife Stadium. Crónica del título.",
    publishedAt: "2026-07-19T23:30:00.000Z",
    updatedAt: "2026-07-20T10:30:00.000Z",
    category: "Mundial 2026",
    tags: ["mundial-2026", "españa", "campeona"],
    coverEmoji: "🇪🇸",
    relatedMatchSlug: WORLD_CUP_FINAL.slug,
    body: [
      { type: "p", content: `España se proclama campeona del Mundial FIFA 2026 tras vencer a Argentina ${WORLD_CUP_FINAL.score} en ${WORLD_CUP_FINAL.venue} (${WORLD_CUP_FINAL.country}). La Roja cerró un mes de competición de alto nivel en Norteamérica.` },
      { type: "h2", content: "El camino de La Roja" },
      { type: "ul", items: [
        "Fase de grupos con clasificación cómoda",
        "Eliminatorias con control del mediocampo y solidez defensiva",
        `Final ante Argentina: marcador ${WORLD_CUP_FINAL.score}`,
      ]},
      { type: "link", href: `/partido/${WORLD_CUP_FINAL.slug}`, label: "Ver ficha de la final España vs Argentina", hint: "Estadísticas, sede y retransmisión" },
      { type: "link", href: "/liga/copa-del-mundo-fifa", label: "Cuadro completo del Mundial" },
      { type: "p", content: "Consulta goles y cronología en la ficha del partido cuando ESPN los publique." },
    ],
  },
  {
    slug: "final-mundial-2026-hoy",
    title: "Final del Mundial 2026: España 1-0 Argentina",
    description: "Resumen de la final del Mundial 2026: España venció a Argentina 1-0 en MetLife Stadium. Marcador, sede y enlace a la ficha.",
    publishedAt: "2026-07-19T23:00:00.000Z",
    updatedAt: "2026-07-20T10:30:00.000Z",
    category: "Mundial 2026",
    tags: ["mundial-2026", "final", "españa", "argentina"],
    coverEmoji: "⚽",
    relatedMatchSlug: WORLD_CUP_FINAL.slug,
    body: [
      { type: "p", content: `La final del Mundial 2026 enfrentó a ${WORLD_CUP_FINAL.home} y ${WORLD_CUP_FINAL.away} en ${WORLD_CUP_FINAL.venue} (New Jersey). España se impuso ${WORLD_CUP_FINAL.score} y se coronó campeona del mundo.` },
      { type: "h2", content: "Datos del partido" },
      { type: "ul", items: [
        `Marcador final: ${WORLD_CUP_FINAL.home} ${WORLD_CUP_FINAL.score} ${WORLD_CUP_FINAL.away}`,
        `Sede: ${WORLD_CUP_FINAL.venue}, ${WORLD_CUP_FINAL.country}`,
        "Estado: FINALIZADO",
        "Competición: Copa del Mundo FIFA",
      ]},
      { type: "link", href: `/partido/${WORLD_CUP_FINAL.slug}`, label: "Ir a la ficha completa del partido", hint: "Minuto a minuto, stats y dónde se transmitió" },
      { type: "h2", content: "Qué ver en Dónde Juega" },
      { type: "ul", items: [
        "Marcador y estado FINALIZADO",
        "Cronología de goles y tarjetas (cuando ESPN la publique)",
        "Horario en tu zona y sede",
        "Canales según región",
      ]},
      { type: "p", content: "Datos de marcadores y horarios verificados con ESPN." },
    ],
  },
  {
    slug: "espana-mundial-2026-equipo",
    title: "España en el Mundial 2026: plantilla, partidos y horarios",
    description: "Agenda de La Roja en el Mundial 2026, incluido el título: final 1-0 ante Argentina.",
    publishedAt: "2026-07-12T09:00:00.000Z",
    updatedAt: "2026-07-20T10:30:00.000Z",
    category: "Mundial 2026",
    tags: ["mundial-2026", "españa"],
    coverEmoji: "👕",
    relatedMatchSlug: WORLD_CUP_FINAL.slug,
    body: [
      { type: "p", content: `Sigue todos los partidos de España en el Mundial 2026 desde Dónde Juega. La Roja cerró el torneo como campeona tras el ${WORLD_CUP_FINAL.score} ante Argentina en la final.` },
      { type: "link", href: `/partido/${WORLD_CUP_FINAL.slug}`, label: "Final: España vs Argentina", hint: WORLD_CUP_FINAL.score },
      { type: "h2", content: "Enlaces útiles" },
      { type: "link", href: "/liga/copa-del-mundo-fifa", label: "Calendario y cuadro del Mundial" },
      { type: "link", href: "/resultados?deporte=futbol&torneo=soccer/fifa.world&anio=2026", label: "Resultados del torneo 2026" },
      { type: "link", href: "/futbol-hoy", label: "Fútbol hoy" },
    ],
  },
];

export function getAllPosts() {
  return [...blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}
