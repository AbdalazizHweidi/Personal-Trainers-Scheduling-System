import { formatTime } from "@/lib/utils";
import { TodayBookingRow } from "@/lib/queries/admin";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-muted text-muted-foreground",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export function BookingsTable({ rows }: { rows: TodayBookingRow[] }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-card-foreground">Today&apos;s bookings</h3>
        <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-secondary-foreground">
          {rows.length} total
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Time</th>
            <th className="px-5 py-2.5 font-medium">Client</th>
            <th className="px-5 py-2.5 font-medium">Trainer</th>
            <th className="px-5 py-2.5 font-medium">Service</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                No bookings today.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-none">
                <td className="px-5 py-3">{formatTime(r.time)}</td>
                <td className="px-5 py-3">{r.clientName}</td>
                <td className="px-5 py-3">{r.trainerName}</td>
                <td className="px-5 py-3">{r.serviceName}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                      STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}