import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { runSync } from "@/lib/sync";

async function authorized(request: Request) {
  const bearer = request.headers.get("authorization")?.trim();
  const cronSecret = process.env.CRON_SECRET?.trim().replace(/^["']|["']$/g, "");
  return (
    (await isAuthenticated()) ||
    Boolean(cronSecret && bearer === `Bearer ${cronSecret}`)
  );
}

async function synchronize(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const result = await runSync();
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/partido/[slug]", "page");
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "La sincronización falló." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  return synchronize(request);
}

export async function GET(request: Request) {
  return synchronize(request);
}
