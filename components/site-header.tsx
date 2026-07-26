"use client"

import { useState } from "react"
import Link from "next/link"
import { Dumbbell, Menu, X, LogOut, LayoutDashboard, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader({
  isLoggedIn,
  name,
  role,
}: {
  isLoggedIn: boolean
  name: string | null
  role: "client" | "admin" | null
}) {
  const [open, setOpen] = useState(false)

  async function signOut() {
    window.location.assign("/auth/signout")
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trainers", label: "Trainers" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell size={20} />
          </span>
          <span className="font-display text-2xl leading-none tracking-wide">FitConnect</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {isLoggedIn && role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Shield size={16} /> Admin
            </Link>
          )}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <span className="max-w-[140px] truncate text-sm font-medium text-muted-foreground">{name}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut size={16} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {isLoggedIn && role === "admin" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                Admin
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                Dashboard
              </Link>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut size={16} /> Sign out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
