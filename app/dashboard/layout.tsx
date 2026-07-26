import Link from "next/link";
import { requireDashboardAccess } from "@/lib/auth/access";
import { fontVars } from "@/lib/fonts";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardAccess();

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

        <nav className="mt-9 flex flex-col gap-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            My bookings
          </Link>
          <Link
            href="/dashboard/payments"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Payments
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 rounded px-3 py-2.5 text-[13px] font-medium text-[#c7ccd1] hover:bg-[#22262b] hover:text-white aria-[current=page]:bg-[#ff5a1f] aria-[current=page]:text-white"
          >
            Profile
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
        className="bg-[#eceee8] px-6 py-9 md:px-10 md:py-9"
        style={{ fontFamily: "var(--font-body)", color: "#171b1f" }}
      >
        {children}
      </main>
    </div>
  );
}