import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-[220px_1fr] md:px-10">
      {/* Sidebar */}
      <aside className="hidden md:block">
        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/bookings"
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            My bookings
          </Link>
          <Link
            href="/dashboard/payments"
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            Payments
          </Link>
          <Link
            href="/dashboard/profile"
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            Profile
          </Link>
          <form action="/auth/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Log out
            </button>
          </form>
        </nav>
      </aside>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}