import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: trainerCount }, { count: bookingCount }, { count: clientCount }] = await Promise.all([
    supabase.from("trainers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("bookings").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
  ]);

  return (
    <>
      <h1 className="text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        Admin overview
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: "#5b6670" }}>
        Platform-wide numbers at a glance.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Active trainers" value={String(trainerCount ?? 0)} />
        <StatCard label="Total bookings" value={String(bookingCount ?? 0)} />
        <StatCard label="Clients" value={String(clientCount ?? 0)} />
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md p-[18px]" style={{ background: "#fff", border: "1px solid #d7dad2" }}>
      <div
        className="text-[11px] uppercase tracking-[0.06em]"
        style={{ fontFamily: "var(--font-mono)", color: "#5b6670" }}
      >
        {label}
      </div>
      <div className="mt-1.5 text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </div>
    </div>
  );
}