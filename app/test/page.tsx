import { createClient } from "@/lib/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("trainers")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .eq("id", 1);
    
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
}