"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils";
import { rescheduleBooking } from "@/app/dashboard/bookings/[bookingId]/reschedule/actions";

type Slot = { id: number; time: string; status: "open" | "blocked" | "booked" };
type Day = { date: string; dayLabel: string; slots: Slot[] };

export function RescheduleFlow({
  bookingId,
  currentDate,
  currentTime,
  durationMinutes,
  availability,
}: {
  bookingId: number;
  currentDate: string;
  currentTime: string;
  durationMinutes: number;
  availability: Day[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<Day | null>(
    availability.find((d) => d.slots.some((s) => s.status === "open")) ?? null
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    if (!selectedDay || !selectedSlot) return;
    setError(null);

    startTransition(async () => {
      const result = await rescheduleBooking({
        bookingId,
        newSlotId: selectedSlot.id,
        newDate: selectedDay.date,
        newStartTime: selectedSlot.time,
        durationMinutes,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/bookings");
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
        Reschedule your session
      </h2>
      <p className="mt-1 text-sm" style={{ color: "#5b6670" }}>
        Currently booked for{" "}
        {new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
        {formatTime(currentTime)}. Each booking can only be rescheduled once — further changes require cancelling
        and creating a new booking.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {availability.map((day) => (
          <button
            key={day.date}
            onClick={() => {
              setSelectedDay(day);
              setSelectedSlot(null);
            }}
            className="flex min-w-[64px] flex-col items-center rounded-lg border p-3"
            style={{
              borderColor: selectedDay?.date === day.date ? "#ff5a1f" : "#d7dad2",
              background: selectedDay?.date === day.date ? "#ffe6da" : "#fff",
            }}
          >
            <span className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "#5b6670" }}>
              {day.dayLabel}
            </span>
            <span className="mt-1 text-base font-semibold">{day.date.slice(-2)}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {(selectedDay?.slots ?? []).map((slot) => (
          <button
            key={slot.id}
            disabled={slot.status !== "open"}
            onClick={() => setSelectedSlot(slot)}
            className="rounded-md border px-2 py-2.5 text-sm"
            style={{
              cursor: slot.status !== "open" ? "not-allowed" : "pointer",
              borderColor: "#d7dad2",
              background: slot.status !== "open" ? "#e1e4dc" : selectedSlot?.id === slot.id ? "#ff5a1f" : "#fff",
              color: slot.status !== "open" ? "#9aa0a6" : selectedSlot?.id === slot.id ? "#fff" : "#171b1f",
            }}
          >
            {formatTime(slot.time)}
          </button>
        ))}
        {selectedDay && selectedDay.slots.length === 0 && (
          <p className="col-span-4 text-sm" style={{ color: "#5b6670" }}>
            No slots this day.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded px-3 py-2 text-sm" style={{ background: "#ffe6da", color: "#d94714" }}>
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.back()}
          className="rounded-[3px] border px-6 py-3 text-sm font-semibold"
          style={{ borderColor: "#d7dad2" }}
        >
          ← Back
        </button>
        <button
          disabled={!selectedSlot || isPending}
          onClick={handleConfirm}
          className="rounded-[3px] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "#ff5a1f" }}
        >
          {isPending ? "Rescheduling…" : "Confirm new time →"}
        </button>
      </div>
    </div>
  );
}