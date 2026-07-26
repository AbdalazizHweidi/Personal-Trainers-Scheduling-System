import { AdminClient } from "@/lib/queries/admin";

export function ClientsTable({ clients }: { clients: AdminClient[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Name</th>
            <th className="px-5 py-2.5 font-medium">Email</th>
            <th className="px-5 py-2.5 font-medium">Joined</th>
            <th className="px-5 py-2.5 font-medium">Bookings</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr><td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">No clients yet.</td></tr>
          ) : (
            clients.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-none">
                <td className="px-5 py-3 font-medium text-card-foreground">{c.fullName}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-5 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-mono">{c.bookingCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}