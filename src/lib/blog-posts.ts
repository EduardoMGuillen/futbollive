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
  {
    slug: "knicks-campeones-nba-2026",
    title: "Knicks campeones NBA 2026: resumen de la Final ante Spurs",
    description: "New York Knicks ganan su primer título desde 1973: 4-1 ante San Antonio Spurs. Brunson MVP con 45 puntos en el Game 5.",
    publishedAt: "2026-06-14T08:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "NBA",
    tags: ["nba", "knicks", "finales", "brunson"],
    coverEmoji: "🏀",
    body: [
      { type: "p", content: "Los New York Knicks se coronaron campeones de la NBA 2026 al vencer a los San Antonio Spurs 4-1 en las Finales. El título llega 53 años después del último anillo de la franquicia (1973) y cierra una postemporada dominada por las remontadas." },
      { type: "h2", content: "Cómo se decidió la serie" },
      { type: "ul", items: [
        "Game 1: Knicks 105–95 Spurs (New York abre con victoria de visitante)",
        "Game 2: Knicks 105–104 Spurs (margen mínimo)",
        "Game 3: Spurs 115–111 Knicks (San Antonio evita el barrido)",
        "Game 4: Knicks 107–106 Spurs (remontada histórica en Madison Square Garden)",
        "Game 5: Knicks 94–90 Spurs (13 de junio) — cierran el título en Texas",
      ]},
      { type: "h2", content: "Brunson, MVP de las Finales" },
      { type: "p", content: "Jalen Brunson fue elegido MVP unánime tras anotar 45 puntos en el Game 5, incluyendo una racha decisiva en el último cuarto. Es uno de los pocos jugadores en la historia con 45+ puntos en un partido de cierre de Finales." },
      { type: "link", href: "/deporte/baloncesto", label: "Agenda de baloncesto en Dónde Juega", hint: "NBA, EuroLeague y más" },
      { type: "link", href: "/baloncesto-hoy", label: "Baloncesto hoy", hint: "Partidos del día en tu hora local" },
      { type: "p", content: "Fuentes: ESPN, Wikipedia (2026 NBA Finals) y cobertura oficial de la serie." },
    ],
  },
  {
    slug: "mlb-all-star-2026-resultado",
    title: "MLB All-Star 2026: la Americana gana 4-0 en Filadelfia",
    description: "AL 4-0 NL en Citizens Bank Park. Shutout histórico, MVP Cody Bellinger y 15 ponches del staff americano.",
    publishedAt: "2026-07-15T06:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "MLB",
    tags: ["mlb", "all-star", "yankees", "beisbol"],
    coverEmoji: "⚾",
    body: [
      { type: "p", content: "La Liga Americana derrotó 4-0 a la Nacional en el Juego de Estrellas 2026, disputado el 14 de julio en Citizens Bank Park (Filadelfia). Fue el primer shutout en un All-Star desde 2013." },
      { type: "h2", content: "Claves del partido" },
      { type: "ul", items: [
        "Marcador final: American League 4 – National League 0",
        "Tres carreras en la primera entrada ante Cristopher Sánchez",
        "Cody Bellinger (Yankees): sencillo de 2 RBI y MVP del juego",
        "Ben Rice: RBI adicional en la primera; Miguel Vargas: jonrón solitario en la octava",
        "11 pitchers de la AL permitieron solo 3 hits y 15 strikeouts",
      ]},
      { type: "h2", content: "Qué sigue en la temporada" },
      { type: "p", content: "Tras el Midsummer Classic, la MLB retoma el calendario regular. En Dónde Juega puedes ver horarios locales, marcadores en vivo y dónde se transmite cada serie." },
      { type: "link", href: "/deporte/beisbol", label: "Calendario de béisbol / MLB", hint: "Partidos, sedes y transmisiones" },
      { type: "link", href: "/beisbol-hoy", label: "Béisbol hoy" },
      { type: "p", content: "Datos verificados con MLB.com, CBS Sports y Wikipedia (2026 MLB All-Star Game)." },
    ],
  },
  {
    slug: "f1-2026-clasificacion-antonelli",
    title: "F1 2026: Antonelli lidera el Mundial tras Bélgica",
    description: "Clasificación actual de Fórmula 1: Kimi Antonelli 204 pts, Hamilton 159, Russell 154. Mercedes manda en constructores.",
    publishedAt: "2026-07-20T14:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "Fórmula 1",
    tags: ["f1", "antonelli", "mercedes", "hamilton"],
    coverEmoji: "🏎️",
    body: [
      { type: "p", content: "Tras el Gran Premio de Bélgica, Andrea Kimi Antonelli (Mercedes) encabeza el Campeonato de Pilotos 2026 con 204 puntos. Lewis Hamilton (Ferrari) es segundo con 159 y George Russell (Mercedes) tercero con 154." },
      { type: "h2", content: "Top 10 de pilotos (actualizado 20 jul 2026)" },
      { type: "ul", items: [
        "1. Kimi Antonelli (Mercedes) — 204",
        "2. Lewis Hamilton (Ferrari) — 159",
        "3. George Russell (Mercedes) — 154",
        "4. Charles Leclerc (Ferrari) — 126",
        "5. Lando Norris (McLaren) — 103",
        "6. Oscar Piastri (McLaren) — 92",
        "7. Max Verstappen (Red Bull) — 91",
        "8. Isack Hadjar (Red Bull) — 60",
        "9. Pierre Gasly (Alpine) — 42",
        "10. Liam Lawson (Racing Bulls) — 39",
      ]},
      { type: "h2", content: "Constructores y calendario" },
      { type: "p", content: "Mercedes lidera el Mundial de Constructores con 358 puntos, por delante de Ferrari (285) y McLaren (195). El siguiente gran premio en el calendario europeo es Hungría (24–26 de julio)." },
      { type: "link", href: "/deporte/automovilismo", label: "Agenda de automovilismo", hint: "F1 y más series" },
      { type: "link", href: "/automovilismo-hoy", label: "Automovilismo hoy" },
      { type: "p", content: "Fuentes: Sky Sports F1 standings y Motorsport.com (actualización julio 2026)." },
    ],
  },
  {
    slug: "liga-mx-apertura-2026-jornada-2",
    title: "Liga MX Apertura 2026: horarios de la Jornada 2",
    description: "Calendario completo de la Jornada 2: Cruz Azul–Puebla, Toluca–Pumas, Atlante–América, Chivas y más. Horarios CDMX y TV.",
    publishedAt: "2026-07-20T18:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "Liga MX",
    tags: ["liga-mx", "apertura-2026", "mexico", "futbol"],
    coverEmoji: "🇲🇽",
    body: [
      { type: "p", content: "La Jornada 2 del Apertura 2026 arranca el martes 21 de julio con partidos adelantados de Cruz Azul y Toluca, que el fin de semana disputarán el Campeón de Campeones. Aquí el calendario con hora de Ciudad de México." },
      { type: "h2", content: "Martes 21 de julio" },
      { type: "ul", items: [
        "Cruz Azul vs Puebla — 19:00 · Estadio Azteca",
        "Toluca vs Pumas UNAM — 21:00 · Estadio Nemesio Díez",
      ]},
      { type: "h2", content: "Viernes 24 a domingo 26" },
      { type: "ul", items: [
        "Viernes: Tijuana vs León · Atlante vs América (Azteca, 21:00)",
        "Sábado: Guadalajara vs Juárez (Akron) · Santos vs Atlas · Tigres vs Atlético San Luis",
        "Domingo: Necaxa vs Monterrey · Pachuca vs Querétaro",
      ]},
      { type: "h2", content: "Cómo seguirlo en Dónde Juega" },
      { type: "p", content: "Cada partido muestra hora local automática, sede y opciones de transmisión según tu país. Guarda a tu club en favoritos para recibir recordatorios." },
      { type: "link", href: "/liga/liga-mx", label: "Landing Liga MX", hint: "Tabla, próximos partidos y resultados" },
      { type: "link", href: "/futbol-hoy", label: "Fútbol hoy" },
      { type: "p", content: "Horarios basados en cobertura de MARCA MX y BolaVip (julio 2026)." },
    ],
  },
  {
    slug: "ufc-ankalaev-guskov-abu-dhabi-2026",
    title: "UFC Fight Night Abu Dhabi: Ankalaev vs Guskov (25 jul)",
    description: "Cartel principal del UFC Fight Night del 25 de julio en Etihad Arena. Horarios ET/CDMX y cómo seguirlo.",
    publishedAt: "2026-07-21T11:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "UFC",
    tags: ["ufc", "mma", "ankalaev", "abu-dhabi"],
    coverEmoji: "🥊",
    body: [
      { type: "p", content: "El sábado 25 de julio de 2026, UFC Fight Night regresa a Etihad Arena (Abu Dhabi) con Magomed Ankalaev vs Bogdan Guskov en el combate estelar. El evento se transmite en vivo (sin PPV) según la ventana regional de Paramount+ / partners locales." },
      { type: "h2", content: "Horarios orientativos" },
      { type: "ul", items: [
        "Preliminares: ~9:00 a.m. ET",
        "Cartel principal: ~12:00 p.m. ET (aprox. 10:00 a.m. Ciudad de México)",
        "Sede: Etihad Arena, Yas Island, Emiratos Árabes Unidos",
      ]},
      { type: "h2", content: "Por qué importa" },
      { type: "p", content: "Ankalaev busca reafirmarse en el peso semipesado; Guskov llega como contendiente peligroso. Revisa la ficha del evento en Dónde Juega para hora local exacta y estado en vivo el día del combate." },
      { type: "link", href: "/deporte/mma", label: "Agenda MMA / UFC", hint: "Próximas pelea y resultados" },
      { type: "link", href: "/mma-hoy", label: "MMA hoy" },
      { type: "p", content: "Fuente: UFC.com (UFC Fight Night Ankalaev vs Guskov) y calendario 2026." },
    ],
  },
  {
    slug: "valorant-champions-2026-shanghai",
    title: "Valorant Champions 2026 en Shanghái: fechas y formato",
    description: "Guía del mundial de Valorant: 24 sep – 18 oct en Shanghái, 16 equipos y prize pool de $2.25M. Cómo seguirlo.",
    publishedAt: "2026-07-18T16:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "Valorant",
    tags: ["valorant", "vct", "champions", "esports"],
    coverEmoji: "🎯",
    body: [
      { type: "p", content: "VALORANT Champions 2026, el evento cumbre del VCT, se celebrará en Shanghái (China) del 24 de septiembre al 18 de octubre. Habrá 16 equipos (cuatro por región: Americas, EMEA, Pacific y China) y un prize pool de 2,25 millones de dólares." },
      { type: "h2", content: "Formato esperado" },
      { type: "ul", items: [
        "Fase de grupos: cuatro grupos estilo GSL (doble eliminación), Bo3",
        "Playoffs: bracket de 8 equipos en doble eliminación",
        "Lower Bracket Final y Grand Final en Bo5",
        "Clasificación vía Stage 2 de cada liga internacional + Championship Points",
      ]},
      { type: "h2", content: "Qué pasa antes" },
      { type: "p", content: "Entre julio y septiembre se disputan los Stage 2 regionales (Americas con finales en São Paulo, EMEA, Pacific y China). Esos playoffs definen gran parte del cupo a Champions." },
      { type: "link", href: "/esports/valorant", label: "Partidos de Valorant", hint: "Agenda y resultados VCT" },
      { type: "link", href: "/esports", label: "Hub de esports", hint: "Valorant, LoL y CS2" },
      { type: "p", content: "Fuentes: Liquipedia VALORANT Champions 2026 y calendario VCT 2026." },
    ],
  },
  {
    slug: "hle-campeon-msi-2026",
    title: "HLE campeón del MSI 2026: final 3-2 ante BLG",
    description: "Hanwha Life Esports gana el Mid-Season Invitational 2026 en Daejeon. Zeus MVP. Impacto en Worlds 2026.",
    publishedAt: "2026-07-13T09:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "League of Legends",
    tags: ["lol", "msi", "hle", "blg", "esports"],
    coverEmoji: "⚔️",
    body: [
      { type: "p", content: "Hanwha Life Esports se proclamó campeón del MSI 2026 al derrotar 3-2 a Bilibili Gaming en la gran final del 12 de julio en Daejeon (Corea del Sur). Es el primer título MSI de la organización LCK." },
      { type: "h2", content: "La final y el MVP" },
      { type: "ul", items: [
        "Serie Bo5 completa: HLE toma ventaja, BLG empata 2-1 y HLE cierra 3-2",
        "Zeus nombrado MVP de la final (picks clave como Swain y Dr. Mundo)",
        "Zeus se une a Faker como jugador con MVP de Worlds y de MSI",
        "BLG queda a las puertas del ‘Golden Road’ tras un año dominante en LPL",
      ]},
      { type: "h2", content: "Consecuencias para Worlds 2026" },
      { type: "p", content: "La victoria de HLE asegura un cuarto cupo de Worlds para la LCK (y otro para LPL como finalista). Worlds 2026 se jugará en Norteamérica (15 oct – 14 nov), con final en Barclays Center, Brooklyn." },
      { type: "link", href: "/esports/league-of-legends", label: "Agenda League of Legends", hint: "Partidos LCK, LPL y más" },
      { type: "link", href: "/esports", label: "Todos los esports" },
      { type: "p", content: "Fuentes: Dot Esports, Sheep Esports y LoL Esports (MSI / Worlds 2026)." },
    ],
  },
  {
    slug: "donde-ver-nba-hoy-latinoamerica",
    title: "Dónde ver la NBA hoy en Latinoamérica",
    description: "Guía práctica para saber horarios locales y canales de la NBA en México, Argentina, Colombia y más con Dónde Juega.",
    publishedAt: "2026-07-08T15:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "Guías",
    tags: ["nba", "guia", "latinoamerica", "transmision"],
    coverEmoji: "📺",
    body: [
      { type: "p", content: "La pregunta ‘dónde ver la NBA hoy’ cambia según tu país y la ventana de derechos. En Dónde Juega centralizamos el horario en tu zona, el estado del partido (próximo, en vivo o finalizado) y las plataformas oficiales cuando están disponibles." },
      { type: "h2", content: "Pasos rápidos" },
      { type: "ul", items: [
        "Entra a Baloncesto hoy o a la landing de NBA/baloncesto",
        "Abre la ficha del partido que te interesa",
        "Revisa la sección ‘Dónde se transmite’ (canales y apps legales)",
        "Guarda el partido o el equipo en favoritos para un recordatorio local",
      ]},
      { type: "h2", content: "Después de las Finales 2026" },
      { type: "p", content: "Con los Knicks campeones, la offseason y el draft concentran la atención hasta la pretemporada. Mientras tanto, puedes seguir EuroLeague y otras ligas de baloncesto en la misma agenda." },
      { type: "link", href: "/baloncesto-hoy", label: "Ver baloncesto hoy" },
      { type: "link", href: "/blog/knicks-campeones-nba-2026", label: "Leer: Knicks campeones NBA 2026" },
      { type: "p", content: "No enlazamos señales pirata: solo información de broadcasters oficiales reportados por fuentes deportivas." },
    ],
  },
  {
    slug: "esports-hoy-valorant-lol-cs2",
    title: "Esports hoy: cómo seguir Valorant, LoL y CS2",
    description: "Agenda unificada de esports: series BO, marcadores en vivo y páginas de equipos/jugadores en Dónde Juega.",
    publishedAt: "2026-07-16T12:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "Esports",
    tags: ["esports", "valorant", "lol", "cs2", "guia"],
    coverEmoji: "🎮",
    body: [
      { type: "p", content: "Si buscas ‘esports hoy’, Dónde Juega agrupa Valorant, League of Legends y Counter-Strike 2 con hora local, estado de la serie (BO1/BO3/BO5) y enlaces a fichas de equipo o jugador." },
      { type: "h2", content: "Qué encontrarás" },
      { type: "ul", items: [
        "Hub /esports con los tres títulos principales",
        "Landings por juego con partidos en vivo y próximos",
        "Páginas de roster y jugadores (datos PandaScore)",
        "Actualización de marcadores durante las series",
      ]},
      { type: "h2", content: "Temporada 2026 en resumen" },
      { type: "p", content: "Tras el MSI (HLE campeón), LoL mira a Worlds en EE. UU. Valorant acelera Stage 2 rumbo a Champions Shanghái. CS2 mantiene circuito BLAST/ESL en el segundo semestre." },
      { type: "link", href: "/esports", label: "Abrir hub de esports" },
      { type: "link", href: "/blog/hle-campeon-msi-2026", label: "Crónica MSI 2026" },
      { type: "link", href: "/blog/valorant-champions-2026-shanghai", label: "Guía Champions Valorant" },
    ],
  },
  {
    slug: "f1-hungria-2026-previa",
    title: "GP de Hungría 2026: previa y cómo verlo",
    description: "Hungaroring, 24–26 de julio. Antonelli llega líder; horarios orientativos y enlaces a la agenda de F1.",
    publishedAt: "2026-07-21T10:00:00.000Z",
    updatedAt: "2026-07-21T12:00:00.000Z",
    category: "Fórmula 1",
    tags: ["f1", "hungria", "hungaroring", "previa"],
    coverEmoji: "🇭🇺",
    body: [
      { type: "p", content: "El Gran Premio de Hungría 2026 se disputa el fin de semana del 24 al 26 de julio en el Hungaroring. Es la siguiente cita tras Spa y un circuito histórico de baja media de adelantamientos, donde la clasificación del sábado suele ser decisiva." },
      { type: "h2", content: "Contexto del campeonato" },
      { type: "ul", items: [
        "Kimi Antonelli llega como líder del Mundial de Pilotos",
        "Mercedes lidera constructores; Ferrari y McLaren persiguen",
        "Hamilton busca recortar diferencia tras su victoria en Barcelona",
      ]},
      { type: "h2", content: "Cómo seguir la carrera" },
      { type: "p", content: "Consulta la sesión (FP, clasificación o carrera) en la agenda de automovilismo. La ficha del evento convierte el horario a tu zona y muestra el estado en vivo cuando arranca." },
      { type: "link", href: "/deporte/automovilismo", label: "Ver automovilismo / F1" },
      { type: "link", href: "/blog/f1-2026-clasificacion-antonelli", label: "Clasificación actual del Mundial" },
      { type: "p", content: "Calendario basado en el schedule FIA / Sporting News 2026." },
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

export function getBlogCategories() {
  return Array.from(new Set(blogPosts.map((post) => post.category))).sort((a, b) => a.localeCompare(b, "es"));
}

export function getBlogMonths() {
  const months = new Set(
    blogPosts.map((post) => post.publishedAt.slice(0, 7)),
  );
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function formatBlogMonth(ym: string) {
  const [year, month] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const label = date.toLocaleDateString("es-419", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
