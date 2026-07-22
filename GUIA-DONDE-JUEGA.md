# Dónde Juega — Guía completa del proyecto

Última actualización: 21 de julio de 2026.

Este documento describe qué contiene Dónde Juega, cómo funciona, cómo se ejecuta, cómo se despliega y cómo se mantiene. También sirve como plantilla para reconstruir o ampliar el proyecto.

> Sitio: `https://dondejuega.com`
>
> Repositorio local: `futbolive`
>
> Stack principal: Next.js 16, React 19, TypeScript, ESPN, TheSportsDB, PandaScore, Vercel y **Supabase obligatorio en producción**.

---

## 1. Objetivo del sitio

Dónde Juega es una guía deportiva para consultar:

- Eventos en vivo.
- Próximos partidos y eventos.
- Resultados recientes e históricos.
- Horarios convertidos a la zona horaria del visitante.
- Marcadores y estado en vivo.
- Goles, anotaciones, tarjetas y otras incidencias cuando la fuente las entrega.
- Estadísticas, líderes, parciales, clasificaciones, carteleras y rosters.
- Canales y plataformas oficiales de transmisión.
- Equipos, atletas, pilotos y jugadores de esports.
- Valorant, League of Legends y Counter-Strike 2.
- Favoritos locales sin crear una cuenta.
- Recordatorios mediante notificaciones del navegador.

El sitio no aloja ni retransmite señales deportivas. Los enlaces de transmisión deben dirigir a plataformas oficiales o destinos verificados.

---

## 2. Tecnologías

### Aplicación

- Next.js `16.2.10` con App Router.
- React y React DOM `19.2.4`.
- TypeScript `5.9.3` en modo estricto.
- CSS global propio.
- Tailwind CSS 4 disponible mediante PostCSS.
- Lucide React para iconos.
- Motion instalado para animaciones.
- Zod para validación de formularios y APIs.

### Datos y servicios

- ESPN: agenda, resultados, marcadores, detalles y estadísticas.
- TheSportsDB: fuente complementaria y alineaciones.
- PandaScore: Valorant, League of Legends y CS2.
- Supabase: **persistencia compartida obligatoria en Vercel** (tabla `site_state`).
- JSON local: almacenamiento de desarrollo y respaldo de build.
- Vercel: hosting, funciones y cron cada 2 horas.
- GitHub Actions: sincronización cada 30 minutos (+ manual).
- Middleware: redirección permanente `www` → apex.

### Medición y monetización

- Google Analytics 4.
- Google AdSense.
- `ads.txt`.
- Espacios publicitarios propios cuando AdSense no llena una posición.

---

## 3. Scripts

Definidos en `package.json`:

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm test
```

Uso:

| Comando | Función |
|---|---|
| `npm run dev` | Servidor local de Next.js |
| `npm run build` | Build optimizada de producción |
| `npm start` | Ejecuta la build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica TypeScript sin emitir archivos |
| `npm test` | Ejecuta Vitest |

Instalación recomendada:

```bash
npm ci
```

---

## 4. Variables de entorno

La plantilla está en `.env.example`. En desarrollo se utiliza `.env.local`. En producción deben configurarse en Vercel.

```dotenv
ADMIN_USER=
ADMIN_PASSWORD=
AUTH_SECRET=

THESPORTSDB_API_KEY=
PANDASCORE_TOKEN=

CRON_SECRET=
SITE_TIMEZONE=America/Mexico_City
NEXT_PUBLIC_SITE_URL=https://dondejuega.com

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_SITE_VERIFICATION=

NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_TOP=
NEXT_PUBLIC_ADSENSE_SLOT_FEED=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
NEXT_PUBLIC_ADSENSE_SLOT_DETAIL=
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=
```

### Descripción

| Variable | Obligatoria | Uso |
|---|---:|---|
| `ADMIN_USER` | Sí en producción | Usuario del panel |
| `ADMIN_PASSWORD` | Sí en producción | Contraseña del panel |
| `AUTH_SECRET` | Sí en producción | Firma HMAC de sesiones |
| `THESPORTSDB_API_KEY` | Recomendable | Eventos y alineaciones complementarias |
| `PANDASCORE_TOKEN` | Para esports | Valorant, LoL y CS2 |
| `CRON_SECRET` | **Sí** (Vercel + GitHub) | Protege `/api/admin/sync` (Bearer) |
| `SITE_TIMEZONE` | Opcional | Zona para `/api/health` (default `America/Mexico_City`) |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL canónica (`https://dondejuega.com`) |
| `SUPABASE_URL` | **Sí en Vercel** | Persistencia compartida entre instancias |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sí en Vercel** | Acceso servidor a Supabase (nunca `NEXT_PUBLIC_`) |
| `GOOGLE_SITE_VERIFICATION` | Opcional | Verificación de Search Console |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Para anuncios | ID `ca-pub-*` |
| `NEXT_PUBLIC_ADSENSE_SLOT_*` | Para anuncios | IDs de cada bloque |

### Seguridad

- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.
- No guardar `.env.local` en Git.
- No depender de las credenciales de respaldo definidas en el código.
- Configurar contraseñas y secretos largos y únicos.
- Rotar `AUTH_SECRET`, `ADMIN_PASSWORD` y `CRON_SECRET` si se filtran.
- `CRON_SECRET` debe ser **el mismo valor** en Vercel (Production) y en GitHub → Secrets → Actions.
- Tras añadir o cambiar variables en Vercel: **Redeploy** obligatorio.

---

## 5. Estructura del proyecto

```text
futbolive/
├── .github/workflows/sync.yml
├── data/store.json
├── public/
│   ├── manifest.webmanifest
│   └── recursos estáticos
├── src/
│   ├── middleware.ts          # www → apex (308)
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/sync/
│   │   │   ├── health/        # probe uptime + lastSync local
│   │   │   ├── live/
│   │   │   ├── events/
│   │   │   ├── results/
│   │   │   └── search/
│   │   ├── [sportToday]/      # /futbol-hoy, /nba-hoy, etc.
│   │   ├── atleta/[slug]/
│   │   ├── blog/
│   │   ├── buscar/
│   │   ├── contacto/
│   │   ├── dashboard/
│   │   ├── deporte/[slug]/
│   │   ├── deportes/
│   │   ├── en-vivo/
│   │   ├── equipo/[slug]/
│   │   ├── esports/
│   │   ├── favoritos/
│   │   ├── liga/[slug]/
│   │   ├── llms.txt/
│   │   ├── login/
│   │   ├── partido/[slug]/
│   │   ├── privacidad/
│   │   ├── resultados/
│   │   ├── terminos/
│   │   ├── vs/[slug]/
│   │   ├── acerca-de/
│   │   ├── ads.txt/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── BlogFilters.tsx
│   │   ├── event-details/
│   │   └── …
│   └── lib/
│       ├── blog-posts.ts
│       ├── sync.ts
│       ├── store.ts
│       └── …
├── supabase/schema.sql
├── next.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 6. Modelo de datos

Definido en `src/lib/types.ts`.

### `StoreData`

```ts
interface StoreData {
  events: SportsEvent[];
  banners: Banner[];
  settings: SiteSettings;
}
```

### `SportsEvent`

Es el formato normalizado común para ESPN, TheSportsDB, PandaScore, eventos manuales y datos demo.

Campos principales:

- `id`: identidad estable interna.
- `slug`: URL de detalle.
- `sport` y `sportSlug`.
- `league` y `leagueSlug`.
- `format`: `versus` o `multi`.
- `eventName`: nombre editorial del evento.
- `home` y `away`.
- `participants`: clasificación de eventos de múltiples participantes.
- `startsAt`: fecha ISO en UTC.
- `status`: `live`, `upcoming` o `finished`.
- `minute`: reloj, periodo o estado visible.
- `venue` y `country`.
- `importance`: prioridad editorial.
- `featured`: destacado.
- `hidden`: oculto públicamente.
- `excludedFromLive`: excluido de secciones destacadas.
- `description`.
- `homeLineup` y `awayLineup`.
- `broadcasts`.
- `bestOf`: BO de esports.
- `source`: `espn`, `thesportsdb`, `pandascore`, `manual` o `demo`.
- IDs y ruta de origen.
- `updatedAt`.

### Participantes

Un participante contiene:

- Nombre.
- Slug.
- Logo o imagen.
- Marcador.

Los participantes múltiples pueden incluir:

- Posición.
- Estado de ganador.

### Detalles

`EventDetails` puede contener:

- Participantes detallados.
- Segmentos: sets, entradas, cuartos, periodos o mapas.
- Estadísticas agrupadas.
- Líderes.
- Cartelera de combates.
- Clasificación o leaderboard.
- Alineaciones y rosters.
- Jugadas recientes.
- Cronología estructurada.
- Probabilidades informativas.
- Opciones de transmisión.

---

## 7. Almacenamiento

Implementado en `src/lib/store.ts`.

### Orden de lectura

1. Supabase, si existen URL y service role.
2. Memoria del proceso si contiene una copia más reciente.
3. `data/store.json`.
4. Datos demo de `src/lib/seed.ts`.

### Escritura

1. Actualiza la copia en memoria.
2. Intenta un `upsert` en Supabase.
3. Si no hay Supabase, intenta escribir `data/store.json.tmp`.
4. Renombra el archivo temporal a `data/store.json`.
5. Si el filesystem es de solo lectura, conserva la copia del proceso.

### Supabase

Schema en `supabase/schema.sql`:

```sql
create table public.site_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
```

- La fila principal usa `id = 'main'`.
- RLS está habilitado.
- No existen políticas públicas.
- El servidor utiliza la service role.

### Importante para Vercel

**Sin Supabase el sitio se degrada:**

- El filesystem de Vercel es de solo lectura / efímero.
- La memoria **no se comparte** entre instancias serverless.
- Una sync puede actualizar una instancia y `/api/health` leer otra con `store.json` viejo del build.
- `/api/health` reportará `"storage": "file-or-build"` y `syncStale: true`.

**Con Supabase (obligatorio en producción):**

1. Crear tabla `site_state` (ver `supabase/schema.sql`).
2. Configurar `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` en Vercel **Production**.
3. Redeploy.
4. Verificar `https://dondejuega.com/api/health` → `"storage":"supabase"` y `syncStale:false`.

Si el `upsert` a Supabase falla, `writeStore` lanza error (ya no se traga el fallo en silencio).

---

## 8. Estados y visibilidad

Los estados se recalculan al leer el store (`refreshTemporalStatuses`).

### Duración estimada (`heuristicFinishMs` / `eventDurationMs`)

| Tipo | Duración |
|---|---:|
| Multi-participante | 5 días |
| Esports | 70 minutos por mapa + 1 hora |
| Cricket | 12 horas |
| Béisbol | **4,5 horas** |
| MMA | 5 horas |
| General | 3 horas |

### Reglas

- Un estado reciente de ESPN o PandaScore (< 2 min) tiene prioridad.
- ESPN puede pasar automáticamente a “en vivo” por hora.
- PandaScore solo pasa a “en vivo” cuando la fuente lo confirma.
- **TheSportsDB**: no se fuerza “en vivo” durante toda la ventana; si lleva >3 h en vivo **sin marcador**, se marca finalizado (evita MLB fantasma 0–0).
- Tras `runSync()`, se **eliminan duplicados TheSportsDB** cuando ESPN/PandaScore ya tienen el mismo cruce (home|away|fecha).
- Los eventos finalizados recientes continúan visibles hasta 6 horas después del final estimado (48 h en torneos top).
- El archivo de resultados consulta directamente a la fuente.

---

## 9. Fuentes de datos

## 9.1 ESPN

Archivo: `src/lib/espn.ts`.

No requiere API key.

Endpoints principales:

```text
https://site.api.espn.com/apis/site/v2/sports/{ruta}/scoreboard
https://site.api.espn.com/apis/site/v2/sports/{ruta}/summary?event={id}
```

### Deportes

El catálogo incluye:

- Fútbol internacional y clubes.
- Baloncesto.
- Béisbol.
- Fútbol americano.
- Hockey.
- Rugby.
- Cricket.
- Lacrosse.
- Tenis.
- Fórmula 1, IndyCar y NASCAR.
- UFC, PFL y otros combates.
- Golf.

### Adaptadores

- Equipo contra equipo.
- Tenis individual.
- Combates.
- Automovilismo.
- Golf.

### Datos normalizados

- Horario.
- Estado.
- Marcador.
- Logos.
- Sede.
- Competición.
- Broadcasters.
- Participantes.
- Clasificación.

### Caché y tamaño de respuestas ESPN

- Los scoreboards usan `cache: "no-store"` (Next.js no puede cachear ítems > **2 MB**).
- Ventanas largas (p. ej. 30+160 días) rompían el build con WTA/MLS de 3–7 MB.
- `fetchEspnLeagueCalendar` trocea en bloques de **10 días** y limita por defecto a ~14 atrás / 45 adelante.
- Perfiles `/equipo` y `/atleta` son **`force-dynamic`** (no SSG masivo con calendarios ESPN).
- Sync global usa ventanas cortas por liga (`dateWindowDays`).

### Resultados

El archivo histórico consulta los doce meses del año seleccionado en grupos de tres.

---

## 9.2 Detalles ESPN

Archivo: `src/lib/espn-details.ts`.

Normaliza:

- Parciales.
- Sets.
- Entradas.
- Cuartos.
- Estadísticas de equipos y jugadores.
- Líderes.
- Rosters.
- Jugadas recientes.
- Probabilidades.
- Peleas de una cartelera.
- Clasificación de carreras y golf.
- Cronología del partido.

### Cronología

Cuando ESPN lo proporciona, muestra:

- Gol.
- Autogol.
- Gol de penal.
- Penal fallado.
- Tarjeta amarilla.
- Tarjeta roja.
- Sustitución.
- Touchdown.
- Gol de campo.
- Safety.
- Minuto o reloj.
- Autor.
- Asistencia.
- Equipo.

Si no existen incidencias, la sección no se muestra.

---

## 9.3 TheSportsDB

Archivo: `src/lib/thesportsdb.ts`.

Endpoint:

```text
https://www.thesportsdb.com/api/v1/json/{key}/eventsday.php
```

Función:

- Complementar eventos.
- Obtener alineaciones de algunos eventos.
- Aportar logos, descripciones, sede y país.

Ventana:

- Hoy y los siguientes dos días UTC.

Caché:

- Eventos: 30 minutos.
- Alineaciones: 15 minutos.

ESPN tiene prioridad si ambas fuentes representan el mismo enfrentamiento.

---

## 9.4 PandaScore

Archivo: `src/lib/pandascore.ts`.

Requiere:

```dotenv
PANDASCORE_TOKEN=
```

API:

```text
https://api.pandascore.co
```

Juegos:

- Valorant.
- League of Legends.
- Counter-Strike 2.

### Sincronización normal

Por juego:

- 50 próximos.
- 50 en vivo.
- 25 resultados recientes.

### Datos

- Equipos.
- Logos.
- Marcador de serie.
- Estado.
- BO1, BO3 o BO5.
- Mapa actual aproximado.
- Liga, serie y torneo.
- Tier del torneo.
- Streams oficiales.
- Roster.
- Jugadores, roles y nacionalidad.

### Limitación del plan gratuito

El plan gratuito entrega calendario, estado, resultados, rosters y streams, pero no necesariamente:

- Kills en vivo.
- Economía.
- Rondas detalladas.
- Oro.
- Estadísticas internas de mapa en tiempo real.

No deben inventarse datos que la API no proporcione.

---

## 10. Sincronización

Archivo: `src/lib/sync.ts`.

### `runSync()`

Ejecuta en paralelo:

1. ESPN.
2. TheSportsDB.
3. PandaScore.

Después:

- Normaliza los datos.
- Evita duplicados básicos (matchup key).
- **Elimina eventos TheSportsDB** si ESPN/PandaScore ya cubren el mismo partido.
- Conserva configuración editorial.
- Conserva alineaciones y broadcasts anteriores si la fuente nueva no los entrega.
- Protege marcadores actualizados recientemente (< 5 min).
- Elimina eventos demo cuando hay datos reales.
- Poda resultados antiguos.
- Actualiza `settings.lastSync` (ISO **UTC**).

### Retención

- Resultado normal: 3 días en el store.
- Eventos con importancia igual o superior a 97: 21 días.
- Eventos manuales: no se eliminan automáticamente.
- La sección `/resultados` puede consultar años anteriores sin guardarlos todos.

### Actualización automática en SSR

`ensureFreshEvents(maxAgeMinutes = 30)`:

- Si los datos están frescos, no hace nada.
- Si están viejos, lanza `runSync()` en background.
- El SSR **espera como máximo 2,5 s** (no bloquea minutos).
- Crawlers de Google/AdSense (`Mediapartners-Google`, `Googlebot`, etc.): **no esperan**; solo disparan sync en background.

`ensureLiveScores()`:

- Tope de espera ~1,5 s.
- Crawlers: no ejecutan refresh de live.

Esto evita el rechazo de AdSense por “sitio no disponible” cuando el home se quedaba colgado sincronizando ~100 ligas ESPN.

---

## 11. Marcadores en vivo

### Servidor

`updateLiveEvents()` actualiza candidatos ESPN y PandaScore.

Un candidato:

- Está en vivo, o
- Está dentro de su ventana estimada, o
- Comenzará en los próximos 30 minutos.

Actualiza:

- Estado.
- Minuto o periodo.
- Marcador.
- Participantes.
- Broadcasts.
- `updatedAt`.

### Cliente

Componente: `src/components/LiveRefresh.tsx`.

Comportamiento:

- Primera consulta cinco segundos después de abrir.
- Nueva consulta cada 60 segundos.
- No consulta si la pestaña está oculta.
- No consulta en dashboard o login.
- Llama a `/api/live`.
- Ejecuta `router.refresh()` cuando hubo cambios.

### Serverless

`ensureLiveScores()` intenta refrescar durante el render si los datos están viejos. Esto reduce diferencias entre instancias, pero Supabase sigue siendo la solución recomendada para compartir estado.

---

## 12. Catálogo de rutas

### Públicas

| Ruta | Función |
|---|---|
| `/` | Portada |
| `/en-vivo` | Agenda completa |
| `/deportes` | Directorio de deportes |
| `/deporte/[slug]` | Landing de deporte |
| `/liga/[slug]` | Landing de competición (tabla, bracket, FAQ) |
| `/partido/[slug]` | Detalle del evento |
| `/vs/[slug]` | Enfrentamiento evergreen (historial A vs B) |
| `/equipo/[slug]` | Landing de equipo/selección (agenda por liga) |
| `/atleta/[slug]` | Atleta, piloto o peleador |
| `/futbol-hoy`, `/valorant-hoy`, etc. | Agenda del día por deporte/juego |
| `/resultados` | Archivo por deporte, torneo y año |
| `/buscar` | Resultados de búsqueda |
| `/favoritos` | Favoritos: partidos, ligas, equipos y “Mi agenda” |
| `/blog` | Hub editorial con filtros (categoría, mes, búsqueda) |
| `/blog/[slug]` | Artículo con enlaces internos automáticos |
| `/esports` | Hub de esports |
| `/esports/[game]` | Landing del juego |
| `/esports/[game]/equipo/[slug]` | Equipo de esports (roster + BO por liga) |
| `/esports/[game]/jugador/[slug]` | Jugador de esports |
| `/acerca-de` | Información del proyecto |
| `/contacto` | Contacto y publicidad |
| `/privacidad` | Política de privacidad |
| `/terminos` | Términos de uso |

### Administración

| Ruta | Función |
|---|---|
| `/login` | Inicio de sesión |
| `/dashboard` | Gestión |

### Técnicas

| Ruta | Función |
|---|---|
| `/robots.txt` | Reglas para crawlers (+ allow explícito AdSense) |
| `/sitemap.xml` | Sitemap dinámico |
| `/ads.txt` | Declaración de AdSense |
| `/llms.txt` | Resumen Markdown para agentes (H1 requerido) |
| `/api/health` | Probe: `ok`, `storage`, `lastSync`, `lastSyncLocal`, `syncStale`, `cronConfigured` |

### Middleware

`src/middleware.ts`: redirige `www.dondejuega.com` → `dondejuega.com` con **308 Permanent**.

---

## 13. Portada

Archivo: `src/app/page.tsx`.

La portada:

- Fuerza render dinámico.
- Asegura eventos frescos.
- Actualiza marcadores.
- Selecciona un evento principal.
- Muestra fecha y hora local.
- Muestra cuenta regresiva.
- Prioriza grandes competiciones de fútbol.
- Muestra eventos destacados.
- Muestra resultados recientes.
- Ofrece accesos por deporte.
- Incluye anuncios superiores y de feed.

### Ranking editorial

Archivo: `src/lib/utils.ts`.

Se aumenta la prioridad para:

- Mundial.
- Champions League.
- Copa América.
- Eurocopa.
- LaLiga.
- Premier League.
- Libertadores.
- Liga MX.
- Eventos en vivo.
- Eventos marcados como destacados.

Se reduce el peso de:

- Tenis de alto volumen.
- Golf.
- Cricket.
- Lacrosse.
- Esports que no sean tier S.

---

## 14. Landings de liga, equipo y evento

### Landing de liga `/liga/[slug]`

Además del calendario expandable:

- **Tablas** — `LeagueStandingsPanel` o `GroupStandingsPanel` (grupos + puntos en el Mundial).
- **Cuadro eliminatorio** — `TournamentBracket` cuando hay knockout.
- **FAQ** visible + schema `FAQPage`.
- **Guardar liga** en favoritos.

### Landing de equipo `/equipo/[slug]`

Hero premium, chips de competiciones, en vivo, próximos **agrupados por liga**, resultados recientes, schema SportsTeam + FAQ.

### Detalle del evento `/partido/[slug]`

Archivo: `src/app/partido/[slug]/page.tsx`.

Incluye:

- Breadcrumbs y navegación anterior.
- Título visible `Ver [evento]`.
- SEO `Ver [evento] gratis`.
- Equipos o participantes.
- Logos.
- Marcador en vivo o final.
- Hora local.
- Cuenta regresiva.
- Sede y país.
- Acciones de compartir.
- Google Calendar.
- Publicidad.
- Probabilidades informativas.
- Parciales.
- Cartelera.
- Clasificación.
- Estadísticas.
- Líderes.
- Cronología.
- Jugadas.
- Alineaciones o rosters.
- Canales oficiales.
- Filtro de región.
- Eventos relacionados.
- Fuente y hora de actualización.

### Variantes

- Fútbol: marcador, estadísticas, goles y tarjetas.
- Tenis: sets y estadísticas; no muestra “alineación”.
- Béisbol: entradas.
- Baloncesto: cuartos.
- Hockey: periodos.
- MMA: cartelera.
- F1 y golf: leaderboard.
- Esports: BO, mapas, equipos y roster.

---

## 15. Resultados

Página: `src/app/resultados/page.tsx`.

API: `src/app/api/results/route.ts`.

Filtros:

- Deporte.
- Torneo.
- Año.
- Página.

Fuentes:

- ESPN para deportes tradicionales.
- PandaScore para esports.

Paginación:

- 48 eventos por página en la interfaz.
- La API permite un límite entre 1 y 100.

Los resultados históricos se obtienen bajo demanda y no llenan permanentemente el store.

---

## 16. Esports

Fuente: PandaScore (`PANDASCORE_TOKEN`). Juegos: Valorant, League of Legends, CS2.

### Hub `/esports`

- Tarjetas de Valorant, LoL y CS2.
- Atajos “hoy”: `/valorant-hoy`, `/lol-hoy`, `/cs2-hoy`.
- Series en vivo y próximas.
- Aviso si no existe token.

### Agenda del día

Definidas en `src/lib/sport-today.ts` junto a fútbol/NBA/etc. Filtran por `sportSlug` y fecha local.

### Juego `/esports/[game]`

- Hero específico.
- Serie en vivo o próxima (con BO si aplica).
- Agenda y resultados.
- Torneos y equipos.

### Equipo `/esports/[game]/equipo/[slug]`

- Landing premium con botón “Guardar equipo”.
- Roster PandaScore (rol, nacionalidad).
- Próximas series **agrupadas por liga/torneo**.
- Chip `BO{n}` en tarjetas (`EventCard` + `bestOf`).
- Resultados recientes.

### Jugador

- Nickname, nombre real, foto, equipo, rol, nacionalidad.
- Próximas series.

### Tarjetas

Las series de esports muestran el formato (BO1/BO3/BO5) cuando PandaScore envía `number_of_games`.

---

## 17. Favoritos

Archivos:

- `src/lib/favorites.ts`
- `src/components/FavoriteButton.tsx` (partidos)
- `src/components/FavoriteEntityButtons.tsx` (ligas y equipos)
- `src/components/FavoritesClient.tsx`
- `src/components/FavoriteReminders.tsx`

### Qué se puede guardar

| Tipo | Clave localStorage | Dónde se activa |
|---|---|---|
| Partidos | `dj_favorites` | Estrella en `EventCard` |
| Ligas | `dj_favorite_leagues` | Botón “Guardar liga” en `/liga/[slug]` |
| Equipos | `dj_favorite_teams` | Botón “Guardar equipo” en `/equipo` y esports |

### Pestañas en `/favoritos`

1. **Mi agenda** — unión de partidos favoritos + eventos de ligas/equipos guardados.
2. **Partidos** — solo IDs de eventos.
3. **Ligas** — accesos a landings de competición.
4. **Equipos** — accesos a landings de equipo.

### Funcionamiento

- No requiere cuenta.
- Guarda datos en `localStorage`.
- Sincroniza componentes mediante el evento `dj:favorites-changed`.
- Consulta `/api/events`.
- Puede solicitar permiso de notificaciones (recordatorios ~15 min antes).
- Registra eventos ya notificados para no repetirlos.

### Limitaciones

- Las preferencias pertenecen al navegador/dispositivo.
- Se pierden al borrar datos locales.
- Las notificaciones dependen de que el sitio permanezca abierto.

---

## 18. Horarios locales

Componente: `src/components/LocalTime.tsx`.

El servidor entrega ISO UTC. El cliente:

- Detecta la zona horaria del navegador.
- Renderiza día y hora local.
- Evita depender de la zona horaria de Vercel.

Se utiliza en:

- Tarjetas.
- Hero.
- Detalle.
- Resultados.
- Favoritos.
- Búsqueda.

---

## 19. Cuenta regresiva

Componente: `src/components/Countdown.tsx`.

- Se actualiza cada 30 segundos.
- Muestra días, horas y minutos.
- Cambia a “Empieza pronto” cerca del inicio.
- Se muestra en destacados y eventos próximos.

---

## 20. Búsqueda

### Buscador global

Componente: `src/components/SearchBox.tsx`.

- Se abre con clic o `Ctrl/Cmd + K`.
- Espera dos caracteres.
- Debounce de 220 ms.
- Consulta `/api/search`.
- Devuelve ocho resultados.

Busca:

- Eventos.
- Equipos.
- Atletas.
- Jugadores.
- Competiciones.

Prioriza:

- Coincidencia exacta.
- Inicio del nombre.
- Subcadena.
- Palabras.
- Eventos en vivo.
- Eventos próximos.

### Página `/buscar`

Busca en el store y ordena:

1. En vivo.
2. Próximos.
3. Finalizados.

---

## 21. Transmisiones oficiales

Componentes:

- `src/components/BroadcastGuide.tsx`
- `src/lib/espn.ts`
- `src/lib/pandascore.ts`

Datos:

- Nombre del canal.
- Tipo: TV, streaming o radio.
- Región.
- URL oficial conocida.

El usuario puede elegir país. La preferencia se guarda localmente.

Plataformas reconocidas incluyen, cuando ESPN las reporta:

- ESPN.
- ViX.
- TUDN.
- Telemundo.
- Disney+.
- FOX.
- FIFA+.
- DAZN.
- Peacock.
- Paramount+.
- Apple TV.
- Prime Video.
- YouTube.

PandaScore puede aportar streams oficiales de Twitch y YouTube.

---

## 22. Administración

### Sesión

Archivo: `src/lib/auth.ts`.

- Cookie HTTP-only.
- Firma HMAC SHA-256.
- Expira en 12 horas.
- `SameSite=Lax`.
- `Secure` en producción.

### Dashboard

Archivos:

- `src/app/dashboard/page.tsx`
- `src/components/DashboardClient.tsx`

Funciones:

- Ver eventos.
- Crear evento manual.
- Editar.
- Eliminar.
- Destacar.
- Ocultar.
- Excluir de secciones en vivo.
- Ejecutar sincronización.
- Exportar JSON.
- Configurar umbral de importancia.
- Configurar máximo de destacados.
- Configurar CTA.
- Configurar banners.

### Endpoints protegidos

- `/api/admin/events`
- `/api/admin/config`
- `/api/admin/sync`

Todos verifican la sesión. La sincronización también acepta `Authorization: Bearer {CRON_SECRET}`.

---

## 23. API interna

| Endpoint | Método | Función |
|---|---|---|
| `/api/events` | GET | Eventos públicos filtrados |
| `/api/live` | GET | Refresca marcadores |
| `/api/results` | GET | Archivo histórico |
| `/api/search` | GET | Autocomplete |
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/auth/logout` | POST | Cerrar sesión |
| `/api/admin/events` | GET/POST/PATCH/DELETE | CRUD |
| `/api/admin/config` | POST | Configuración |
| `/api/admin/sync` | GET/POST | Sincronización |

### `/api/events`

Parámetros:

- `sport`
- `status`
- `q`

Caché CDN:

- 5 minutos.
- `stale-while-revalidate` de 10 minutos.

### `/api/results`

Parámetros:

- `torneo`
- `anio`
- `pagina`
- `limite`

### `/api/search`

Parámetro:

- `q`

Mínimo:

- Dos caracteres.

---

## 24. SEO

### Metadata global

Archivo: `src/app/layout.tsx`.

Incluye:

- Título.
- Plantilla de título.
- Descripción.
- Keywords.
- Canonical base.
- Open Graph.
- Twitter Card.
- Iconos.
- Manifest.
- Google Search Console.
- Meta de cuenta de AdSense.

### Metadata dinámica

Se genera en:

- Deportes y páginas `*-hoy`.
- Ligas (con FAQPage).
- Equipos / atletas (SportsTeam/Person + FAQ).
- Enfrentamientos evergreen `/vs/[slug]`.
- Esports (hub, juego, equipo, jugador).
- Eventos `/partido/[slug]`.
- Blog.

### Páginas evergreen `/vs/[slug]`

Archivos: `src/lib/vs.ts`, `src/app/vs/[slug]/page.tsx`.

- Slug estable ordenando alfabéticamente los equipos (`argentina-vs-espana`).
- Historial reciente, próximos cruces y FAQ.
- Enlazadas desde el detalle del partido.
- Incluidas en el sitemap (hasta 400).

### Landings de equipo

`/equipo/[slug]` y esports usan hero + agenda agrupada por liga + JSON-LD + FAQ “¿cuándo juega?”.

### FAQ por liga

En `/liga/[slug]`: bloque FAQ visible + `FAQPage` en JSON-LD (próximos partidos, dónde ver, tabla).

### SEO del evento

Título:

```text
Ver Equipo A vs Equipo B gratis
```

Keywords:

- Ver enfrentamiento / gratis / dónde ver.
- Horario, liga, deporte, fase.
- Combinaciones específicas de esports.

### Datos estructurados

- `Organization`, `WebSite`, `SearchAction`.
- `SportsEvent`, `SportsTeam`, `Person`, `SportsOrganization`.
- `CollectionPage`, `BreadcrumbList`, `FAQPage`, `BlogPosting`.

### Enlaces internos en blog

`src/lib/blog-links.tsx` auto-enlaza menciones (Mundial, España, Argentina, etc.) en párrafos.

### Sitemap

Archivo: `src/app/sitemap.ts`.

Incluye:

- Rutas estáticas (prioridad alta: home, en-vivo, deportes, esports).
- Deportes, ligas, `*-hoy`, blog.
- `/vs/...`, equipos, atletas, esports.
- Eventos no ocultos (prioridad extra si live/featured/importance alta).

Revalidación: 5 minutos.

### Robots

Archivo: `src/app/robots.ts`.

Permite el sitio público y bloquea:

- `/dashboard`
- `/api/admin`

---

## 25. Google Analytics

Archivo: `src/app/layout.tsx`.

ID:

```text
G-DB68T3MYWH
```

Se carga con `gtag.js` después de la interacción/hidratación.

Para cumplimiento en regiones que exigen consentimiento:

- Configurar el mensaje de privacidad de Google AdSense.
- Considerar Consent Mode.
- Evitar cargar medición personalizada antes del consentimiento cuando aplique.

---

## 26. Google AdSense

### Configuración

Helpers en `src/lib/utils.ts`.

El cliente acepta:

- `pub-...`
- `ca-pub-...`

Y lo normaliza a:

```text
ca-pub-...
```

### Posiciones

- Top.
- Feed.
- Sidebar.
- Detail.
- Footer.

Componentes:

- `src/components/AdSlot.tsx`
- `src/components/GlobalAd.tsx`

### Comportamiento

- Inserta `<ins class="adsbygoogle">`.
- Ejecuta `adsbygoogle.push({})`.
- Muestra un espacio promocional si no se llena.
- No muestra el bloque global en dashboard/login.

### `ads.txt`

Ruta:

```text
https://dondejuega.com/ads.txt
```

Formato:

```text
google.com, pub-XXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

### Páginas de confianza

En el footer (también email visible):

- Acerca de.
- Contacto (`hola@dondejuega.com`).
- Política de privacidad.
- Términos de uso.

JSON-LD de Organization incluye `email` y `contactPoint`.

### Rechazo “El sitio web no funciona o no está disponible”

Causa típica en este proyecto: el crawler de AdSense (`Mediapartners-Google` / `Google-Display-Ads-Bot`) recibía timeouts porque el SSR esperaba `runSync()` completo.

Mitigaciones ya implementadas:

1. Tope de espera SSR en sync/live.
2. Bypass total de espera para user-agents de Google/AdSense.
3. Cron frecuente (Vercel 2 h + GitHub 30 min) + Supabase.
4. `robots.txt` con `allow: /` explícito para crawlers de anuncios.
5. Contenido estable: legales, contacto, blog, agenda.

Checklist antes de solicitar revisión:

1. Deploy estable y `/api/health` con `syncStale: false` y `storage: supabase`.
2. URL en AdSense: exactamente `https://dondejuega.com`.
3. Comprobar en incógnito: `/`, `/contacto`, `/privacidad`, `/ads.txt`, `/robots.txt`.
4. Search Console verificado.
5. Esperar 24–48 h tras cambios grandes antes de reenviar.
6. La revisión puede tardar días o 2–4 semanas; no spamear solicitudes.

---

## 26.1 Blog editorial

Archivos:

- `src/lib/blog-posts.ts` — posts estáticos (~15 artículos: Mundial, NBA, MLB, F1, Liga MX, UFC, Valorant, LoL, guías).
- `src/components/BlogFilters.tsx` — filtros cliente.
- `src/app/blog/page.tsx` — índice.
- `src/app/blog/[slug]/page.tsx` — artículo + schema BlogPosting.

Filtros en `/blog`:

- Búsqueda por texto (título, descripción, tags).
- Categoría.
- Mes de publicación.
- Contador de resultados y limpiar filtros.

Añadir un post: agregar un objeto `BlogPost` en `blogPosts` con `slug`, `title`, `description`, fechas ISO, `category`, `tags`, `coverEmoji` y `body` (`p` | `h2` | `ul` | `link`).

---

## 27. Páginas legales

### `/acerca-de`

Explica:

- Misión.
- Contenido.
- Fuentes.
- Política de transmisiones.
- Publicidad.
- Contacto.

### `/privacidad`

Explica:

- Responsable.
- Datos técnicos.
- `localStorage`.
- Google Analytics.
- Google AdSense.
- Cookies.
- Conservación.
- Seguridad.
- Menores.
- Derechos.
- Contacto.

### `/terminos`

Explica:

- Naturaleza informativa.
- No retransmisión.
- Exactitud.
- Uso aceptable.
- Favoritos.
- Marcas.
- Publicidad.
- Propiedad intelectual.
- Responsabilidad.
- Cambios.

---

## 28. Programación automática

### Vercel Cron

Archivo: `vercel.json`.

```json
{
  "crons": [
    {
      "path": "/api/admin/sync",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

Ejecuta **cada 2 horas**. Vercel envía automáticamente:

```http
Authorization: Bearer <CRON_SECRET>
```

Requiere `CRON_SECRET` en Environment Variables → **Production**.

### GitHub Actions

Archivo: `.github/workflows/sync.yml`.

- Schedule: cada **30 minutos**.
- También `workflow_dispatch` (ejecución manual en Actions → Sync sports data → Run workflow).
- `SITE_URL` fijo a `https://dondejuega.com`.
- Secret requerido: solo **`CRON_SECRET`** (mismo valor que Vercel).

Forzar sync manual (PowerShell):

```powershell
$secret = "TU_CRON_SECRET"
curl.exe -s -H "Authorization: Bearer $secret" "https://dondejuega.com/api/admin/sync"
curl.exe -s "https://dondejuega.com/api/health"
```

Respuestas esperadas:

- Sync: `{"ok":true,"imported":...,"lastSync":"..."}`
- Health: `storage: supabase`, `minutesSinceSync` bajo, `syncStale: false`
- `lastSync` es **UTC**; `lastSyncLocal` muestra hora en `America/Mexico_City` (o `SITE_TIMEZONE`).

---

## 29. Despliegue en Vercel

### Primer despliegue

1. Subir el repositorio a GitHub.
2. Importarlo en Vercel.
3. Elegir Next.js.
4. Configurar variables (abajo).
5. Desplegar.
6. Enlazar `dondejuega.com`.
7. Middleware ya redirige `www` → apex (308).
8. Verificar `/robots.txt`, `/sitemap.xml`, `/ads.txt`, `/api/health`.

### Variables mínimas de producción

```dotenv
ADMIN_USER=...
ADMIN_PASSWORD=...
AUTH_SECRET=...
CRON_SECRET=...
NEXT_PUBLIC_SITE_URL=https://dondejuega.com
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
PANDASCORE_TOKEN=...
```

Recomendadas:

```dotenv
SITE_TIMEZONE=America/Mexico_City
THESPORTSDB_API_KEY=...
GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_ADSENSE_CLIENT=...
NEXT_PUBLIC_ADSENSE_SLOT_TOP=...
NEXT_PUBLIC_ADSENSE_SLOT_FEED=...
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=...
NEXT_PUBLIC_ADSENSE_SLOT_DETAIL=...
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=...
```

### Supabase (paso a paso)

1. Proyecto existente o nuevo en [supabase.com](https://supabase.com).
2. SQL Editor → ejecutar el SQL de `supabase/schema.sql` (tabla `site_state`).
3. Settings → API → copiar **Project URL** y **service_role** (secret).
4. Pegar en Vercel Production → Redeploy.
5. Confirmar `/api/health` → `"storage":"supabase"`.

### Verificación posterior

- Portada carga en < 3 s.
- `/api/health` no stale.
- Sync cron o workflow OK.
- Evento en vivo / MLB no fantasma.
- Contacto y privacidad indexables.
- Build sin errores de lint (ESLint exit 0).

### Builds lentos / logs ESPN

Si aparecen `Failed to set Next.js data cache ... over 2MB`:

- Ya mitigado con troceo de calendarios, `cache: no-store` en scoreboards y páginas de equipo/atleta dinámicas.
- No volver a pedir ventanas de 6 meses en una sola URL de scoreboard.

URLs de smoke test:

```text
https://dondejuega.com
https://dondejuega.com/en-vivo
https://dondejuega.com/deportes
https://dondejuega.com/esports
https://dondejuega.com/blog
https://dondejuega.com/resultados
https://dondejuega.com/acerca-de
https://dondejuega.com/contacto
https://dondejuega.com/privacidad
https://dondejuega.com/terminos
https://dondejuega.com/robots.txt
https://dondejuega.com/sitemap.xml
https://dondejuega.com/ads.txt
https://dondejuega.com/api/health
```

---

## 30. Desarrollo local

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Panel:

```text
http://localhost:3000/login
http://localhost:3000/dashboard
```

Antes de subir:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

---

## 31. Imágenes

Configuradas en `next.config.ts`.

Hosts permitidos:

- `r2.thesportsdb.com`
- `www.thesportsdb.com`
- `a.espncdn.com`
- `cdn.pandascore.co`
- `cdn-api.pandascore.co`

`TeamLogo`:

- Intenta cargar la imagen.
- Usa iniciales si falla.
- Desactiva optimización para ESPN y PandaScore cuando es necesario.

---

## 32. CSS y diseño

Archivo: `src/app/globals.css`.

Incluye:

- Tema oscuro por defecto.
- Tema claro persistido.
- Header responsive.
- Menú móvil.
- Hero / page-hero / landings centrados en móvil.
- Tipografía proporcional en móvil (cards, scoreboards, footers).
- Tarjetas de evento con footer centrado en pantallas pequeñas.
- Scoreboards.
- Estadísticas.
- Cronologías.
- Fight cards.
- Leaderboards.
- Resultados.
- Favoritos.
- Login.
- Dashboard.
- Publicidad.
- Landings de esports.
- Filtros del blog.
- Páginas legales.
- Footer (centrado en móvil; email de contacto visible).

### Contraste en modo claro

Los botones claros (`secondary-btn`, chips, icon-btn) usan `color: var(--foreground)` de forma explícita. Así no heredan texto blanco de los heroes oscuros (fallo típico: botón gris con letra blanca ilegible).

Los heroes de esports tienen estilos propios:

- Valorant.
- League of Legends.
- CS2.

---

## 33. Componentes principales

| Componente | Función |
|---|---|
| `Header` | Navegación, tema y búsqueda |
| `Footer` | Navegación y legales |
| `Brand` | Logo |
| `SearchBox` | Autocomplete |
| `EventCard` | Tarjeta universal |
| `TeamLogo` | Imagen con fallback |
| `LocalTime` | Hora del visitante |
| `Countdown` | Cuenta regresiva |
| `FavoriteButton` | Guardar favorito |
| `FavoritesClient` | Página de favoritos |
| `FavoriteReminders` | Notificaciones |
| `EventActions` | Compartir y calendario |
| `BroadcastGuide` | Canales por país |
| `AdSlot` | Anuncio o placeholder |
| `GlobalAd` | Publicidad global |
| `LiveRefresh` | Polling en vivo |
| `ResultsFilters` | Filtros históricos |
| `SearchableSelect` | Select con búsqueda (resultados) |
| `BlogFilters` | Filtros del blog |
| `BackLink` | Regreso contextual |
| `DashboardClient` | Administración |
| `ShareButton` | Compartir nativo / clipboard |

### Secciones del evento

En `src/components/event-details/SportSections.tsx`:

- `SegmentScoreboard`.
- `StatsPanels`.
- `LeadersPanel`.
- `StandingsPanel`.
- `ContestsPanel`.
- `RosterPanels`.
- `TimelinePanel`.
- `PlaysPanel`.
- `PredictorPanel`.
- `ParticipantLink`.

---

## 34. Flujo de usuario

### Ver un partido

```text
Inicio
→ tarjeta del evento
→ /partido/[slug]
→ marcador/horario/estadísticas
→ canales oficiales
```

### Navegar por deporte

```text
/deportes
→ /deporte/[slug]
→ /liga/[slug]
→ /partido/[slug]
```

### Esports

```text
/esports
→ /esports/[game]
→ equipo
→ jugador o evento
```

### Favoritos

```text
estrella en tarjeta / Guardar liga / Guardar equipo
→ localStorage (partidos + ligas + equipos)
→ /favoritos
→ pestañas: Mi agenda | Partidos | Ligas | Equipos
→ permiso de notificación (opcional)
```

### Equipo

```text
tarjeta o búsqueda
→ /equipo/[slug]  (o /esports/.../equipo/[slug])
→ próximos partidos agrupados por liga
→ /partido/[slug] o /liga/[slug]
```

### Enfrentamiento evergreen

```text
/partido/[slug]
→ /vs/equipo-a-vs-equipo-b
→ historial + próximos cruces
```

### Administración

```text
/login
→ cookie firmada
→ /dashboard
→ editar/sincronizar/configurar
```

---

## 35. Flujo de datos

```text
ESPN ─────────┐
TheSportsDB ──┼─→ adaptadores → SportsEvent[] → runSync()
PandaScore ───┘                         │
                                       ▼
                           Supabase / JSON / memoria
                                       │
                       ┌───────────────┼───────────────┐
                       ▼               ▼               ▼
                    páginas          APIs           sitemap
                       │
                       ▼
                  navegador
                       │
              /api/live cada minuto
                       │
                       ▼
               actualización de estado
```

---

## 36. Pruebas

Existe:

```text
src/lib/utils.test.ts
```

Cubre funciones básicas:

- Slugs.
- Iniciales.
- Estado por fecha.

Falta cobertura automatizada de:

- Adaptadores ESPN.
- PandaScore.
- TheSportsDB.
- Sincronización.
- Supabase.
- Autenticación.
- APIs.
- SEO.
- Componentes.
- Navegación.
- End-to-end.

---

## 37. Riesgos y mejoras recomendadas

### Alta prioridad

1. ~~Configurar Supabase para persistencia compartida.~~ → **Hecho en prod; mantener siempre activo.**
2. Eliminar credenciales de respaldo utilizables en producción.
3. Hacer obligatorio `AUTH_SECRET` (fallar hard si falta).
4. Proteger o limitar `/api/live`.
5. Añadir rate limiting persistente.
6. Validar también los `PATCH` del panel con Zod.
7. Añadir logs y monitorización de fallos (alertar si `syncStale` > 2 h).
8. Implementar consentimiento/Consent Mode donde corresponda.
9. Mantener `CRON_SECRET` sincronizado entre Vercel y GitHub.

### Media prioridad

1. ~~Mejorar deduplicación entre fuentes.~~ → Dedup TheSportsDB vs ESPN en sync.
2. Evitar sobrescribir marcadores con `undefined`.
3. Añadir pruebas de proveedores.
4. Añadir CI para lint, tipos, tests y build (lint ya es crítico en Vercel).
5. Marcar login/dashboard como `noindex`.
6. Añadir Content Security Policy.
7. Revisar sitemap para excluir resultados caducados.
8. No modificar `data/store.json` automáticamente en commits.
9. Mejorar `llms.txt` (`Content-Type: text/markdown`) si PageSpeed lo sigue marcando.

### Datos

- El dedupe ESPN/TheSportsDB usa equipos y fecha UTC.
- Dos partidos iguales el mismo día podrían colisionar.
- La inversión local/visitante puede impedir deduplicar.
- El histórico PandaScore está limitado a las páginas solicitadas.
- Algunas ligas ESPN no entregan todas las estadísticas.
- No pedir calendarios ESPN de muchos meses en una sola request (límite 2 MB de Next cache / deploys lentos).

---

## 38. Lista de mantenimiento

### Cada semana

- Revisar `https://dondejuega.com/api/health` (`syncStale: false`, `storage: supabase`).
- Revisar que ESPN/PandaScore sincronizan (cron Vercel o Actions).
- Comprobar eventos en vivo (sin fantasma 0–0 de TheSportsDB).
- Verificar logos.
- Revisar errores de Vercel (lint, build, cache ESPN).
- Revisar AdSense y `ads.txt`.
- Revisar páginas 404.

### Cada mes

- Actualizar dependencias.
- Ejecutar build.
- Probar login.
- Rotar secretos si es necesario.
- Revisar privacidad y términos.
- Revisar Search Console.
- Revisar Analytics.
- Publicar o actualizar posts del blog con eventos relevantes.

### Antes de cada deploy

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Después:

- Verificar portada.
- Verificar `/api/health`.
- Verificar evento.
- Verificar `/api/live`.
- Verificar esports y blog.
- Verificar sitemap.
- Verificar AdSense / contacto.

---

## 39. Plantilla para añadir un deporte

1. Añadir liga o fuente en el adaptador correspondiente.
2. Definir nombre y `sportSlug`.
3. Añadir icono en `src/lib/sports.ts`.
4. Elegir familia de detalle.
5. Definir etiquetas específicas.
6. Adaptar duración en `eventDurationMs()`.
7. Crear hero especial si lo necesita.
8. Verificar página de deporte.
9. Verificar resultados.
10. Verificar sitemap y metadata.
11. Añadir pruebas con respuestas reales.

---

## 40. Plantilla para añadir una fuente

Crear:

```text
src/lib/nueva-fuente.ts
```

Debe:

1. Autenticar solo en servidor.
2. Normalizar a `SportsEvent`.
3. Usar IDs estables.
4. Normalizar estado.
5. Normalizar fecha a ISO UTC.
6. Extraer logos y broadcasts.
7. Manejar errores sin destruir datos existentes.
8. Definir caché.
9. Integrarse en `runSync()`.
10. Integrarse en `updateLiveEvents()` si ofrece live.
11. Integrarse en `fetchEventDetails()`.
12. Añadir resultados si tiene histórico.
13. Añadir host de imágenes a `next.config.ts`.
14. Añadir variables a `.env.example`.
15. Añadir pruebas.

---

## 41. Definición de “listo”

Una funcionalidad está lista cuando:

- Funciona sin JavaScript crítico roto.
- Tiene estado vacío.
- Tiene fallback si la fuente falla.
- Respeta hora local.
- Es responsive.
- Tiene navegación para volver.
- Está indexada solo si aporta valor.
- Tiene metadata y canonical.
- No expone secretos.
- No enlaza contenido no autorizado.
- Pasa tipos, lint, pruebas y build.

---

## 42. Archivos clave

| Archivo | Responsabilidad |
|---|---|
| `src/lib/types.ts` | Contratos |
| `src/lib/store.ts` | Persistencia (Supabase / JSON / memoria) |
| `src/lib/sync.ts` | Sync + límites SSR + bypass crawlers |
| `src/lib/espn.ts` | ESPN (scoreboards troceados, `no-store`) |
| `src/lib/espn-details.ts` | Detalles ESPN |
| `src/lib/thesportsdb.ts` | TheSportsDB |
| `src/lib/pandascore.ts` | Esports |
| `src/lib/event-details.ts` | Despachador de detalles |
| `src/lib/sports.ts` | Familias y etiquetas |
| `src/lib/utils.ts` | Utilidades, AdSense, ranking, `siteUrl` |
| `src/lib/blog-posts.ts` | Contenido del blog |
| `src/lib/auth.ts` | Sesiones |
| `src/middleware.ts` | Redirect www → apex |
| `src/app/layout.tsx` | Layout, scripts, JSON-LD Organization |
| `src/app/page.tsx` | Portada |
| `src/app/api/health/route.ts` | Health / lastSync |
| `src/app/partido/[slug]/page.tsx` | Evento |
| `src/app/globals.css` | Diseño + móvil + contraste claro |
| `src/components/EventCard.tsx` | Tarjetas |
| `src/components/BlogFilters.tsx` | Filtros del blog |
| `src/components/event-details/SportSections.tsx` | Paneles |
| `src/components/DashboardClient.tsx` | Panel |
| `next.config.ts` | Next e imágenes |
| `vercel.json` | Cron cada 2 h |
| `.github/workflows/sync.yml` | Sync cada 30 min |
| `supabase/schema.sql` | Tabla `site_state` |

---

## 43. Resumen

Dónde Juega es una aplicación deportiva dinámica y programática que:

- Agrega múltiples fuentes (ESPN, TheSportsDB, PandaScore).
- Persiste estado en **Supabase** en producción.
- Normaliza deportes de equipo e individuales.
- Actualiza marcadores sin bloquear SSR ni crawlers de AdSense.
- Presenta detalles específicos por deporte.
- Ofrece resultados históricos, landings SEO, blog filtrable y esports.
- Convierte horarios localmente.
- Permite favoritos sin cuenta.
- Integra Analytics y AdSense con páginas de confianza.
- Se sincroniza vía Vercel Cron (2 h) y GitHub Actions (30 min).

Prioridades operativas:

1. Supabase + `CRON_SECRET` siempre activos.
2. `/api/health` verde (`syncStale: false`).
3. Lint limpio antes de cada deploy.
4. No reabrir ventanas ESPN gigantes.
5. AdSense: URL canónica, sitio rápido y contenido estable.
6. Secretos seguros y Consent Mode donde aplique.
7. Monitorización y CI.

