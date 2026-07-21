import { slugify } from "@/lib/utils";

/** Canonical evergreen matchup slug: alphabetical team order for stable URLs. */
export function matchupSlug(homeName: string, awayName: string) {
  const a = slugify(homeName);
  const b = slugify(awayName);
  return a < b ? `${a}-vs-${b}` : `${b}-vs-${a}`;
}

export function parseMatchupSlug(slug: string) {
  const parts = slug.split("-vs-");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { left: parts[0], right: parts[1] };
}

export function eventMatchesMatchup(
  homeSlug: string,
  awaySlug: string,
  left: string,
  right: string,
) {
  return (homeSlug === left && awaySlug === right) || (homeSlug === right && awaySlug === left);
}
