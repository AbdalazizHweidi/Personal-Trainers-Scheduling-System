"use client";

import { useCallback, useEffect, useState } from "react";

export type Slot = {
  id: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  status: "OPEN" | "BOOKED" | "BLOCKED";
};

export function useAvailability(trainerId: string, from: Date, to: Date) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        trainerId,
        from: from.toISOString(),
        to: to.toISOString(),
      });
      const res = await fetch(`/api/availability?${params}`);
      if (!res.ok) throw new Error("Failed to load availability.");
      const data = await res.json();
      setSlots(data.slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [trainerId, from, to]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOneOff = useCallback(
    async (startTime: Date, endTime: Date) => {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "one-off",
          trainerId,
          startTime,
          endTime,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Could not create slot.");
      }
      await refresh();
    },
    [trainerId, refresh]
  );

  const createRecurring = useCallback(
    async (params: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      effectiveFrom: Date;
      effectiveUntil?: Date | null;
    }) => {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "recurring", trainerId, ...params }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Could not create recurring availability.");
      }
      await refresh();
    },
    [trainerId, refresh]
  );

  return { slots, loading, error, refresh, createOneOff, createRecurring };
}