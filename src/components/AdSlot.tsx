"use client";

import { Megaphone } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Banner } from "@/lib/types";
import { adsenseClient, adsenseSlot } from "@/lib/utils";

export function AdSlot({ banner, variant = "wide" }: { banner?: Banner; variant?: "wide" | "box" }) {
  if (!banner?.active) return null;
  return <AdContent banner={banner} variant={variant} />;
}

function AdContent({ banner, variant }: { banner: Banner; variant: "wide" | "box" }) {
  const initialized = useRef(false);
  const client = adsenseClient();
  const slot = adsenseSlot(banner.position);

  useEffect(() => {
    if (!client || !slot || initialized.current) return;
    initialized.current = true;
    try {
      const target = window as typeof window & { adsbygoogle?: Record<string, unknown>[] };
      (target.adsbygoogle = target.adsbygoogle || []).push({});
    } catch {
      initialized.current = false;
    }
  }, [client, slot]);

  if (client && slot) {
    return (
      <div className={`adsense-wrap ad-${variant}`} aria-label="Publicidad">
        <span>PUBLICIDAD</span>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: variant === "box" ? 250 : 90 }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  const content = (
    <div className={`ad-slot ad-${variant}`}>
      <span>{banner.label}</span>
      <Megaphone size={22} />
      <strong>{banner.title}</strong>
      <small>Anúnciate en Dónde Juega</small>
    </div>
  );
  return banner.url ? <a href={banner.url} target="_blank" rel="sponsored noopener">{content}</a> : content;
}
