import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const formData = await req.formData();
  const supabase = createAdminClient();

  const full_name = String(formData.get("full_name") ?? "");
  const bio = (formData.get("bio") as string) || null;
  const certifications = (formData.get("certifications") as string) || null;
  const specialties = String(formData.get("specialties") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const avg_rating = formData.get("avg_rating") ? Number(formData.get("avg_rating")) : 0;
  const photo = formData.get("photo") as File | null;

  let photo_url: string | null = null;

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json({ error: "Photo must be an image" }, { status: 400 });
    }
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Photo must be under 5MB" }, { status: 400 });
    }

    const ext = photo.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("trainer-photos")
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    photo_url = supabase.storage.from("trainer-photos").getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from("trainers")
    .insert({ full_name, bio, certifications, specialties, avg_rating, photo_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ trainer: data }, { status: 201 });
}