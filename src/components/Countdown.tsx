"use client";

import { useEffect, useState } from "react";

function partsFrom(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return { days, hours, minutes, total };
}

function labelFrom(startsAt: string, now: number) {
  const { days, hours, minutes, total } = partsFrom(new Date(startsAt).getTime() - now);
  if (total <= 0) return "Empieza pronto";
  if (days > 0) return `En ${days}d ${hours}h`;
  if (hours > 0) return `En ${hours}h ${minutes}m`;
  return `En ${minutes}m`;
}

export function Countdown({
  startsAt,
  className = "countdown-badge",
}: {
  startsAt: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => labelFrom(startsAt, Date.now()));

  useEffect(() => {
    const tick = () => setLabel(labelFrom(startsAt, Date.now()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [startsAt]);

  return <span className={className}>{label}</span>;
}
