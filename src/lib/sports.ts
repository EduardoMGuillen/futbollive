export const sportIcons: Record<string, string> = {
  futbol: "⚽",
  baloncesto: "🏀",
  beisbol: "⚾",
  tenis: "🎾",
  automovilismo: "🏎",
  hockey: "🏒",
  "futbol-americano": "🏈",
  mma: "🥊",
  voleibol: "🏐",
  golf: "⛳",
  rugby: "🏉",
  cricket: "🏏",
  lacrosse: "🥍",
  "futbol-australiano": "🦵",
};

export function sportIcon(slug: string) {
  return sportIcons[slug] || "🏆";
}
