"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminService } from "@/lib/queries/admin";

const TYPES = ["1-on-1", "group", "online"];

export function TrainerServices({ trainerId, initialServices }: { trainerId: number; initialServices: AdminService[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveEdit(id: number, form: HTMLFormElement) {
    setPendingId(id);
    setError(null);
    const fd = new FormData(form);
    try {
        const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: fd.get("name"),
            type: fd.get("type"),
            duration_minutes: Number(fd.get("duration_minutes")),
            price: Number(fd.get("price")),
        }),
        });
        if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        setEditingId(null);
        router.refresh();
    } catch (err) {
        console.error("Service save failed:", err);
        setError(err instanceof Error ? err.message : "Couldn't save that service.");
    } finally {
        setPendingId(null);
    }
    }

  async function toggleActive(id: number, isActive: boolean) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Couldn't update service.");
    } finally {
      setPendingId(null);
    }
  }

  async function removeService(id: number) {
    if (!confirm("Delete this service?")) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Couldn't delete service.");
    } finally {
      setPendingId(null);
    }
  }

  async function addService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainer_id: trainerId,
          name: fd.get("name"),
          type: fd.get("type"),
          duration_minutes: Number(fd.get("duration_minutes")),
          price: Number(fd.get("price")),
        }),
      });
      if (!res.ok) throw new Error();
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch {
      setError("Couldn't add that service.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Duration</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {initialServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-5 text-center text-muted-foreground">
                  No services yet.
                </td>
              </tr>
            ) : (
              initialServices.map((s) =>
                editingId === s.id ? (
                  <tr key={s.id} className="border-b border-border last:border-none bg-secondary/40">
                    <td colSpan={6} className="px-4 py-3">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveEdit(s.id, e.currentTarget);
                        }}
                        className="flex flex-wrap items-end gap-2"
                      >
                        <input name="name" defaultValue={s.name} required className="rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
                        <select name="type" defaultValue={s.type} className="rounded-md border border-input bg-card px-2.5 py-1.5 text-sm">
                          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" name="duration_minutes" defaultValue={s.duration_minutes} min="1" className="w-24 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
                        <input type="number" name="price" defaultValue={s.price} min="0" step="0.01" className="w-24 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
                        <button type="submit" disabled={pendingId === s.id} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-xs font-semibold text-muted-foreground">
                          Cancel
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={s.id} className="border-b border-border last:border-none">
                    <td className="px-4 py-3 font-medium text-card-foreground">{s.name}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{s.type}</td>
                    <td className="px-4 py-3">{s.duration_minutes} min</td>
                    <td className="px-4 py-3 font-mono">${s.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                          s.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingId(s.id)} className="text-xs font-semibold text-primary hover:underline">
                          Edit
                        </button>
                        <button
                          disabled={pendingId === s.id}
                          onClick={() => toggleActive(s.id, s.is_active)}
                          className="text-xs font-semibold text-foreground hover:underline disabled:opacity-50"
                        >
                          {s.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          disabled={pendingId === s.id}
                          onClick={() => removeService(s.id)}
                          className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={addService} className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground">Name</label>
          <input name="name" placeholder="1-on-1 session" required className="rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground">Type</label>
          <select name="type" defaultValue="1-on-1" className="rounded-md border border-input bg-card px-2.5 py-1.5 text-sm">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground">Duration (min)</label>
          <input type="number" name="duration_minutes" defaultValue={60} min="1" required className="w-28 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground">Price ($)</label>
          <input type="number" name="price" step="0.01" min="0" placeholder="40.00" required className="w-28 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
        </div>
        <button type="submit" disabled={adding} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {adding ? "Adding…" : "+ Add service"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}