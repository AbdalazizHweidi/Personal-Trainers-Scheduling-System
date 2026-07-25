import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // This check is real, even though getCurrentUser() is mocked right now —
  // once real auth lands, this line needs zero changes.
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-[230px_1fr]">
      <AdminSidebar userName={user.full_name} />
      <main className="w-full bg-background px-10 py-9">{children}</main>
    </div>
  );
}