import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, type BookingRow } from "@/lib/queries/dashboard";
import { formatTime } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-secondary text-secondary-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout already redirects if !user, but TypeScript needs the narrow:
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const data = await getDashboardData(supabase, user.id, profile?.full_name ?? "there");

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Welcome back, {data.firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s on your schedule.</p>
        </div>
        <Link
          href="/trainers"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Book a session
        </Link>
      </div>

      {data.nextSession ? (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-foreground p-6 text-background">
          <div>
            <div className="font-mono text-xs text-primary">
              NEXT SESSION · {formatRelativeDay(data.nextSession.sessionDate)}
            </div>
            <h3 className="mt-1.5 text-lg font-semibold">
              {data.nextSession.serviceName} · with {data.nextSession.trainerName}
            </h3>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">
              {formatDisplayDate(data.nextSession.sessionDate)} · {formatTime(data.nextSession.startTime)}
            </div>
            <button className="mt-2 rounded-md border border-background/30 px-4 py-1.5 text-xs font-semibold">
              Reschedule
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No upcoming sessions booked yet.
        </div>
      )}

      <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Sessions this month"
          value={String(data.sessionsThisMonth)}
          delta={`${data.sessionsThisMonth >= data.sessionsLastMonth ? "+" : ""}${
            data.sessionsThisMonth - data.sessionsLastMonth
          } vs last month`}
        />
        <StatCard label="Total spent" value={`$${data.totalSpentThisMonth}`} delta="This month" />
        <StatCard
          label="Saved trainers"
          value={String(data.savedTrainerCount)}
          delta={data.savedTrainerNames.slice(0, 2).join(", ") || "—"}
        />
        <StatCard label="Total bookings" value={String(data.bookings.length)} delta="All time" />
      </div>

      <div className="mt-7 overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-card-foreground">Upcoming & past bookings</h3>
          <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] text-secondary-foreground">
            {data.bookings.length} total
          </span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Trainer", "Service", "Date", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No bookings yet.
                </td>
              </tr>
            )}
            {data.bookings.map((b) => (
              <BookingTableRow key={b.id} booking={b} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BookingTableRow({ booking }: { booking: BookingRow }) {
  return (
    <tr>
      <td className="border-b border-border px-4 py-3 text-sm text-card-foreground">
        {booking.trainerName}
      </td>
      <td className="border-b border-border px-4 py-3 text-sm text-card-foreground">
        {booking.serviceName}
      </td>
      <td className="border-b border-border px-4 py-3 text-sm text-card-foreground">
        {formatDisplayDate(booking.sessionDate)}, {formatTime(booking.startTime)}
      </td>
      <td className="border-b border-border px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${STATUS_STYLES[booking.status]}`}
        >
          {booking.status}
        </span>
      </td>
      <td className="border-b border-border px-4 py-3 text-right">
        {booking.status === "completed" ? (
          <Link href="/trainers" className="text-xs font-medium text-muted-foreground hover:underline">
            Rebook
          </Link>
        ) : (
          <Link
            href={`/dashboard/bookings/${booking.id}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage
          </Link>
        )}
      </td>
    </tr>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-display text-3xl text-card-foreground">{value}</div>
      <div className="mt-1 text-xs text-success">{delta}</div>
    </div>
  );
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelativeDay(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "TOMORROW";
  if (diffDays > 1) return `IN ${diffDays} DAYS`;
  return formatDisplayDate(dateStr).toUpperCase();
}