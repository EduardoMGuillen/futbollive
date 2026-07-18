import type { Metadata } from "next";
import {
  generateParticipantMetadata,
  generateParticipantStaticParams,
  ParticipantPage,
} from "@/lib/participant-page";

export async function generateStaticParams() {
  return generateParticipantStaticParams("atleta");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateParticipantMetadata(slug, "atleta");
}

export default async function AthletePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ParticipantPage slug={slug} kind="atleta" />;
}
