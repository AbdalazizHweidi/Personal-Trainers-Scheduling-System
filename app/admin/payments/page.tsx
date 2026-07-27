import { createAdminClient } from "@/lib/supabase/admin";
import { getBookingsAwaitingPayment, getPaymentHistory } from "@/lib/queries/admin";
import { PaymentsAwaiting } from "@/components/admin/payments-awaiting";
import { PaymentHistoryTable } from "@/components/admin/payment-history-table";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient();
  const [awaiting, history] = await Promise.all([getBookingsAwaitingPayment(supabase), getPaymentHistory(supabase)]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{awaiting.length} bookings awaiting payment</p>
      </div>
      <PaymentsAwaiting rows={awaiting} />
      <PaymentHistoryTable rows={history} />
    </div>
  );
}