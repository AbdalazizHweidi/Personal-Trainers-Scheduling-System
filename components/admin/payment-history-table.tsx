import { PaymentHistoryRow } from "@/lib/queries/admin";

export function PaymentHistoryTable({ rows }: { rows: PaymentHistoryRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-card-foreground">Payment history</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Paid</th>
            <th className="px-5 py-2.5 font-medium">Client</th>
            <th className="px-5 py-2.5 font-medium">Trainer</th>
            <th className="px-5 py-2.5 font-medium">Method</th>
            <th className="px-5 py-2.5 font-medium">Amount</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">No payments recorded yet.</td></tr>
          ) : (
            rows.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-none">
                <td className="px-5 py-3">{p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"}</td>
                <td className="px-5 py-3">{p.clientName}</td>
                <td className="px-5 py-3">{p.trainerName}</td>
                <td className="px-5 py-3 capitalize">{p.method.replace(/_/g, " ")}</td>
                <td className="px-5 py-3 font-mono">${p.amount}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                    p.refunded ? "bg-destructive/15 text-destructive" : p.status === "success" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {p.refunded ? "refunded" : p.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}