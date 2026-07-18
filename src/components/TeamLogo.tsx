"use client";

import Image from "next/image";
import { useState } from "react";
import { initials } from "@/lib/utils";

export function TeamLogo({
  name,
  src,
  size = 44,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="team-logo" style={{ width: size, height: size }}>
      {src && !failed ? (
        <Image src={src} alt="" width={size} height={size} onError={() => setFailed(true)} unoptimized={src.includes("espncdn.com")} />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
