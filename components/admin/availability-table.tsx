"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils";
import { AdminSlot } from "@/lib/queries/admin";

export function AvailabilityTable({ slots }: { slots: AdminSlot[] }) {
  const router = useRouter();

  const [pendingId, setPendingId] = useState<number | null>(null);

  const [trainerFilter, setTrainerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function updateStatus(id: number, status: "open" | "blocked") {
    setPendingId(id);

    try {
      const res = await fetch(`/api/admin/availability/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      router.refresh();
    } catch {
      alert("Couldn't update slot.");
    } finally {
      setPendingId(null);
    }
  }

  async function removeSlot(id: number) {
    if (!confirm("Delete this slot?")) return;

    setPendingId(id);

    try {
      const res = await fetch(`/api/admin/availability/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      router.refresh();
    } catch {
      alert("Couldn't delete slot.");
    } finally {
      setPendingId(null);
    }
  }


  const trainers = Array.from(
    new Set(slots.map((slot) => slot.trainerName))
  );


  const filteredSlots = slots.filter((slot) => {
    const matchesTrainer =
      !trainerFilter ||
      slot.trainerName === trainerFilter;

    const matchesDate =
      !dateFilter ||
      slot.date === dateFilter;

    const matchesStatus =
      !statusFilter ||
      slot.status === statusFilter;

    return (
      matchesTrainer &&
      matchesDate &&
      matchesStatus
    );
  });


  function clearFilters() {
    setTrainerFilter("");
    setDateFilter("");
    setStatusFilter("");
  }


  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

          <div>
            <label className="mb-1 block text-xs font-semibold">
              Trainer
            </label>

            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              <option value="">
                All trainers
              </option>

              {trainers.map((trainer) => (
                <option key={trainer} value={trainer}>
                  {trainer}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="mb-1 block text-xs font-semibold">
              Date
            </label>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </div>


          <div>
            <label className="mb-1 block text-xs font-semibold">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              <option value="">
                All statuses
              </option>
              <option value="open">
                Open
              </option>
              <option value="booked">
                Booked
              </option>
              <option value="blocked">
                Blocked
              </option>
            </select>
          </div>


          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              Clear filters
            </button>
          </div>

        </div>
      </div>


      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">

              <th className="px-5 py-2.5 font-medium">
                Trainer
              </th>

              <th className="px-5 py-2.5 font-medium">
                Date
              </th>

              <th className="px-5 py-2.5 font-medium">
                Time
              </th>

              <th className="px-5 py-2.5 font-medium">
                Status
              </th>

              <th className="px-5 py-2.5 font-medium">
              </th>

            </tr>
          </thead>


          <tbody>

            {filteredSlots.length === 0 ? (

              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-6 text-center text-muted-foreground"
                >
                  No matching slots.
                </td>
              </tr>

            ) : (

              filteredSlots.map((s) => (

                <tr
                  key={s.id}
                  className="border-b border-border last:border-none"
                >

                  <td className="px-5 py-3">
                    {s.trainerName}
                  </td>


                  <td className="px-5 py-3">
                    {s.date}
                  </td>


                  <td className="px-5 py-3">
                    {formatTime(s.time)}
                  </td>


                  <td className="px-5 py-3">

                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                        s.status === "open"
                          ? "bg-success/15 text-success"
                          : s.status === "booked"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.status}
                    </span>

                  </td>


                  <td className="px-5 py-3 text-right">

                    {s.status !== "booked" && (

                      <div className="flex justify-end gap-3">

                        <button
                          disabled={pendingId === s.id}
                          onClick={() =>
                            updateStatus(
                              s.id,
                              s.status === "open"
                                ? "blocked"
                                : "open"
                            )
                          }
                          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                          {s.status === "open"
                            ? "Block"
                            : "Reopen"}
                        </button>


                        <button
                          disabled={pendingId === s.id}
                          onClick={() => removeSlot(s.id)}
                          className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      <p className="text-xs text-muted-foreground">
        Showing {filteredSlots.length} of {slots.length} slots
      </p>

    </div>
  );
}