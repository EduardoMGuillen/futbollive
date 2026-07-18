import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { readStore, writeStore } from "@/lib/store";

const schema = z.object({
  liveThreshold: z.coerce.number().min(0).max(100),
  maxFeaturedLive: z.coerce.number().min(1).max(20),
  ctaEnabled: z.boolean(),
  banners: z.array(z.object({
    id: z.string(),
    title: z.string().min(1).max(120),
    label: z.string().min(1).max(30),
    position: z.enum(["top", "feed", "sidebar", "detail", "footer"]),
    active: z.boolean(),
    url: z.string().optional(),
    image: z.string().optional(),
  })),
});

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Configuración inválida." }, { status: 400 });
  const data = await readStore();
  data.settings = {
    ...data.settings,
    liveThreshold: parsed.data.liveThreshold,
    maxFeaturedLive: parsed.data.maxFeaturedLive,
    ctaEnabled: parsed.data.ctaEnabled,
  };
  data.banners = parsed.data.banners;
  await writeStore(data);
  revalidatePath("/");
  return NextResponse.json({ settings: data.settings, banners: data.banners });
}
