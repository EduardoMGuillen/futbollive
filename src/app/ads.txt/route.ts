import { adsenseClient } from "@/lib/utils";

export function GET() {
  const client = adsenseClient();
  if (!client) return new Response("# AdSense publisher not configured\n", { headers: { "content-type": "text/plain" } });
  const publisher = client.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain", "cache-control": "public, max-age=86400" },
  });
}
