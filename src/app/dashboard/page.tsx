import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { isAuthenticated } from "@/lib/auth";
import { readStore } from "@/lib/store";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect("/login");
  const data = await readStore();
  return <DashboardClient initialEvents={data.events} initialSettings={data.settings} initialBanners={data.banners} />;
}
