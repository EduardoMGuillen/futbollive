export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatEventTime(iso: string, withDate = false) {
  return new Intl.DateTimeFormat("es-419", {
    weekday: withDate ? "short" : undefined,
    day: withDate ? "numeric" : undefined,
    month: withDate ? "short" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("es-419", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function relativeIso(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function statusFromDate(iso: string): "live" | "upcoming" | "finished" {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < -3 * 60 * 60 * 1000) return "finished";
  if (diff <= 0) return "live";
  return "upcoming";
}
