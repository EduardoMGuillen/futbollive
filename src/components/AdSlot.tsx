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

  const placeholder = (
    <div className={`ad-slot ad-${variant} ad-fallback`}>
      <span>{banner.label}</span>
      <Megaphone size={22} />
      <strong>{banner.title}</strong>
      <small>Anúnciate en Dónde Juega</small>
    </div>
  );

  if (client && slot) {
    // The placeholder stays visible until AdSense fills the unit (data-ad-status="filled").
    return (
      <div className={`adsense-wrap ad-${variant}`} aria-label="Publicidad">
        <span>PUBLICIDAD</span>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        {placeholder}
      </div>
    );
  }

  return banner.url ? <a href={banner.url} target="_blank" rel="sponsored noopener">{placeholder}</a> : placeholder;
}
