"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { bookingId: number; sessionDate: string; startTime: string; status: string };

export function BookingOutcomeActions({ bookingId, sessionDate, startTime, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"completed" | "no_show" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionStart = new Date(`${sessionDate}T${startTime}`);
  const isPast = sessionStart.getTime() <= Date.now();
  const eligible = status === "confirmed" && isPast;

  if (!eligible) return null;

  async function markOutcome(outcome: "completed" | "no_show") {
    setLoading(outcome);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update booking.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-3">
        <button
          disabled={loading !== null}
          onClick={() => markOutcome("completed")}
          className="text-xs font-semibold text-success hover:underline disabled:opacity-50"
        >
          {loading === "completed" ? "Saving…" : "Mark completed"}
        </button>
        <button
          disabled={loading !== null}
          onClick={() => markOutcome("no_show")}
          className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
        >
          {loading === "no_show" ? "Saving…" : "Mark no-show"}
        </button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}