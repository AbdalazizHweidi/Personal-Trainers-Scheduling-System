"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cancelBooking } from "@/app/dashboard/bookings/actions";
import { isCancelled, type BookingStatus } from "@/lib/queries/client-data";

export function BookingActions({
  bookingId,
  status,
  sessionDate,
  startTime,
  rescheduleCount,
  price,
}: {
  bookingId: number;
  status: BookingStatus;
  sessionDate: string;
  startTime: string;
  rescheduleCount: number;
  price: number;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const sessionDateTime = new Date(`${sessionDate}T${startTime}`);
  const hoursLeft = (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const sessionStarted = hoursLeft <= 0; // policy: no cancellation once session has started
  const eligibleForRefund = hoursLeft >= 24; // policy: free cancellation up to 24h before

  const canManage = !sessionStarted && (status === "confirmed" || status === "pending");
  const canReschedule = canManage && rescheduleCount < 1;

  if (cancelled || isCancelled(status)) {
    return (
      <span className="text-xs" style={{ color: "#5b6670" }}>
        Cancelled
      </span>
    );
  }

  if (!canManage) return null;

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCancelled(true);
      setShowConfirm(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {canReschedule && (
        <Link
          href={`/dashboard/bookings/${bookingId}/reschedule`}
          className="text-xs font-semibold"
          style={{ color: "#d94714" }}
        >
          Reschedule
        </Link>
      )}
      <button onClick={() => setShowConfirm(true)} className="text-xs font-medium" style={{ color: "#5b6670" }}>
        Cancel
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(23,27,31,0.5)" }}
          onClick={() => !isPending && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-[380px] rounded-md p-6"
            style={{ background: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>
              Cancel this session?
            </h3>
            <p className="mt-2 text-sm" style={{ color: "#5b6670" }}>
              {eligibleForRefund
                ? `Since it's more than 24 hours away, you'll get your $${price} back.`
                : `This session starts in under 24 hours, so under our cancellation policy this $${price} payment is non-refundable.`}
            </p>
            {error && (
              <p className="mt-3 rounded px-3 py-2 text-xs" style={{ background: "#ffe6da", color: "#d94714" }}>
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="rounded-[3px] border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: "#d7dad2", color: "#171b1f" }}
              >
                Keep session
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-[3px] px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "#d94714" }}
              >
                {isPending ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}