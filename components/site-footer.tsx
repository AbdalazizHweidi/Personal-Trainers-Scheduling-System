import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-foreground text-background">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4 md:px-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 items-end gap-[3px]">
              <span className="h-3 w-1.5 bg-primary" />
              <span className="h-5 w-1.5 bg-background" />
              <span className="h-4 w-1.5 bg-primary" />
            </div>
            <span className="font-display text-xl tracking-wide">FITCONNECT</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-background/60">
            142 Iron Row, Downtown
            <br />
            Mon–Fri 6a–9p · Sat–Sun 8a–4p
          </p>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wide text-background/50">Studio</h4>
          <nav className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/about" className="text-background/80 transition-colors hover:text-background">
              About
            </Link>
            <Link href="/trainers" className="text-background/80 transition-colors hover:text-background">
              Trainers
            </Link>
            <Link href="/pricing" className="text-background/80 transition-colors hover:text-background">
              Pricing
            </Link>
            <Link href="/contact" className="text-background/80 transition-colors hover:text-background">
              Contact
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wide text-background/50">Account</h4>
          <nav className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/login" className="text-background/80 transition-colors hover:text-background">
              Log in
            </Link>
            <Link href="/signup" className="text-background/80 transition-colors hover:text-background">
              Sign up
            </Link>
            <Link href="/dashboard/bookings" className="text-background/80 transition-colors hover:text-background">
              My bookings
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wide text-background/50">Contact</h4>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="tel:+10000000000" className="text-background/80 transition-colors hover:text-background">
              (961) 76322455
            </Link>
            <Link
              href="mailto:hello@fitconnect.studio"
              className="text-background/80 transition-colors hover:text-background"
            >
              hello@fitconnect.studio
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-background/50 sm:flex-row md:px-10">
          <span>© {new Date().getFullYear()} FitConnect. All rights reserved.</span>
          <span>Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}