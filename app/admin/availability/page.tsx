import { createAdminClient } from "@/lib/supabase/admin";
import { getUpcomingAvailability, getAllTrainersAdmin } from "@/lib/queries/admin";
import { AvailabilityForm } from "@/components/admin/availability-form";
import { AvailabilityTable } from "@/components/admin/availability-table";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const supabase = createAdminClient();
  const [slots, trainers] = await Promise.all([
    getUpcomingAvailability(supabase),
    getAllTrainersAdmin(supabase),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Availability</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Add a slot</h3>
          <AvailabilityForm trainers={trainers.filter((t) => t.is_active)} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Upcoming slots</h3>
          <AvailabilityTable slots={slots} />
        </div>
      </div>
    </div>
  );
}