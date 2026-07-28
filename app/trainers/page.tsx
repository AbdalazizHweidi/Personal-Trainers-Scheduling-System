import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllTrainers } from "@/lib/queries/trainers";
import { TrainerListCard } from "@/components/trainers/trainer-list-card";
import { Footer } from "@/components/site-footer";
import { Navbar } from "../nav";

// TODO: derive this from actual data (distinct specialties across trainers)
// instead of a hardcoded list, once you have more than 4 trainers.
const SPECIALTIES = ["Strength", "Mobility", "Performance", "Nutrition"];

export const metadata = {
  title: "Our Trainers",
  description:
    "Meet FitConnect's certified personal trainers — strength, mobility, performance, and nutrition coaching.",
};

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string }>;
}) {
  const { specialty } = await searchParams;
  const supabase = await createClient();
  const trainers = await getAllTrainers(supabase, specialty);

  return (
    <>
      <Navbar />
      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10">
          <h1 className="font-display text-5xl text-foreground">Our Trainers</h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Find the right coach for your goals, check their availability, and book your session in seconds.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/trainers"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                !specialty
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </Link>
            {SPECIALTIES.map((s) => (
              <Link
                key={s}
                href={`/trainers?specialty=${encodeURIComponent(s)}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  specialty === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10">
        {trainers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No trainers match that specialty yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trainers.map((t) => (
              <TrainerListCard key={t.id} {...t} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
}