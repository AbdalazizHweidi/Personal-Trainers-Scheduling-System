import { createAdminClient } from "@/lib/supabase/admin";
import { getAllClients } from "@/lib/queries/admin";
import { ClientsTable } from "@/components/admin/clients-table";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = createAdminClient();
  const clients = await getAllClients(supabase);

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Clients</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{clients.length} registered clients</p>
      <ClientsTable clients={clients} />
    </div>
  );
}