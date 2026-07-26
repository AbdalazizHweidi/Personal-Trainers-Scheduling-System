"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/trainers", label: "Trainers" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/clients", label: "Clients" },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col bg-foreground px-4 py-6 text-background">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-6 items-end gap-[3px]">
          <span className="h-3 w-1.5 bg-primary" />
          <span className="h-5 w-1.5 bg-background" />
          <span className="h-4 w-1.5 bg-primary" />
        </div>
        <span className="font-display text-xl tracking-wide">FITCONNECT</span>
      </div>

      <nav className="mt-9 flex flex-col gap-1">
        {LINKS.map(({ href, label }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-background/70 hover:bg-background/10 hover:text-background"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-background/10 pt-4">
        <span className="px-3 text-xs text-background/50">{userName}</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-background/70 hover:bg-background/10 hover:text-background"
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}