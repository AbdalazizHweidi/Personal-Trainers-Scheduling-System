"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTrainer } from "@/lib/queries/admin";

export function AvailabilityForm({ trainers }: { trainers: AdminTrainer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainer_id: Number(formData.get("trainer_id")),
          slot_date: formData.get("slot_date"),
          start_time: formData.get("start_time"),
          end_time: formData.get("end_time"),
        }),
      });
      if (!res.ok) throw new Error();
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch {
      setError("Couldn't add slot. Check the times don't overlap an existing one.");
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
        <input type="date" name="slot_date" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
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