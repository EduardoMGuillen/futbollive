import { NextRequest, NextResponse } from "next/server";
import { fetchEspnResults, getEspnLeagueCatalog } from "@/lib/espn";
import { fetchPandaScoreResults, getPandaScoreCatalog } from "@/lib/pandascore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("torneo") || "";
  const year = Number(request.nextUrl.searchParams.get("anio") || new Date().getUTCFullYear());
  const requestedPage = Number(request.nextUrl.searchParams.get("pagina") || 1);
  const requestedLimit = Number(request.nextUrl.searchParams.get("limite") || 48);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isInteger(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 48;
  const catalog = [...getEspnLeagueCatalog(), ...getPandaScoreCatalog()];
  const validLeague = catalog.some((item) => item.path === path);
  const currentYear = new Date().getUTCFullYear();
  if (!validLeague || !Number.isInteger(year) || year < 1990 || year > currentYear) {
    return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
  }
  const events = path.startsWith("pandascore:")
    ? await fetchPandaScoreResults(path.slice("pandascore:".length), year)
    : await fetchEspnResults(path, year);
  const start = (page - 1) * pageSize;
  return NextResponse.json({
    events: events.slice(start, start + pageSize),
    total: events.length,
    page,
    pages: Math.ceil(events.length / pageSize),
    year,
    tournament: path,
  });
}
