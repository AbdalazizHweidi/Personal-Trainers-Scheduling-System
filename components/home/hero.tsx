import Link from "next/link";
import { BookCta } from "@/components/book-cta";

export function Hero({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-24">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-primary">
          Downtown studio · est. 2016
        </span>

        <h1 className="font-display mt-3 text-6xl leading-[0.95] text-foreground sm:text-7xl">
          Train with
          <br />
          <em className="not-italic text-primary">intent.</em>
        </h1>

        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          One studio, certified trainers, and a booking system that gets out of your way.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <BookCta
            isLoggedIn={isLoggedIn}
            href="/trainers"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book a session
          </BookCta>
          <Link
            href="/trainers"
            className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Meet the trainers
          </Link>
        </div>
      </div>

      <div>{children}</div>
    </section>
  );
}