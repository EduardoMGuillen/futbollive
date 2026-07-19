# Dónde Juega — Guía completa del proyecto

Última actualización: 19 de julio de 2026.

Este documento describe qué contiene Dónde Juega, cómo funciona, cómo se ejecuta, cómo se despliega y cómo se mantiene. También sirve como plantilla para reconstruir o ampliar el proyecto.

> Sitio: `https://dondejuega.com`
>
> Repositorio local: `futbolive`
>
> Stack principal: Next.js 16, React 19, TypeScript, ESPN, TheSportsDB, PandaScore, Vercel y Supabase opcional.

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
- Supabase: almacenamiento persistente opcional.
- JSON local: almacenamiento de desarrollo y respaldo.
- Vercel: hosting, funciones y cron.
- GitHub Actions: sincronización programada adicional.

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
| `CRON_SECRET` | Sí | Protege la sincronización programada |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL canónica |
| `SUPABASE_URL` | Recomendable en Vercel | Persistencia compartida |
| `SUPABASE_SERVICE_ROLE_KEY` | Recomendable en Vercel | Acceso servidor a Supabase |
| `GOOGLE_SITE_VERIFICATION` | Opcional | Verificación de Search Console |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Para anuncios | ID `ca-pub-*` |
| `NEXT_PUBLIC_ADSENSE_SLOT_*` | Para anuncios | IDs de cada bloque |

### Seguridad

- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.
- No guardar `.env.local` en Git.
- No depender de las credenciales de respaldo definidas en el código.
- Configurar contraseñas y secretos largos y únicos.
- Rotar `AUTH_SECRET`, `ADMIN_PASSWORD` y `CRON_SECRET` si se filtran.

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
│   ├── app/
│   │   ├── api/
│   │   ├── atleta/[slug]/
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
│   │   ├── login/
│   │   ├── partido/[slug]/
│   │   ├── privacidad/
│   │   ├── resultados/
│   │   ├── terminos/
│   │   ├── acerca-de/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   └── event-details/
│   └── lib/
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

Sin Supabase:

- El filesystem de Vercel puede ser efímero o de solo lectura.
- La memoria no se comparte entre instancias.
- Una actualización puede verse en una función y no en otra.

Para persistencia real en producción se recomienda configurar Supabase.

---

## 8. Estados y visibilidad

Los estados se recalculan al leer el store.

### Duración estimada

| Tipo | Duración |
|---|---:|
| Multi-participante | 5 días |
| Esports | 70 minutos por mapa + 1 hora |
| Cricket | 12 horas |
| Béisbol | 8 horas |
| MMA | 5 horas |
| General | 3 horas |

### Reglas

- Un estado reciente de ESPN o PandaScore tiene prioridad.
- ESPN puede pasar automáticamente a “en vivo” por hora.
- PandaScore solo pasa a “en vivo” cuando la fuente lo confirma.
- Los eventos finalizados recientes continúan visibles hasta 6 horas después del final estimado.
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

### Caché

- Scoreboards: 15 minutos.
- Broadcasts: 30 minutos.
- Resumen de detalle: 90 segundos.
- Actualización en vivo: sin caché.

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
- Evita duplicados básicos.
- Conserva configuración editorial.
- Conserva alineaciones y broadcasts anteriores si la fuente nueva no los entrega.
- Protege marcadores actualizados recientemente.
- Elimina eventos demo cuando hay datos reales.
- Poda resultados antiguos.
- Actualiza `settings.lastSync`.

### Retención

- Resultado normal: 3 días en el store.
- Eventos con importancia igual o superior a 97: 21 días.
- Eventos manuales: no se eliminan automáticamente.
- La sección `/resultados` puede consultar años anteriores sin guardarlos todos.

### Actualización automática

`ensureFreshEvents()` sincroniza si:

- Han pasado más de 10 minutos.
- Solo existen eventos demo o manuales.

Los errores automáticos se ignoran para poder mostrar datos anteriores.

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
| `/liga/[slug]` | Landing de competición |
| `/partido/[slug]` | Detalle del evento |
| `/equipo/[slug]` | Equipo o selección |
| `/atleta/[slug]` | Atleta, piloto o peleador |
| `/resultados` | Archivo por deporte, torneo y año |
| `/buscar` | Resultados de búsqueda |
| `/favoritos` | Favoritos locales |
| `/esports` | Hub de esports |
| `/esports/[game]` | Landing del juego |
| `/esports/[game]/equipo/[slug]` | Equipo de esports |
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
| `/robots.txt` | Reglas para crawlers |
| `/sitemap.xml` | Sitemap dinámico |
| `/ads.txt` | Declaración de AdSense |
| `/llms.txt` | Resumen del sitio para agentes |

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

## 14. Página del evento

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

### Hub `/esports`

- Tarjetas de Valorant, LoL y CS2.
- Series en vivo.
- Próximas series.
- Aviso si no existe token.

### Juego `/esports/[game]`

- Hero específico.
- Serie en vivo o próxima.
- Marcador o countdown.
- Agenda.
- Resultados recientes.
- Torneos.
- Equipos.

### Equipo

- Logo.
- Nombre, siglas y país.
- Roster.
- Rol y nacionalidad de jugadores.
- Agenda del equipo.

### Jugador

- Nickname.
- Nombre real si está disponible.
- Foto.
- Equipo.
- Rol.
- Nacionalidad.
- Próximas series.

---

## 17. Favoritos

Archivos:

- `src/lib/favorites.ts`
- `src/components/FavoriteButton.tsx`
- `src/components/FavoritesClient.tsx`
- `src/components/FavoriteReminders.tsx`

### Funcionamiento

- No requiere cuenta.
- Guarda IDs en `localStorage`.
- Sincroniza componentes mediante eventos del navegador.
- Consulta `/api/events`.
- Puede solicitar permiso de notificaciones.
- Notifica aproximadamente 15 minutos antes.
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

- Deportes.
- Ligas.
- Equipos.
- Atletas.
- Esports.
- Equipos y jugadores de esports.
- Eventos.

### SEO del evento

Título:

```text
Ver Equipo A vs Equipo B gratis
```

Contenido visible:

```text
Ver Equipo A vs Equipo B
```

Keywords:

- Ver enfrentamiento.
- Ver enfrentamiento gratis.
- Dónde ver enfrentamiento gratis.
- Horario.
- Liga.
- Deporte.
- Combinaciones específicas de esports.

### Datos estructurados

- `Organization`.
- `WebSite`.
- `SearchAction`.
- `SportsEvent`.
- `SportsTeam`.
- `Person`.
- `CollectionPage`.
- `BreadcrumbList`.
- `FAQPage`.

### Sitemap

Archivo: `src/app/sitemap.ts`.

Incluye:

- Rutas estáticas.
- Deportes.
- Ligas.
- Equipos.
- Atletas.
- Esports.
- Eventos no ocultos.

Revalidación:

- 5 minutos.

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

En el footer:

- Acerca de.
- Contacto.
- Política de privacidad.
- Términos de uso.

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
      "schedule": "0 8 * * *"
    }
  ]
}
```

Ejecuta diariamente a las 08:00 UTC.

### GitHub Actions

Archivo: `.github/workflows/sync.yml`.

Ejecuta aproximadamente cada 30 minutos y permite ejecución manual.

Secrets del repositorio:

- `SITE_URL`
- `CRON_SECRET`

La llamada debe enviar:

```http
Authorization: Bearer CRON_SECRET
```

---

## 29. Despliegue en Vercel

### Primer despliegue

1. Subir el repositorio a GitHub.
2. Importarlo en Vercel.
3. Elegir Next.js.
4. Configurar variables.
5. Desplegar.
6. Enlazar `dondejuega.com`.
7. Definir redirección canónica entre `www` y el dominio raíz.
8. Verificar `/robots.txt`.
9. Verificar `/sitemap.xml`.
10. Verificar `/ads.txt`.

### Variables mínimas de producción

```dotenv
ADMIN_USER=...
ADMIN_PASSWORD=...
AUTH_SECRET=...
CRON_SECRET=...
NEXT_PUBLIC_SITE_URL=https://dondejuega.com
PANDASCORE_TOKEN=...
```

Recomendadas:

```dotenv
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
THESPORTSDB_API_KEY=...
GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_ADSENSE_CLIENT=...
NEXT_PUBLIC_ADSENSE_SLOT_TOP=...
NEXT_PUBLIC_ADSENSE_SLOT_FEED=...
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=...
NEXT_PUBLIC_ADSENSE_SLOT_DETAIL=...
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=...
```

### Verificación posterior

```text
https://dondejuega.com
https://dondejuega.com/en-vivo
https://dondejuega.com/deportes
https://dondejuega.com/esports
https://dondejuega.com/resultados
https://dondejuega.com/acerca-de
https://dondejuega.com/privacidad
https://dondejuega.com/terminos
https://dondejuega.com/robots.txt
https://dondejuega.com/sitemap.xml
https://dondejuega.com/ads.txt
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
- Hero.
- Tarjetas.
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
- Páginas legales.
- Footer.

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
| `BackLink` | Regreso contextual |
| `DashboardClient` | Administración |

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
estrella en tarjeta
→ localStorage
→ /favoritos
→ permiso de notificación
→ recordatorio
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

1. Configurar Supabase para persistencia compartida.
2. Eliminar credenciales de respaldo utilizables en producción.
3. Hacer obligatorio `AUTH_SECRET`.
4. Proteger o limitar `/api/live`.
5. Añadir rate limiting persistente.
6. Validar también los `PATCH` del panel con Zod.
7. Añadir logs y monitorización de fallos.
8. Implementar consentimiento/Consent Mode donde corresponda.

### Media prioridad

1. Mejorar deduplicación entre fuentes.
2. Evitar sobrescribir marcadores con `undefined`.
3. Añadir pruebas de proveedores.
4. Añadir CI para lint, tipos, tests y build.
5. Marcar login/dashboard como `noindex`.
6. Añadir Content Security Policy.
7. Revisar sitemap para excluir resultados caducados.
8. No modificar `data/store.json` automáticamente en commits.

### Datos

- El dedupe ESPN/TheSportsDB usa equipos y fecha UTC.
- Dos partidos iguales el mismo día podrían colisionar.
- La inversión local/visitante puede impedir deduplicar.
- El histórico PandaScore está limitado a las páginas solicitadas.
- Algunas ligas ESPN no entregan todas las estadísticas.

---

## 38. Lista de mantenimiento

### Cada semana

- Revisar que ESPN/PandaScore sincronizan.
- Comprobar eventos en vivo.
- Verificar logos.
- Revisar errores de Vercel.
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

### Antes de cada deploy

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Después:

- Verificar portada.
- Verificar evento.
- Verificar `/api/live`.
- Verificar esports.
- Verificar sitemap.
- Verificar AdSense.

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
| `src/lib/store.ts` | Persistencia |
| `src/lib/sync.ts` | Sincronización |
| `src/lib/espn.ts` | ESPN |
| `src/lib/espn-details.ts` | Detalles ESPN |
| `src/lib/thesportsdb.ts` | TheSportsDB |
| `src/lib/pandascore.ts` | Esports |
| `src/lib/event-details.ts` | Despachador de detalles |
| `src/lib/sports.ts` | Familias y etiquetas |
| `src/lib/utils.ts` | Utilidades y ranking |
| `src/lib/auth.ts` | Sesiones |
| `src/app/layout.tsx` | Layout, scripts y metadata |
| `src/app/page.tsx` | Portada |
| `src/app/partido/[slug]/page.tsx` | Evento |
| `src/app/globals.css` | Diseño |
| `src/components/EventCard.tsx` | Tarjetas |
| `src/components/event-details/SportSections.tsx` | Paneles |
| `src/components/DashboardClient.tsx` | Panel |
| `next.config.ts` | Next e imágenes |
| `vercel.json` | Cron |
| `supabase/schema.sql` | Base de datos |

---

## 43. Resumen

Dónde Juega es una aplicación deportiva dinámica y programática que:

- Agrega múltiples fuentes.
- Normaliza deportes de equipo e individuales.
- Actualiza marcadores.
- Presenta detalles específicos por deporte.
- Ofrece resultados históricos.
- Incluye esports.
- Convierte horarios localmente.
- Permite favoritos sin cuenta.
- Trabaja SEO programático.
- Integra Analytics y AdSense.
- Incluye administración editorial.
- Puede persistir en Supabase.
- Se despliega en Vercel.

Para producción estable, la configuración más importante es:

1. Secretos seguros.
2. Supabase.
3. Cron autenticado.
4. PandaScore configurado.
5. AdSense y consentimiento.
6. Monitorización.
7. Pruebas y CI.

