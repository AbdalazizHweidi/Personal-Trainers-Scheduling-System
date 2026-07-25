import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllBookingsForClient, type ClientBooking } from "@/lib/queries/client-data";
import { formatTime } from "@/lib/utils";
import { BookingActions } from "@/components/booking-actions";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "#e2ede2", color: "#3f6b48" },
  pending: { bg: "#faedd0", color: "#c98f16" },
  completed: { bg: "#e1e4dc", color: "#5b6670" },
  cancelled: { bg: "#ffe6da", color: "#d94714" },
  cancelled_by_client: { bg: "#ffe6da", color: "#d94714" },
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const bookings = await getAllBookingsForClient(supabase, user.id);

  return (
    <>
      <h1 className="text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        My bookings
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: "#5b6670" }}>
        Every session you&apos;ve booked, past and upcoming.
      </p>

      <div className="mt-7 overflow-hidden rounded-md" style={{ background: "#fff", border: "1px solid #d7dad2" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Trainer", "Service", "Date", "Price", "Status", ""].map((h) => (
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
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-[14px] py-6 text-center text-sm" style={{ color: "#5b6670" }}>
                  No bookings yet.
                </td>
              </tr>
            )}
            {bookings.map((b, i) => (
              <BookingRow key={b.id} booking={b} isLast={i === bookings.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BookingRow({ booking, isLast }: { booking: ClientBooking; isLast: boolean }) {
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
        {new Date(booking.sessionDate + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
        , {formatTime(booking.startTime)}
      </td>
      <td
        className="px-[14px] py-[13px] text-[13px]"
        style={{ borderBottom: border, fontFamily: "var(--font-mono)" }}
      >
        ${booking.price}
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