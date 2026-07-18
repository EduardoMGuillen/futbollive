"use client";

import { Menu, Moon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "./Brand";
import { SearchBox } from "./SearchBox";

const nav = [
  ["En vivo", "/en-vivo"],
  ["Fútbol", "/deporte/futbol"],
  ["Baloncesto", "/deporte/baloncesto"],
  ["Béisbol", "/deporte/beisbol"],
  ["Tenis", "/deporte/tenis"],
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const current = localStorage.getItem("theme") === "dark";
    queueMicrotask(() => setDark(current));
    document.documentElement.dataset.theme = current ? "dark" : "light";
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  return (
    <header className="site-header">
      <div className="header-main container">
        <Brand compact />
        <SearchBox />
        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema"><Moon size={19} /></button>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegación principal">
        <div className="container">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label === "En vivo" && <span className="live-dot" />} {label}
            </Link>
          ))}
          <Link href="/en-vivo">Más deportes</Link>
        </div>
      </nav>
    </header>
  );
}
