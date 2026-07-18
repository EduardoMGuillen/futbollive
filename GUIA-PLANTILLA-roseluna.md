# Guía para replicar esta plantilla en otro proyecto o sector

Esta guía describe el **formato**, **stack** y **archivos a tocar** cuando clones el patrón de esta landing (Next.js + React + Tailwind + Framer Motion) para otro cliente o vertical. Incluye la variante **tienda / catálogo** con login administrativo y panel de productos (caso RoseLune).

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** (paleta en `src/app/globals.css` con `@theme` / CSS variables; Tailwind v4)
- **Framer Motion** (animaciones ligeras al cargar y al hacer scroll)
- **`next/font`** (una fuente display + una sans)
- **`next/image`** para fotos (demo vía Unsplash en `lib/demo-images.ts`; sustituir en producción)
- **Auth básica** (cookie firmada + credenciales en `.env.local`)
- **Catálogo persistente** (`lib/blob-store.ts` → Vercel Blob en producción; `data/products.json` en local)
- **Subida de imágenes** (`POST /api/upload` → Vercel Blob / `public/uploads` en local)
- **Checkout por WhatsApp** (`lib/whatsapp.ts`)

## Prompt maestro (copiar en Cursor u otro asistente)

```
Quiero una landing en Next.js (App Router) + React + TypeScript + Tailwind CSS + animaciones ligeras con Framer Motion, mismo patrón que una web de servicios profesionales premium.

Estructura obligatoria:
1) Header fijo: logo/nombre, navegación a anclas (#servicios, #sobre, #testimonios, #contacto), CTA principal, menú móvil.
2) Hero: titular en 2 líneas con acento en gradiente o color de marca, subtítulo, 2 botones (primario + secundario), bloque visual derecho (imagen optimizada con next/image o placeholder), 3 métricas o bullets de confianza.
3) Servicios: título de sección + grid de 4–6 tarjetas (icono, título, descripción corta), animación al entrar en viewport.
4) Sobre / propuesta de valor: 2 columnas (imagen + texto), lista con checks, opcional tarjeta flotante con dato clave.
5) Testimonios: 3 citas en cards con comillas y autor.
6) CTA final: banda con gradiente de marca, titular, texto corto, botones (tel/mail o formulario).
7) Footer: marca, descripción breve, enlaces rápidos, fila inferior con © año + enlace "Powered by Nexus Global" a https://www.nexusglobalsuministros.com/

Requisitos técnicos:
- Tipografías con next/font (una display + una sans).
- Paleta en globals.css (@theme / variables) o tailwind.config alineada al sector del cliente.
- dark: coherente con prefers-color-scheme.
- Imágenes demo solo de fuentes con licencia clara (Unsplash) en lib/demo-images.ts + remotePatterns en next.config; comentario de sustituir en producción.
- Textos en español, tono profesional; reemplazar marca de ejemplo por [NOMBRE CLIENTE].
- Componentes en /components, página principal ensambla secciones.
```

## Variante RoseLune (floristería / catálogo + WhatsApp)

Además de la landing, esta plantilla incluye:

### Persistencia en Vercel (Blob) — obligatorio

En Vercel **el sistema de archivos es efímero**: lo que escribas en `data/` o `public/uploads/` **no se guarda** entre requests. Por eso, sin Blob, parece que “no se eliminan” productos o “falla la subida de fotos”.

Esta plantilla usa **Vercel Blob** (`@vercel/blob`) vía `lib/blob-store.ts`:

| Entorno | Productos | Imágenes subidas |
|---------|-----------|------------------|
| **Vercel** (con token) | Blob `roselune/catalog/*.json` (versiones) | Blob `roselune/uploads/…` |
| **Local** (sin token) | `data/products.json` | `public/uploads/` |

Legacy: si aún existe `roselune/products.json`, se lee una vez y luego se migra al esquema con versiones.

#### Cómo se guarda el catálogo (importante)

**No** se sobrescribe un único `products.json`. Cada crear / editar / borrar / promo / ocultar escribe un archivo **nuevo**:

`roselune/catalog/<timestamp>-<id>.json`

Luego se lista el prefijo y se usa la versión **más reciente**. Se conservan unas pocas versiones viejas y el resto se limpian.

**Por qué:** al sobrescribir el mismo pathname, el CDN de Blob puede servir la versión anterior durante **hasta ~60 segundos**. Eso provocaba:

- “No se pudo leer el catálogo”
- Productos que “vuelven” o **desaparecen** al borrar/agregar seguido
- Catálogo vacío al dar Reintentar (datos ya pisados con una lectura stale)

Con pathnames únicos, cada guardado es una URL fresca y no depende de esa caché de overwrite.

#### Uso del dashboard (operadores)

- **No hace falta esperar 1 minuto** entre agregar y borrar.
- Sí hay que **esperar a que cierre el loading** del panel antes de la siguiente acción (unos segundos).
- Un catálogo **vacío es válido** (tras borrar todo): **no** se vuelve a sembrar solo con los demos de `data/products.json`.
- Si falla la lectura, el panel muestra el error y un botón **Reintentar** (no vacía la lista solo por un fallo de red).
- Tras un guardado exitoso, la API devuelve el catálogo ya escrito; el UI lo aplica sin “martillar” lecturas de confirmación.

#### Pasos en el dashboard de Vercel

1. Abre el proyecto en [vercel.com](https://vercel.com).
2. Ve a **Storage** → **Create** / **Create Database** → **Blob**.
3. Elige acceso **Public** (obligatorio para que las fotos se vean en la tienda).  
   Si creaste uno **Private**, bórralo y crea otro **Public** — si no, verás *Access denied*.
4. Conéctalo a este proyecto (Production + Preview).
5. Variables típicas que aparecen:
   - `BLOB_STORE_ID` — ID del store
   - `BLOB_WEBHOOK_PUBLIC_KEY` — se puede ignorar
   - **`BLOB_READ_WRITE_TOKEN`** — token largo; **recomendado** (evita *Access denied*)
6. Si **no** te salió `BLOB_READ_WRITE_TOKEN`:
   - Entra a **Storage** → clic en tu Blob store  
   - Busca pestaña **`.env.local`**, **Settings** o **Tokens** y copia `BLOB_READ_WRITE_TOKEN`  
   - O en la CLI: `npx vercel env pull` (con el proyecto linkeado)  
   - Pégalo en **Settings → Environment Variables** (Production + Preview)
7. **Redeploy** después de agregar/cambiar variables.

Con solo `BLOB_STORE_ID` a veces funciona (OIDC), pero si ves *Access denied*, agrega **`BLOB_READ_WRITE_TOKEN`** y vuelve a desplegar.

Opcional: `BLOB_ACCESS=private` solo si el store es Private (las fotos de producto dejarían de ser URLs públicas; esta plantilla asume **Public**).

**Errores frecuentes**

| Síntoma | Causa habitual | Qué hacer |
|---------|----------------|-----------|
| Access denied / valid token | Blob Private + `access: public`, o falta RW token | Blob **Public** + `BLOB_READ_WRITE_TOKEN` + Redeploy |
| Solo tienes STORE_ID y WEBHOOK key | Falta el token RW | Cópialo del store y añádelo a Env |
| Sube en local pero no en Vercel | Env no aplicada a Production | Marca Production y Redeploy |
| Catálogo vacío / productos “se borran solos” al guardar seguido | Sobrescribir el mismo JSON + caché CDN (~60s) | Usar versiones en `roselune/catalog/` (ya en `blob-store.ts`) + no actuar hasta cerrar el loading |
| “No se pudo leer el catálogo” + Reintentar sin datos | Lectura falló o el catálogo ya quedó `[]` en Blob | Revisar token/Blob; si el JSON está vacío, **volver a agregar** productos (no se recuperan solos) |

#### Archivos clave

- `src/lib/blob-store.ts` — lectura/escritura Blob (catálogo versionado + uploads) + fallback local  
- `src/lib/products.ts` — CRUD; mutaciones devuelven `{ product?, products }`  
- `src/app/api/upload/route.ts` — subida de fotos (comprimidas en el navegador antes)  
- `src/components/DashboardClient.tsx` — panel; espera loading; aplica catálogo desde la respuesta del API  
- `data/products.json` — semilla **solo** la primera vez (si no hay ninguna versión en Blob); un catálogo vacío no se re-siembra  

### Login administrativo

- Ruta pública: `/login` (`src/app/login/page.tsx`)
- API: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Cookie HTTP-only: `roselune_session` (nombre en `lib/constants.ts` → `AUTH_COOKIE`)
- Firmado HMAC en `lib/auth.ts` con `AUTH_SECRET`
- Credenciales: `ADMIN_USER` y `ADMIN_PASSWORD` (`.env.local` / Vercel Env)
- Middleware: protege `/dashboard` (`src/middleware.ts`)

### Panel / dashboard de productos

- Ruta: `/dashboard` (`src/app/dashboard/page.tsx` + `components/DashboardClient.tsx`)
- Acciones: crear, editar, eliminar, marcar/quitar **promoción**, ocultar/mostrar (`active`)
- Tras cada acción exitosa, la API responde con el catálogo actualizado y el panel lo pinta de inmediato (sin reconfirmar a fuerza con muchas lecturas)
- **Espera a que cierre el loading** antes de la siguiente acción; no hace falta esperar ~60s entre operaciones
- Imagen: comprimir en el cliente → `POST /api/upload` → URL pública (Blob en Vercel)
- También se puede pegar una URL manual de imagen
- API: `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/[id]`, `POST /api/upload`
- Formulario responsive (móvil y desktop)

### Compra por WhatsApp

- Número: `NEXT_PUBLIC_WHATSAPP` (ej. `50493720140` → +504 9372-0140)
- Al hacer clic en **Comprar**, se abre `wa.me` con mensaje que incluye nombre y **enlace** `/producto/[id]`
- Lógica en `lib/whatsapp.ts` → `whatsappBuyUrl()`
- Página de detalle: `src/app/producto/[id]/page.tsx`
- Listado completo: `/productos`

### Variables de entorno

```
ADMIN_USER=admin
ADMIN_PASSWORD=roselune2024
AUTH_SECRET=cambia-este-secreto
NEXT_PUBLIC_WHATSAPP=50493720140
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app

# Blob en Vercel (cualquiera de estos basta):
# BLOB_STORE_ID=store_...          ← lo crea Vercel al conectar Blob (OIDC)
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...  ← opcional / local
# BLOB_WEBHOOK_PUBLIC_KEY=...      ← lo puedes ignorar
```

- `NEXT_PUBLIC_SITE_URL` = URL pública **de producción** (WhatsApp, Open Graph, schema). **No** pongas `http://localhost:3000` en Vercel.  
- `BLOB_STORE_ID` = ID del store Blob (suficiente en Vercel con OIDC).  
- `BLOB_READ_WRITE_TOKEN` = token estático opcional (útil en local con `vercel env pull`).  
- `BLOB_WEBHOOK_PUBLIC_KEY` = no lo usa esta plantilla.  
- Plantilla de ejemplo: `.env.example`

### Favicon, logo en Google y preview al compartir (importante)

Sin una URL pública absoluta, **WhatsApp / Facebook / iMessage no muestran el logo** al pegar el enlace.

#### Qué incluir

| Uso | Archivos / config |
|-----|-------------------|
| Pestaña de Chrome | `src/app/favicon.ico`, `src/app/icon.png`, `public/favicon.ico` |
| Google (icono en resultados, ≥48×48) | `public/icon-48.png`, `public/icon-192.png`, `public/icon-512.png` |
| Apple / “Añadir a inicio” | `src/app/apple-icon.png`, `public/apple-icon.png` |
| Preview al compartir (Open Graph / Twitter) | `public/og.png` (1200×630) + `public/logo.png` |
| Metadata + schema | `src/app/layout.tsx` (`metadata.icons`, `openGraph`, `twitter`, JSON-LD `logo`) |

El icono de pestaña suele ser la **rosa** recortada en cuadrado (el wordmark completo no se lee a 32–48 px). `og.png` lleva el logo completo centrado sobre fondo oscuro.

#### `NEXT_PUBLIC_SITE_URL` y preview al compartir

Las etiquetas `og:image` se resuelven con `metadataBase` → `SITE_URL` en `lib/constants.ts`.

1. En **Vercel → Settings → Environment Variables**, define:
   ```
   NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
   ```
   (o `https://tu-proyecto.vercel.app` si aún no hay dominio propio). Production + Preview.
2. **Redeploy** después de cambiarla.
3. Comprueba en el HTML que `og:image` sea una URL **https** pública, por ejemplo:
   `https://tu-dominio.com/og.png`  
   **Nunca** `http://localhost:3000/og.png` — esa URL no la puede descargar WhatsApp.

Fallback en código (`resolveSiteUrl` en `lib/constants.ts`): si en Vercel queda `localhost`, se usa `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`. Aun así, lo correcto es fijar `NEXT_PUBLIC_SITE_URL` al dominio real.

#### Tiempos típicos

| Dónde | Cuándo se ve |
|-------|----------------|
| Pestaña Chrome | Tras el deploy (a veces hace falta hard-refresh o ventana privada) |
| Preview al compartir | Minutos–horas; WhatsApp **cachea** el preview. Prueba `?v=2` al final de la URL o un chat nuevo |
| Icono en Google | Días o semanas (re-rastreo) |

#### Error frecuente

| Síntoma | Causa | Qué hacer |
|---------|--------|-----------|
| Al compartir el link no sale imagen / logo | `og:image` apunta a `localhost` o falta `NEXT_PUBLIC_SITE_URL` en producción | Poner la URL https real en Vercel + Redeploy; verificar que `/og.png` y `/logo.png` den 200 |
| Sale el título pero sin foto | Cache del chat / app | Esperar o compartir con `?v=2` |
| Chrome sigue con el icono viejo | Cache del navegador | Hard-refresh (Ctrl+Shift+R) |

## Checklist al adaptar otro sector

| Qué cambiar | Archivo habitual |
|-------------|------------------|
| Título, descripción SEO, Open Graph, favicon | `app/layout.tsx` + iconos en `app/` y `public/` |
| Logo / og preview al compartir | `public/logo.png`, `public/og.png`, `NEXT_PUBLIC_SITE_URL` |
| Paleta de marca (blanco / rosado / negro / gris) | `app/globals.css` (`:root` + `@theme`) |
| Navegación y CTA cabecera | `components/Header.tsx` |
| Titular, métricas, hero visual | `components/Hero.tsx` |
| Listado de servicios / catálogo | `components/Services.tsx` o `components/Products.tsx` |
| Historia, imagen lateral | `components/About.tsx` y `lib/demo-images.ts` |
| Testimonios | `components/Testimonials.tsx` |
| Contacto (tel, mail, WhatsApp) | `components/CtaBand.tsx` |
| Pie, enlaces, powered by | `components/Footer.tsx` |
| Orden de secciones | `app/page.tsx` |
| Credenciales admin | `.env.local` (`ADMIN_USER`, `ADMIN_PASSWORD`) |
| Login UI | `app/login/page.tsx` |
| Panel CRUD productos | `components/DashboardClient.tsx`, `app/dashboard/page.tsx` |
| Subida de imágenes | `app/api/upload/route.ts`, `lib/compress-image.ts`, `lib/blob-store.ts` |
| Persistencia catálogo | `lib/blob-store.ts`, `lib/products.ts`, `app/api/products/**` (+ Blob en Vercel) |
| Token / store Blob (Vercel) | Env `BLOB_STORE_ID` y/o `BLOB_READ_WRITE_TOKEN` (Storage → Blob) |
| Auth / cookie | `lib/auth.ts`, `app/api/auth/**`, `middleware.ts` |
| WhatsApp + mensaje de pedido | `lib/whatsapp.ts`, `lib/constants.ts` |
| URL pública (WhatsApp + og:image) | `NEXT_PUBLIC_SITE_URL` (https de producción, no localhost) |
| Página producto (deep link) | `app/producto/[id]/page.tsx` |
| Todos los productos | `app/productos/page.tsx` |

## Imágenes de demostración

- URLs centralizadas en `lib/demo-images.ts` (hero / about).
- Productos demo también en `data/products.json` (Unsplash).
- Licencia Unsplash: <https://unsplash.com/license>
- Antes de producción: sustituir por fotos del cliente o stock con licencia explícita.
- **Logo RoseLune:** `public/logo.png` — Header, Footer, login, dashboard, Open Graph y JSON-LD.
- **Preview social:** `public/og.png` (1200×630). Ver sección *Favicon, logo en Google y preview al compartir*.
## Powered by Nexus Global

En el footer del template hay un enlace **Powered by Nexus Global** hacia:

<https://www.nexusglobalsuministros.com/>

Si reutilizas el footer en otro repo, conserva o adapta esa constante (`NEXUS_URL` en `components/Footer.tsx` / `lib/constants.ts`) según tu acuerdo comercial.

## Variante estilo “agencia” (tipo Nexus Global)

Si quieres acercarte a un sitio con **Proyectos**, **Proceso**, **Partners** y **formulario de contacto**, añade al prompt:

- Sección **Proyectos**: grid de casos con stack/tecnologías y enlace “Ver detalles”.
- Sección **Proceso**: pasos numerados (Descubrimiento → Diseño → Desarrollo → Lanzamiento) + bullets de compromiso.
- **Partners / logos**: carrusel o fila de logos en escala de grises.
- **Contacto**: formulario + email/redes; backend o servicio de envío según necesidad.

## Comandos útiles

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # comprobar que compila antes de desplegar
```

Accesos rápidos en local:

- Tienda: `/`
- Login: `/login` (usuario/contraseña de `.env.local`)
- Dashboard: `/dashboard`
