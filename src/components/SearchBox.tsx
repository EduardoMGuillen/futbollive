"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatEventSchedule, initials } from "@/lib/utils";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  startsAt?: string;
  href: string;
  image?: string;
  type: "Evento" | "Equipo" | "Atleta" | "Competición";
};

export function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", shortcut);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", shortcut);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className={`search-box ${open ? "is-open" : ""}`} ref={containerRef}>
      <button className="search-trigger" onClick={() => setOpen(true)} aria-label="Buscar partidos">
        <Search size={19} />
        <span>Buscar partidos, equipos...</span>
        <kbd>⌘ K</kbd>
      </button>
      {open && (
        <div className="search-panel">
          <div className="search-input-row">
            <Search size={20} />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value.trim().length < 2) setResults([]);
              }}
              placeholder="Busca un equipo, partido o competición"
              aria-label="Buscar"
            />
            <button onClick={() => setOpen(false)} aria-label="Cerrar búsqueda"><X size={18} /></button>
          </div>
          <div className="search-results">
            {query.length < 2 && <p className="search-hint">Escribe al menos 2 letras para buscar.</p>}
            {loading && <p className="search-hint">Buscando...</p>}
            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="search-hint">No encontramos resultados similares.</p>
            )}
            {results.map((result) => (
              <Link key={`${result.type}-${result.id}`} href={result.href} onClick={() => setOpen(false)}>
                <div className="result-logo">
                  {result.image ? (
                    <Image src={result.image} alt="" width={38} height={38} />
                  ) : (
                    <span>{initials(result.title)}</span>
                  )}
                </div>
                <div>
                  <strong>{result.title}</strong>
                  <small>
                    {result.startsAt
                      ? `${result.subtitle} · ${formatEventSchedule(result.startsAt).label}`
                      : result.subtitle}
                  </small>
                </div>
                <em>{result.type}</em>
              </Link>
            ))}
            {results.length > 0 && (
              <Link className="all-results" href={`/buscar?q=${encodeURIComponent(query)}`} onClick={() => setOpen(false)}>
                Ver todos los resultados
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
