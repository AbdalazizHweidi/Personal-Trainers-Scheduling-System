import { requireAdminAccess } from "@/lib/auth/access";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdminAccess();

  return (
    <div className="grid min-h-screen w-full grid-cols-[230px_1fr]">
      <AdminSidebar userName={profile.full_name ?? "Admin"} />
      <main className="w-full bg-background px-10 py-9">{children}</main>
    </div>
  );
}