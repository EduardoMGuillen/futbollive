"use client";

import { useEffect, useState } from "react";
import { formatEventDate, formatEventSchedule, formatEventTime } from "@/lib/utils";

type LocalTimeMode = "schedule" | "day" | "time" | "date" | "datetime" | "datetime-short";

function formatLocal(iso: string, mode: LocalTimeMode) {
  const schedule = formatEventSchedule(iso);
  switch (mode) {
    case "day":
      return schedule.day;
    case "time":
      return formatEventTime(iso);
    case "date":
      return formatEventDate(iso);
    case "datetime":
      return `${formatEventDate(iso)} · ${formatEventTime(iso)}`;
    case "datetime-short":
      return schedule.label;
    default:
      return schedule.label;
  }
}

export function LocalTime({
  iso,
  mode = "schedule",
  className,
  as = "time",
}: {
  iso: string;
  mode?: LocalTimeMode;
  className?: string;
  as?: "time" | "span" | "strong";
}) {
  const [label, setLabel] = useState(() => formatLocal(iso, mode));

  useEffect(() => {
    // Re-format in the browser so the visitor always sees their local timezone.
    queueMicrotask(() => setLabel(formatLocal(iso, mode)));
  }, [iso, mode]);

  const Tag = as;
  if (Tag === "time") {
    return (
      <time dateTime={iso} className={className} suppressHydrationWarning>
        {label}
      </time>
    );
  }
  return (
    <Tag className={className} suppressHydrationWarning>
      {label}
    </Tag>
  );
}

export function LocalSchedule({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [schedule, setSchedule] = useState(() => formatEventSchedule(iso));

  useEffect(() => {
    queueMicrotask(() => setSchedule(formatEventSchedule(iso)));
  }, [iso]);

  return (
    <time dateTime={iso} className={className || "event-when"} suppressHydrationWarning>
      <span className="event-when-day">{schedule.day}</span>
      <span className="event-when-time">{schedule.time}</span>
    </time>
  );
}
