import { SupabaseClient } from "@supabase/supabase-js";

export async function getFeaturedPrograms(supabase: SupabaseClient, limit = 3) {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, type, duration_minutes, price")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("price", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}
export type Service = {
  id: number;
  name: string;
  type: string;
  duration_minutes: number;
  price: number;
};

export async function getServicesByTrainer(supabase: SupabaseClient, trainerId: number): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, type, duration_minutes, price")
    .eq("trainer_id", trainerId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("price", { ascending: true });

  if (error) throw error;
  return data;
}