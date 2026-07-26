import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fontVars } from "@/lib/fonts";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className={`${fontVars} grid min-h-screen grid-cols-1 md:grid-cols-[230px_1fr]`}>
      <aside className="hidden bg-[#171b1f] px-[18px] py-[26px] text-[#c7ccd1] md:block">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[26px] items-end gap-[3px]">
            <span className="block w-1.5 bg-[#ff5a1f]" style={{ height: 12 }} />
            <span className="block w-1.5 bg-white" style={{ height: 22 }} />
            <span className="block w-1.5 bg-[#ff5a1f]" style={{ height: 16 }} />
          </div>
          <span
            className="text-[26px] tracking-[0.03em] text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FITCONNECT
          </span>
        </div>
        <div
          className="mt-1 text-[11px] uppercase tracking-[0.06em]"
          style={{ fontFamily: "var(--font-mono)", color: "#8b9198" }}
        >
          Admin panel
        </div>

        <nav className="mt-9 flex flex-col gap-0.5">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Overview
          </Link>
          <Link
            href="/admin/trainers"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Trainers
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Bookings
          </Link>
          <Link
            href="/admin/clients"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Clients
          </Link>
          <form action="/auth/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="w-full rounded px-3 py-2.5 text-left text-[13px] font-medium text-[#8b9198] hover:bg-[#22262b] hover:text-white"
            >
              Log out
            </button>
          </form>
        </nav>
      </aside>

      <main
        className="bg-[#eceee8] px-6 py-9 md:px-10"
        style={{ fontFamily: "var(--font-body)", color: "#171b1f" }}
      >
        {children}
      </main>
    </div>
  );
}