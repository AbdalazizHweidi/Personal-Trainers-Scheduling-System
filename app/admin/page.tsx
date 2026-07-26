
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminStats, getTodaysBookings, getTrainerRoster } from "@/lib/queries/admin";
import { StatCard } from "@/components/admin/stat-card";
import { BookingsTable } from "@/components/admin/bookings-table";
import { TrainerRoster } from "@/components/admin/trainer-roster";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const [stats, bookings, roster] = await Promise.all([
    getAdminStats(supabase),
    getTodaysBookings(supabase),
    getTrainerRoster(supabase),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Studio overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions today" value={String(stats.sessionsToday)} delta={`${stats.openSlotsToday} open slots left`} />
        <StatCard label="Revenue this week" value={`$${stats.revenueThisWeek.toFixed(0)}`} />
        <StatCard label="New clients" value={String(stats.newClientsThisWeek)} delta="This week" />
        <StatCard label="Utilization" value={`${stats.utilization}%`} delta="Across all trainers" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <BookingsTable rows={bookings} />
        <TrainerRoster items={roster} />
      </div>
    </div>
  );
}