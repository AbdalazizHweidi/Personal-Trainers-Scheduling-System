"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils";
import { AwaitingPaymentRow } from "@/lib/queries/admin";

export function PaymentsAwaiting({ rows }: { rows: AwaitingPaymentRow[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openForm(row: AwaitingPaymentRow) {
    setActiveId(row.id);
    setAmount(String(row.amount));
    setMethod("Cash");
    setError(null);
  }

  const METHOD_VALUES: Record<string, string> = {
    "Cash": "cash",
    "Card (in person)": "card_in_person",
    "Bank transfer": "bank_transfer",
  };


  async function submitPayment(bookingId: number) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: Number(amount),
          method: METHOD_VALUES[method] ?? "cash",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setActiveId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't record payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-card-foreground">Awaiting payment</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Date</th>
            <th className="px-5 py-2.5 font-medium">Client</th>
            <th className="px-5 py-2.5 font-medium">Trainer</th>
            <th className="px-5 py-2.5 font-medium">Service</th>
            <th className="px-5 py-2.5 font-medium">Amount</th>
            <th className="px-5 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">Nothing awaiting payment.</td></tr>
          ) : (
            rows.map((r) =>
              activeId === r.id ? (
                <tr key={r.id} className="border-b border-border last:border-none bg-secondary/40">
                  <td colSpan={6} className="px-5 py-3">
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-foreground">Amount</label>
                        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-foreground">Method</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-md border border-input bg-card px-2.5 py-1.5 text-sm">
                          <option value="Cash">Cash</option>
                          <option value="Card (in person)">Card (in person)</option>
                          <option value="Bank transfer">Bank transfer</option>
                        </select>
                      </div>
                      <button disabled={submitting} onClick={() => submitPayment(r.id)} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                        {submitting ? "Saving…" : "Record payment"}
                      </button>
                      <button onClick={() => setActiveId(null)} className="text-xs font-semibold text-muted-foreground">Cancel</button>
                    </div>
                    {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                  </td>
                </tr>
              ) : (
                <tr key={r.id} className="border-b border-border last:border-none">
                  <td className="px-5 py-3">{r.date} · {formatTime(r.time)}</td>
                  <td className="px-5 py-3">{r.clientName}</td>
                  <td className="px-5 py-3">{r.trainerName}</td>
                  <td className="px-5 py-3">{r.serviceName}</td>
                  <td className="px-5 py-3 font-mono">${r.amount}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openForm(r)} className="text-xs font-semibold text-primary hover:underline">Record payment</button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}