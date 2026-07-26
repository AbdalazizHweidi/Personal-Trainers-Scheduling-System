import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://fitconnect.studio"; // swap for your real deployed domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("trainers")
    .select("id")
    .eq("is_active", true)
    .is("deleted_at", null);

  const trainerRoutes: MetadataRoute.Sitemap = (trainers ?? []).map((t) => ({
    url: `${BASE_URL}/trainers/${t.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/trainers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...trainerRoutes,
  ];
}