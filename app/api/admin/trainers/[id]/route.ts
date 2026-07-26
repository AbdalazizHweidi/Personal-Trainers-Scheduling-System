import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const formData = await req.formData();
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};

  if (formData.has("is_active")) updates.is_active = formData.get("is_active") === "true";
  if (formData.has("full_name")) updates.full_name = formData.get("full_name");
  if (formData.has("bio")) updates.bio = (formData.get("bio") as string) || null;
  if (formData.has("certifications")) updates.certifications = (formData.get("certifications") as string) || null;
  if (formData.has("avg_rating")) updates.avg_rating = Number(formData.get("avg_rating"));
  if (formData.has("specialties")) {
    updates.specialties = String(formData.get("specialties"))
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const photo = formData.get("photo") as File | null;
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
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });
    updates.photo_url = supabase.storage.from("trainer-photos").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("trainers").update(updates).eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}



/*import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("trainers")
    .update({ is_active: body.is_active })
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}*/