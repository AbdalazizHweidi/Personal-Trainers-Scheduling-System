"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookCta } from "@/components/book-cta";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/trainers", label: "Trainers" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      setIsLoggedIn(!!user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 items-end gap-[3px]">
            <span className="h-3 w-1.5 bg-primary" />
            <span className="h-5 w-1.5 bg-foreground" />
            <span className="h-4 w-1.5 bg-primary" />
          </div>
          <span className="font-display text-xl tracking-wide text-foreground">FITCONNECT</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {isLoggedIn ? (
                <form action="/auth/signout" method="post" className="hidden sm:block">
                  <button
                    type="submit"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
                >
                  Log in
                </Link>
              )}

              <BookCta
                isLoggedIn={isLoggedIn}
                href="/trainers"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Book a session
              </BookCta>
            </>
          )}
        </div>
      </div>
    </header>
  );
}