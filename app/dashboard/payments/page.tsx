import { createClient } from "@/lib/supabase/server";
import { getPaymentsForClient } from "@/lib/queries/client-data";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const payments = await getPaymentsForClient(supabase, user.id);

  return (
    <>
      <h1 className="text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        Payments
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: "#5b6670" }}>
        Your payment history for every session.
      </p>

      <div className="mt-7 overflow-hidden rounded-md" style={{ background: "#fff", border: "1px solid #d7dad2" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Trainer", "Date paid", "Card", "Amount", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-[14px] py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em]"
                  style={{ borderBottom: "1px solid #d7dad2", color: "#5b6670" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-[14px] py-6 text-center text-sm" style={{ color: "#5b6670" }}>
                  No payments yet.
                </td>
              </tr>
            )}
            {payments.map((p, i) => {
              const border = i === payments.length - 1 ? "none" : "1px solid #d7dad2";
              return (
                <tr key={p.id}>
                  <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
                    {p.trainerName}
                  </td>
                  <td className="px-[14px] py-[13px] text-[13px]" style={{ borderBottom: border }}>
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td
                    className="px-[14px] py-[13px] text-[13px]"
                    style={{ borderBottom: border, fontFamily: "var(--font-mono)" }}
                  >
                    •••• {p.cardLast4}
                  </td>
                  <td
                    className="px-[14px] py-[13px] text-[13px]"
                    style={{ borderBottom: border, fontFamily: "var(--font-mono)" }}
                  >
                    ${p.amount}
                  </td>
                <td className="px-[14px] py-[13px]" style={{ borderBottom: border }}>
  {p.refunded ? (
    <span
      className="inline-block rounded-full px-[9px] py-1 text-[10px] uppercase tracking-[0.04em]"
      style={{ fontFamily: "var(--font-mono)", background: "#faedd0", color: "#c98f16" }}
    >
      Refunded
    </span>
  ) : (
    <span
      className="inline-block rounded-full px-[9px] py-1 text-[10px] uppercase tracking-[0.04em]"
      style={{
        fontFamily: "var(--font-mono)",
        background: p.status === "success" ? "#e2ede2" : "#ffe6da",
        color: p.status === "success" ? "#3f6b48" : "#d94714",
      }}
    >
      {p.status}
    </span>
  )}
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}