export const FAVORITES_KEY = "dj_favorites";
export const FAVORITES_CHANGED = "dj:favorites-changed";
export const REMINDERS_KEY = "dj_favorite_reminders";

export function readFavoriteIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function writeFavoriteIds(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED));
}
