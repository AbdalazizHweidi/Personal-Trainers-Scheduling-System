
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
        <div
          className="mb-7 flex items-center justify-between rounded-md p-[22px] text-white"
          style={{ background: "#171b1f" }}
        >
          <div>
            <div className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "#ff8f5c" }}>
              {formatRelativeDay(data.nextSession.sessionDate)}
            </div>
            <h3 className="mt-1.5 text-[17px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
              {data.nextSession.serviceName} · with {data.nextSession.trainerName}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-[15px]" style={{ fontFamily: "var(--font-mono)" }}>
              {formatDisplayDate(data.nextSession.sessionDate)} · {formatTime(data.nextSession.startTime)}
            </div>
          </div>
        </div>
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
            Upcoming & past bookings
          </h3>
          <span
            className="inline-block rounded-[2px] px-2.5 py-1 text-[11px] uppercase tracking-[0.06em]"
            style={{ fontFamily: "var(--font-mono)", background: "#e1e4dc", color: "#5b6670" }}
          >
            {data.bookings.length} total
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
            {data.bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-[14px] py-6 text-center text-sm" style={{ color: "#5b6670" }}>
                  No bookings yet.
                </td>
              </tr>
            )}
            {data.bookings.map((b, i) => (
              <BookingTableRow key={b.id} booking={b} isLast={i === data.bookings.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BookingTableRow({ booking, isLast }: { booking: ClientBooking; isLast: boolean }) {
  const pill = STATUS_STYLES[booking.status];
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
        {booking.status === "completed" ? (
          <Link href="/trainers" className="text-xs font-medium" style={{ color: "#5b6670" }}>
            Rebook
          </Link>
        ) : (
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            sessionDate={booking.sessionDate}
            startTime={booking.startTime}
            rescheduleCount={booking.rescheduleCount}
            price={booking.price}
          />
        )}
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
  if (diffDays === 0) return "NEXT SESSION · TODAY";
  if (diffDays === 1) return "NEXT SESSION · TOMORROW";
  if (diffDays > 1) return `NEXT SESSION · IN ${diffDays} DAYS`;
  return `NEXT SESSION · ${formatDisplayDate(dateStr).toUpperCase()}`;

}