import { headers } from "next/headers";

/** User-agents de crawlers de Google Ads / Search — deben recibir HTML rápido. */
export async function isSearchOrAdsCrawler() {
  const ua = (await headers()).get("user-agent")?.toLowerCase() ?? "";
  return /googlebot|mediapartners-google|adsbot-google|google-display-ads-bot|google-inspectiontool|bingbot|duckduckbot|slurp|yandexbot|facebookexternalhit|twitterbot/i.test(
    ua,
  );
}
