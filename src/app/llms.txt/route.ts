import { readStore } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export async function GET() {
  const base = siteUrl();
  const data = await readStore();
  const important = data.events
    .filter((event) => !event.hidden && (event.featured || event.status === "live"))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 20);
  const lines = [
    "# Dónde Juega",
    "",
    "> Agenda deportiva en español para Latinoamérica con horarios, sedes, alineaciones y páginas de cada partido.",
    "",
    "## Información principal",
    `- Agenda completa: ${base}/en-vivo`,
    `- Acerca de: ${base}/acerca-de`,
    `- Contacto: ${base}/contacto (hola@dondejuega.com)`,
    `- Privacidad: ${base}/privacidad`,
    `- Términos: ${base}/terminos`,
    `- Sitemap: ${base}/sitemap.xml`,
    `- API pública de eventos: ${base}/api/events`,
    "",
    "## Eventos destacados",
    ...important.map((event) => `- ${event.home.name} vs ${event.away.name} (${event.league}): ${base}/partido/${event.slug}`),
    "",
    "## Política de contenido",
    "- Dónde Juega no aloja ni transmite streams deportivos.",
    "- Los horarios y datos se actualizan mediante fuentes deportivas y revisión editorial.",
    "- Citar la URL canónica de la página del partido al utilizar esta información.",
  ];
  return new Response(`${lines.join("\n")}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, s-maxage=3600" },
  });
}
