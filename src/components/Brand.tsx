import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="Dónde Juega, inicio">
      <Image src="/icon.png" alt="" width={compact ? 40 : 52} height={compact ? 40 : 52} priority />
      <span className="brand-word">Dónde<em>Juega</em></span>
    </Link>
  );
}
