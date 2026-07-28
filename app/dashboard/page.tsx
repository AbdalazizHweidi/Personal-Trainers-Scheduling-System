import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatTime } from "@/lib/utils";
import { BookingActions } from "@/components/booking-actions";
import type { ClientBooking } from "@/lib/queries/client-data";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "#e2ede2", color: "#3f6b48" },
  pending: { bg: "#faedd0", color: "#c98f16" },
  completed: { bg: "#e1e4dc", color: "#5b6670" },
  cancelled: { bg: "#ffe6da", color: "#d94714" },
  cancelled_by_client: { bg: "#ffe6da", color: "#d94714" },
};

// Statuses that should never be treated as "upcoming", even if the
// session date happens to be in the future (e.g. cancelled early).
const NON_UPCOMING_STATUSES = new Set([
  "completed",
  "cancelled",
  "cancelled_by_client",
  "cancelled_by_trainer",
  "no_show",
]);

function isUpcomingBooking(booking: ClientBooking) {
  if (NON_UPCOMING_STATUSES.has(booking.status)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDateTime = new Date(`${booking.sessionDate}T${booking.startTime}`);
  // Fall back to date-only comparison if startTime parsing fails for any reason.
  if (isNaN(sessionDateTime.getTime())) {
    const sessionDate = new Date(`${booking.sessionDate}T00:00:00`);
    return sessionDate.getTime() >= today.getTime();
  }

  return sessionDateTime.getTime() >= today.getTime();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const data = await getDashboardData(supabase, user.id, profile?.full_name ?? "there");

  const upcomingBookings = data.bookings
    .filter(isUpcomingBooking)
    .sort(
      (a, b) =>
        new Date(`${a.sessionDate}T${a.startTime}`).getTime() -
        new Date(`${b.sessionDate}T${b.startTime}`).getTime()
    );

  return (
    <>
      <div className="mb-[30px] flex items-center justify-between">
        <div>
          <h1 className="text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back, {data.firstName}
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "#5b6670" }}>
            Here&apos;s what&apos;s on your schedule.
          </p>
        </div>
        <Link
          href="/trainers"
          className="rounded-[3px] px-[22px] py-[11px] text-sm font-semibold text-white"
          style={{ background: "#ff5a1f" }}
        >
          Book a session
        </Link>
      </div>

      {data.nextSession ? (
        <NextSessionCard session={data.nextSession} />
      ) : (
        <div
          className="mb-7 rounded-md border border-dashed p-6 text-center text-sm"
          style={{ borderColor: "#d7dad2", color: "#5b6670" }}
        >
          No upcoming sessions booked yet.
        </div>
      )}

      <div className="mb-[30px] grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <div className="overflow-hidden rounded-md" style={{ background: "#fff", border: "1px solid #d7dad2" }}>
        <div
          className="flex items-center justify-between px-[18px] py-4"
          style={{ borderBottom: "1px solid #d7dad2" }}
        >
          <h3 className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
            Upcoming bookings
          </h3>
          <span
            className="inline-block rounded-[2px] px-2.5 py-1 text-[11px] uppercase tracking-[0.06em]"
            style={{ fontFamily: "var(--font-mono)", background: "#e1e4dc", color: "#5b6670" }}
          >
            {upcomingBookings.length} total
          </span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Trainer", "Service", "Date", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-[14px] py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em]"
                  style={{ borderBottom: "1px solid #d7dad2", color: "#5b6670" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {upcomingBookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-[14px] py-6 text-center text-sm" style={{ color: "#5b6670" }}>
                  No upcoming bookings.
                </td>
              </tr>
            )}
            {upcomingBookings.map((b, i) => (
              <BookingTableRow key={b.id} booking={b} isLast={i === upcomingBookings.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function NextSessionCard({ session }: { session: ClientBooking }) {
  const initials = session.trainerName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  // Falls back to initials if trainerPhotoUrl is missing/null.
  const photoUrl = (session as ClientBooking & { trainerPhotoUrl?: string | null }).trainerPhotoUrl;

  return (
    <div
      className="relative mb-7 overflow-hidden rounded-lg p-[26px] text-white"
      style={{ background: "linear-gradient(135deg, #171b1f 0%, #2b3138 100%)" }}
    >
      {/* accent bar */}
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ background: "#ff5a1f" }} />

      {/* decorative glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,90,31,0.18) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-full">
              <Image
                src={photoUrl}
                alt={session.trainerName}
                fill
                sizes="54px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full text-[17px] font-semibold"
              style={{ background: "#ff5a1f", fontFamily: "var(--font-display)" }}
            >
              {initials}
            </div>
          )}

          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em]"
              style={{ background: "rgba(255,90,31,0.18)", color: "#ff8f5c", fontFamily: "var(--font-mono)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#ff8f5c" }} />
              {formatRelativeDay(session.sessionDate)}
            </div>
            <h3
              className="mt-2 text-[19px] font-semibold leading-tight"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {session.serviceName}
            </h3>
            <p className="mt-0.5 text-[13px]" style={{ color: "#9aa0a6" }}>
              with {session.trainerName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="text-right">
            <div
              className="text-[19px] font-semibold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatTime(session.startTime)}
            </div>
            <div className="text-[12px]" style={{ color: "#9aa0a6" }}>
              {formatDisplayDate(session.sessionDate)}
            </div>
          </div>
          <Link
            href="/dashboard/bookings"
            className="rounded-[3px] border px-4 py-2 text-[12px] font-semibold transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

function BookingTableRow({ booking, isLast }: { booking: ClientBooking; isLast: boolean }) {
  const pill = STATUS_STYLES[booking.status] ?? { bg: "#e1e4dc", color: "#5b6670" };
  const border = isLast ? "none" : "1px solid #d7dad2";

  return (
    <tr>
      <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
        {booking.trainerName}
      </td>
      <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
        {booking.serviceName}
      </td>
      <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
        {formatDisplayDate(booking.sessionDate)}, {formatTime(booking.startTime)}
      </td>
      <td className="px-[14px] py-[13px]" style={{ borderBottom: border }}>
        <span
          className="inline-block rounded-full px-[9px] py-1 text-[10px] uppercase tracking-[0.04em]"
          style={{ fontFamily: "var(--font-mono)", background: pill.bg, color: pill.color }}
        >
          {booking.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-[14px] py-[13px] text-right" style={{ borderBottom: border }}>
        <BookingActions
          bookingId={booking.id}
          status={booking.status}
          sessionDate={booking.sessionDate}
          startTime={booking.startTime}
          rescheduleCount={booking.rescheduleCount}
          price={booking.price}
        />
      </td>
    </tr>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
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
      <div className="mt-1 text-[11px]" style={{ color: "#3f6b48" }}>
        {delta}
      </div>
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
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  return formatDisplayDate(dateStr);
}