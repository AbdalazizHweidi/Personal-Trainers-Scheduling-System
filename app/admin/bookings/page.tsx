import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllBookings } from "@/lib/queries/admin";
import { BookingsTableAdmin } from "@/components/admin/bookings-table-admin";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = createAdminClient();
  const bookings = await getAllBookings(supabase, { status });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Bookings</h1>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Book a session
        </Link>
      </div>

      <div className="mt-5 mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/bookings"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !status ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${
              status === s ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <BookingsTableAdmin rows={bookings} />
    </div>
  );
}