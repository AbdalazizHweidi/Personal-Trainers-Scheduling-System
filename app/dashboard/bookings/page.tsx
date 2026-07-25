import { createClient } from "@/lib/supabase/server";
import { getAllBookingsForClient } from "@/lib/queries/client-data";
import { formatTime } from "@/lib/utils";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "#e2ede2", color: "#3f6b48" },
  pending: { bg: "#faedd0", color: "#c98f16" },
  completed: { bg: "#e1e4dc", color: "#5b6670" },
  cancelled: { bg: "#ffe6da", color: "#d94714" },
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
              {["Trainer", "Service", "Date", "Price", "Status"].map((h) => (
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
                <td colSpan={5} className="px-[14px] py-6 text-center text-sm" style={{ color: "#5b6670" }}>
                  No bookings yet.
                </td>
              </tr>
            )}
            {bookings.map((b, i) => {
              const pill = STATUS_STYLES[b.status];
              const border = i === bookings.length - 1 ? "none" : "1px solid #d7dad2";
              return (
                <tr key={b.id}>
                  <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
                    {b.trainerName}
                  </td>
                  <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
                    {b.serviceName}
                  </td>
                  <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
                    {new Date(b.sessionDate + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    , {formatTime(b.startTime)}
                  </td>
                  <td
                    className="px-[14px] py-[13px] text-[13px]"
                    style={{ borderBottom: border, fontFamily: "var(--font-mono)" }}
                  >
                    ${b.price}
                  </td>
                  <td className="px-[14px] py-[13px]" style={{ borderBottom: border }}>
                    <span
                      className="inline-block rounded-full px-[9px] py-1 text-[10px] uppercase tracking-[0.04em]"
                      style={{ fontFamily: "var(--font-mono)", background: pill.bg, color: pill.color }}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}