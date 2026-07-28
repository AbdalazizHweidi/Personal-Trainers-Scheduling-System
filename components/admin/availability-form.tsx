"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTrainer } from "@/lib/queries/admin";

export function AvailabilityForm({ trainers }: { trainers: AdminTrainer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const weekday =
    date
        ? new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
          })
        : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const start = formData.get("start_time") as string;
    const end = formData.get("end_time") as string;

    if (start >= end) {
      setLoading(false);
      setError("End time must be later than the start time.");
      return;
    }
    const selected = formData.get("slot_date") as string;

    if (selected < today) {
        setError("Cannot create availability in the past.");
        setLoading(false);
        return;
    }
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainer_id: Number(formData.get("trainer_id")),
          slot_date: formData.get("slot_date"),
          start_time: formData.get("start_time"),
          end_time: formData.get("end_time"),
          is_recurring: isRecurring,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      (e.target as HTMLFormElement).reset();
      setDate("");
      setIsRecurring(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add slot.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Trainer</label>
        <select name="trainer_id" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground">
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>{t.full_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Date</label>
        <input type="date" name="slot_date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
        {weekday && (
            <p className="mt-1 text-xs text-muted-foreground">
                {weekday}
            </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Start</label>
          <input type="time" name="start_time" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">End</label>
          <input type="time" name="end_time" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
          <input
          type="checkbox"
          name="is_recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          />
          Repeat weekly
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add slot"}
      </button>
    </form>
  );
}