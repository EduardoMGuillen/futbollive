"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SearchableOption = { value: string; label: string };

export function SearchableSelect({
  name,
  options,
  value,
  placeholder = "Buscar…",
  required,
}: {
  name: string;
  options: SearchableOption[];
  value: string;
  placeholder?: string;
  required?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === selected)?.label || "";

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!q) return options.slice(0, 80);
    return options.filter((o) =>
      o.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(q),
    ).slice(0, 80);
  }, [options, query]);

  return (
    <div className="searchable-select" ref={containerRef}>
      <input type="hidden" name={name} value={selected} required={required} />
      <div className="searchable-select-control">
        <Search size={16} aria-hidden />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          placeholder={selectedLabel || placeholder}
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
        />
        <button type="button" className="searchable-select-toggle" onClick={() => setOpen(!open)} aria-label="Abrir lista">
          <ChevronDown size={16} />
        </button>
      </div>
      {open && (
        <ul id={listId} className="searchable-select-list" role="listbox">
          {filtered.length ? filtered.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === selected}
                className={option.value === selected ? "is-active" : ""}
                onClick={() => {
                  setSelected(option.value);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          )) : <li className="searchable-select-empty">Sin coincidencias</li>}
        </ul>
      )}
    </div>
  );
}
