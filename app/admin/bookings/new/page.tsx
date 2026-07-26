import { createAdminClient } from "@/lib/supabase/admin";
import { getAllClients, getAllTrainersAdmin } from "@/lib/queries/admin";
import { AdminBookingForm } from "@/components/admin/admin-booking-form";

export const dynamic = "force-dynamic";

export default async function AdminNewBookingPage() {
  const supabase = createAdminClient();
  const [clients, trainers] = await Promise.all([getAllClients(supabase), getAllTrainersAdmin(supabase)]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">Book a session</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Creates the booking as unpaid. Record payment afterward from the Payments page.
      </p>
      <AdminBookingForm
        clients={clients.map((c) => ({ id: c.id, fullName: c.fullName, email: c.email }))}
        trainers={trainers.filter((t) => t.is_active)}
      />
    </div>
  );
}