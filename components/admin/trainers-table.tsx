"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTrainer } from "@/lib/queries/admin";

export function TrainersTable({ trainers }: { trainers: AdminTrainer[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function toggleActive(id: number, isActive: boolean) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/trainers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update trainer");
      router.refresh();
    } catch (err) {
      alert("Couldn't update trainer status. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Name</th>
            <th className="px-5 py-2.5 font-medium">Specialties</th>
            <th className="px-5 py-2.5 font-medium">Rating</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-none">
              <td className="px-5 py-3 font-medium text-card-foreground">{t.full_name}</td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1">
                  {t.specialties.map((s) => (
                    <span key={s} className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase text-secondary-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-3 font-mono">{t.avg_rating.toFixed(1)}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                    t.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.is_active ? "active" : "inactive"}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  disabled={pendingId === t.id}
                  onClick={() => toggleActive(t.id, t.is_active)}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {pendingId === t.id ? "Updating…" : t.is_active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}