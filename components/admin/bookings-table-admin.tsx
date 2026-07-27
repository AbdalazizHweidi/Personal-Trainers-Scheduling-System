"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils";
import { AdminBookingRow } from "@/lib/queries/admin";
import { BookingOutcomeActions } from "@/components/admin/booking-outcome-actions";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-success/15 text-success",
  pending: "bg-muted text-muted-foreground",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
  cancelled_by_client: "bg-destructive/15 text-destructive",
  cancelled_by_trainer: "bg-destructive/15 text-destructive",
  no_show: "bg-destructive/15 text-destructive",
};

export function BookingsTableAdmin({ rows }: { rows: AdminBookingRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function cancelBooking(id: number) {
    if (!confirm("Cancel this booking? This also frees up the slot.")) return;

    const refund = confirm("Refund the client? Click OK to refund, Cancel to skip the refund.");

    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refund }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't cancel booking. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Date</th>
            <th className="px-5 py-2.5 font-medium">Time</th>
            <th className="px-5 py-2.5 font-medium">Client</th>
            <th className="px-5 py-2.5 font-medium">Trainer</th>
            <th className="px-5 py-2.5 font-medium">Service</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">No bookings found.</td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-none">
                <td className="px-5 py-3">{r.date}</td>
                <td className="px-5 py-3">{formatTime(r.time)}</td>
                <td className="px-5 py-3">{r.clientName}</td>
                <td className="px-5 py-3">{r.trainerName}</td>
                <td className="px-5 py-3">{r.serviceName}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${STATUS_STYLE[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {["pending", "confirmed"].includes(r.status) && (
                    <button
                      disabled={pendingId === r.id}
                      onClick={() => cancelBooking(r.id)}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                    >
                      {pendingId === r.id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                  <BookingOutcomeActions
                    bookingId={r.id}
                    sessionDate={r.date}
                    startTime={r.time}
                    status={r.status}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}