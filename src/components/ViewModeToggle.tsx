"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ViewModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const mode = params.get("vista") === "agenda" ? "agenda" : "grid";

  const setMode = (next: "grid" | "agenda") => {
    const sp = new URLSearchParams(params.toString());
    if (next === "grid") sp.delete("vista");
    else sp.set("vista", "agenda");
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="filter-bar view-mode-toggle">
      <button type="button" className={mode === "grid" ? "active" : ""} onClick={() => setMode("grid")}>Cuadrícula</button>
      <button type="button" className={mode === "agenda" ? "active" : ""} onClick={() => setMode("agenda")}>Agenda del día</button>
    </div>
  );
}
