import Link from "next/link";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { requireAdminAccess } from "@/lib/auth/access";
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
  await requireAdminAccess();
  const supabase = await createPrivilegedClient();
  const bookings = await getAllBookings(supabase, { status });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Bookings</h1>

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