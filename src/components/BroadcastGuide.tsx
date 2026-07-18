"use client";

import { ExternalLink, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BroadcastOption } from "@/lib/types";

const REGION_KEY = "dj_broadcast_region";
const regions = [
  ["all", "Todos los países"],
  ["mx", "México"],
  ["us", "Estados Unidos"],
  ["ar", "Argentina"],
  ["co", "Colombia"],
  ["cl", "Chile"],
  ["pe", "Perú"],
  ["es", "España"],
] as const;

export function BroadcastGuide({ broadcasts }: { broadcasts: BroadcastOption[] }) {
  const [region, setRegion] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem(REGION_KEY);
    const browserRegion = navigator.language.split("-")[1]?.toLowerCase();
    const initial = saved || (regions.some(([code]) => code === browserRegion) ? browserRegion : "all");
    queueMicrotask(() => setRegion(initial));
  }, []);

  const visible = useMemo(
    () => broadcasts.filter((item) => region === "all" || !item.region || item.region.toLowerCase() === region),
    [broadcasts, region],
  );
  const regionName = regions.find(([code]) => code === region)?.[1] || region.toUpperCase();

  const changeRegion = (value: string) => {
    setRegion(value);
    localStorage.setItem(REGION_KEY, value);
  };

  return (
    <div className="broadcast-guide">
      <label>
        <Globe2 size={16} />
        País
        <select value={region} onChange={(event) => changeRegion(event.target.value)}>
          {regions.map(([code, label]) => <option value={code} key={code}>{label}</option>)}
        </select>
      </label>
      {visible.length > 0 ? (
        <div className="broadcast-list">
          {visible.map((broadcast) =>
            broadcast.url ? (
              <a href={broadcast.url} key={`${broadcast.name}-${broadcast.region || "global"}`} target="_blank" rel="noopener sponsored">
                <strong>{broadcast.name}</strong>
                <small>{broadcast.type === "streaming" ? "Streaming" : broadcast.type === "radio" ? "Radio" : "TV"}{broadcast.region ? ` · ${broadcast.region.toUpperCase()}` : ""}</small>
                <span>Ir al sitio oficial <ExternalLink size={12} /></span>
              </a>
            ) : (
              <div key={`${broadcast.name}-${broadcast.region || "global"}`}>
                <strong>{broadcast.name}</strong>
                <small>{broadcast.type === "streaming" ? "Streaming" : broadcast.type === "radio" ? "Radio" : "TV"}{broadcast.region ? ` · ${broadcast.region.toUpperCase()}` : ""}</small>
                <span>Canal confirmado</span>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="broadcast-empty">
          No hay un canal confirmado para {regionName} todavía.
          {broadcasts.length > 0 && region !== "all" && <button type="button" onClick={() => changeRegion("all")}>Ver otras regiones</button>}
        </div>
      )}
    </div>
  );
}
