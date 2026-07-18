"use client";

import { Download, Eye, EyeOff, LogOut, Pencil, Plus, RefreshCw, Save, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Banner, SiteSettings, SportsEvent } from "@/lib/types";
import { eventTitle, slugify } from "@/lib/utils";

export function DashboardClient({
  initialEvents,
  initialSettings,
  initialBanners,
}: {
  initialEvents: SportsEvent[];
  initialSettings: SiteSettings;
  initialBanners: Banner[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [settings, setSettings] = useState(initialSettings);
  const [banners, setBanners] = useState(initialBanners);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<SportsEvent | null>(null);

  const flash = (value: string) => {
    setMessage(value);
    setTimeout(() => setMessage(""), 3500);
  };

  const refreshEvents = async () => {
    const response = await fetch("/api/admin/events");
    const body = (await response.json()) as { events: SportsEvent[] };
    setEvents(body.events);
  };

  const toggle = async (event: SportsEvent, field: "featured" | "hidden" | "excludedFromLive") => {
    const updated = { ...event, [field]: !event[field] };
    setEvents((current) => current.map((item) => item.id === event.id ? updated : item));
    const response = await fetch("/api/admin/events", {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(updated),
    });
    if (!response.ok) await refreshEvents();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este evento definitivamente?")) return;
    await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setEvents((current) => current.filter((event) => event.id !== id));
    flash("Evento eliminado.");
  };

  const create = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setBusy(true);
    const form = new FormData(formEvent.currentTarget);
    const payload = {
      home: form.get("home"), away: form.get("away"), sport: form.get("sport"),
      league: form.get("league"), startsAt: form.get("startsAt"), status: form.get("status"),
      venue: form.get("venue"), country: form.get("country"), importance: form.get("importance"),
      homeLogo: form.get("homeLogo"), awayLogo: form.get("awayLogo"),
      featured: form.get("featured") === "on",
    };
    const updatedEvent = editing ? {
      ...editing,
      sport: String(payload.sport),
      sportSlug: slugify(String(payload.sport)),
      league: String(payload.league),
      leagueSlug: slugify(String(payload.league)),
      home: { ...editing.home, name: String(payload.home), slug: slugify(String(payload.home)), logo: String(payload.homeLogo) || undefined },
      away: { ...editing.away, name: String(payload.away), slug: slugify(String(payload.away)), logo: String(payload.awayLogo) || undefined },
      startsAt: new Date(String(payload.startsAt)).toISOString(),
      status: payload.status as SportsEvent["status"],
      venue: String(payload.venue),
      country: String(payload.country),
      importance: Number(payload.importance),
      featured: payload.featured,
    } : payload;
    const response = await fetch("/api/admin/events", {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });
    setBusy(false);
    if (!response.ok) return flash("No se pudo crear. Revisa los campos.");
    formEvent.currentTarget.reset();
    setEditing(null);
    await refreshEvents();
    flash(editing ? "Evento actualizado correctamente." : "Evento creado correctamente.");
  };

  const sync = async () => {
    setBusy(true);
    const response = await fetch("/api/admin/sync", { method: "POST" });
    const body = (await response.json()) as { imported?: number; error?: string; lastSync?: string };
    setBusy(false);
    if (!response.ok) return flash(body.error || "No se pudo sincronizar.");
    setSettings((current) => ({ ...current, lastSync: body.lastSync }));
    await refreshEvents();
    flash(`${body.imported || 0} eventos obtenidos de TheSportsDB.`);
  };

  const saveConfig = async () => {
    setBusy(true);
    const response = await fetch("/api/admin/config", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...settings, banners }),
    });
    setBusy(false);
    flash(response.ok ? "Configuración guardada." : "No se pudo guardar.");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ events, settings, banners }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donde-juega-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const live = events.filter((event) => event.status === "live").length;
  const missingLogos = events.filter((event) => !event.home.logo || !event.away.logo).length;
  const featured = events.filter((event) => event.featured).length;

  return (
    <div className="container dashboard-shell">
      <div className="dashboard-head">
        <div><span className="eyebrow"><i /> Administración</span><h1>Centro de control</h1></div>
        <div className="dashboard-actions">
          <button className="secondary-btn" onClick={exportData}><Download size={16} /> Exportar</button>
          <button className="primary-btn" onClick={sync} disabled={busy}><RefreshCw size={16} /> Sincronizar</button>
          <form action="/api/auth/logout" method="post"><button className="secondary-btn" type="submit"><LogOut size={16} /></button></form>
        </div>
      </div>
      {message && <div className="toast">{message}</div>}
      <div className="dashboard-stats">
        <div className="stat-card"><span>Eventos totales</span><strong>{events.length}</strong></div>
        <div className="stat-card"><span>En vivo ahora</span><strong>{live}</strong></div>
        <div className="stat-card"><span>Destacados</span><strong>{featured}</strong></div>
        <div className="stat-card"><span>Logos incompletos</span><strong>{missingLogos}</strong></div>
      </div>

      <div className="dashboard-grid">
        <div className="panel admin-scroll">
          <div className="section-head"><div><h2>Eventos</h2><p>Destaca, oculta o elimina eventos.</p></div></div>
          <table className="admin-table">
            <thead><tr><th>Partido</th><th>Deporte</th><th>Estado</th><th>Importancia</th><th>Acciones</th></tr></thead>
            <tbody>{events.map((event) => (
              <tr key={event.id}>
                <td><strong>{eventTitle(event)}</strong><br /><small>{event.league}</small></td>
                <td>{event.sport}</td>
                <td><span className={`status-pill ${event.status}`}>{event.status}</span></td>
                <td>{event.importance}/100</td>
                <td>
                  <button title="Destacar" onClick={() => toggle(event, "featured")}><Star size={16} fill={event.featured ? "currentColor" : "none"} /></button>
                  <button title="Ocultar" onClick={() => toggle(event, "hidden")}>{event.hidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button title="Excluir de En vivo" onClick={() => toggle(event, "excludedFromLive")}>Live {event.excludedFromLive ? "×" : "✓"}</button>
                  <button title="Editar" onClick={() => setEditing(event)}><Pencil size={16} /></button>
                  <button title="Eliminar" onClick={() => remove(event.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <form className="panel admin-form" onSubmit={create} key={editing?.id || "new"}>
          <h2>{editing ? <><Pencil size={18} /> Editar evento</> : <><Plus size={18} /> Nuevo evento</>}</h2>
          <div className="form-field"><label>Local / participante 1</label><input name="home" defaultValue={editing?.home.name} required /></div>
          <div className="form-field"><label>Visitante / participante 2</label><input name="away" defaultValue={editing?.away.name} required /></div>
          <div className="form-field"><label>Deporte</label><input name="sport" placeholder="Fútbol" defaultValue={editing?.sport} required /></div>
          <div className="form-field"><label>Competición</label><input name="league" defaultValue={editing?.league} required /></div>
          <div className="form-field"><label>Fecha y hora</label><input name="startsAt" type="datetime-local" defaultValue={editing ? new Date(editing.startsAt).toISOString().slice(0, 16) : undefined} required /></div>
          <div className="form-field"><label>Estado</label><select name="status" defaultValue={editing?.status || "upcoming"}><option value="upcoming">Próximo</option><option value="live">En vivo</option><option value="finished">Finalizado</option></select></div>
          <div className="form-field"><label>Sede</label><input name="venue" defaultValue={editing?.venue} /></div>
          <div className="form-field"><label>País</label><input name="country" defaultValue={editing?.country} /></div>
          <div className="form-field"><label>Importancia (0–100)</label><input name="importance" type="number" min="0" max="100" defaultValue={editing?.importance ?? 70} required /></div>
          <div className="form-field"><label>URL logo local</label><input name="homeLogo" type="url" defaultValue={editing?.home.logo} /></div>
          <div className="form-field"><label>URL logo visitante</label><input name="awayLogo" type="url" defaultValue={editing?.away.logo} /></div>
          <label><input name="featured" type="checkbox" defaultChecked={editing?.featured} /> Marcar como destacado</label>
          <button className="primary-btn full-btn" disabled={busy} type="submit"><Save size={16} /> {editing ? "Guardar cambios" : "Crear evento"}</button>
          {editing && <button className="secondary-btn full-btn" type="button" onClick={() => setEditing(null)}>Cancelar edición</button>}
        </form>
      </div>

      <section className="content-section">
        <div className="section-head"><div><h2>Curación y monetización</h2><p>Controla qué aparece en portada y tus espacios comerciales.</p></div></div>
        <div className="dashboard-grid">
          <div className="panel">
            <h3>Reglas de “En vivo”</h3>
            <div className="form-field"><label>Importancia mínima: {settings.liveThreshold}</label><input type="range" min="0" max="100" value={settings.liveThreshold} onChange={(e) => setSettings({ ...settings, liveThreshold: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Máximo de eventos destacados</label><input type="number" min="1" max="20" value={settings.maxFeaturedLive} onChange={(e) => setSettings({ ...settings, maxFeaturedLive: Number(e.target.value) })} /></div>
            <label><input type="checkbox" checked={settings.ctaEnabled} onChange={(e) => setSettings({ ...settings, ctaEnabled: e.target.checked })} /> Activar enlaces “Dónde ver” globalmente</label>
            <p><small>Última sincronización: {settings.lastSync ? new Date(settings.lastSync).toLocaleString("es") : "Aún no ejecutada"}</small></p>
          </div>
          <div className="panel">
            <h3>Banners publicitarios</h3>
            {banners.map((banner, index) => (
              <div key={banner.id} className="form-field">
                <label>{banner.position.toUpperCase()}</label>
                <input value={banner.title} onChange={(e) => setBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))} />
                <input value={banner.label} placeholder="Etiqueta" onChange={(e) => setBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item))} />
                <input type="url" value={banner.url || ""} placeholder="URL de destino (opcional)" onChange={(e) => setBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item))} />
                <label><input type="checkbox" checked={banner.active} onChange={(e) => setBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, active: e.target.checked } : item))} /> Activo</label>
              </div>
            ))}
          </div>
        </div>
        <button className="primary-btn" onClick={saveConfig} disabled={busy}><Save size={16} /> Guardar configuración</button>
      </section>
    </div>
  );
}
