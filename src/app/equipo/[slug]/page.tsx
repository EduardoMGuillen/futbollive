import type { Metadata } from "next";
import {
  generateParticipantMetadata,
  ParticipantPage,
} from "@/lib/participant-page";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateParticipantMetadata(slug, "equipo");
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ParticipantPage slug={slug} kind="equipo" />;
}
