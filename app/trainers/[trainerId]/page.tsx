import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTrainerById } from "@/lib/queries/trainers";
import { getServicesByTrainer } from "@/lib/queries/services";
import { getWeekAvailability } from "@/lib/queries/availability";
import { formatTime } from "@/lib/utils";
import { Navbar } from "@/app/nav";
import { Footer } from "@/components/site-footer";
import { BookCta } from "@/components/book-cta";

function parseTrainerId(id: string): number | null {
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

export async function generateMetadata({ params }: { params: Promise<{ trainerId: string }> }) {
  const { trainerId: rawId } = await params;
  const trainerId = parseTrainerId(rawId);
  if (trainerId === null) return { title: "Trainer not found | FitConnect" };

  const supabase = await createClient();
  const trainer = await getTrainerById(supabase, trainerId);

  if (!trainer) return { title: "Trainer not found | FitConnect" };
  return {
    title: trainer.full_name,
    description: trainer.bio ?? `Book a session with ${trainer.full_name} at FitConnect.`,
  };
}

export default async function TrainerProfilePage({ params }: { params: Promise<{ trainerId: string }> }) {
  const { trainerId: rawId } = await params;
  const trainerId = parseTrainerId(rawId);
  if (trainerId === null) notFound();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const trainer = await getTrainerById(supabase, trainerId);
  if (!trainer) notFound();

  const [services, availability] = await Promise.all([
    getServicesByTrainer(supabase, trainerId),
    getWeekAvailability(supabase, trainerId),
  ]);

  const initials = trainer.full_name.split(" ").map((n) => n[0]).join("");

  return (
    <>
      <Navbar />
      {/* Profile hero */}
      <div className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-12 md:flex-row md:items-center md:px-10">
          {trainer.photo_url ? (
            <img
              src={trainer.photo_url}
              alt={trainer.full_name}
              className="h-28 w-28 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-primary font-display text-4xl text-primary-foreground">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-display text-4xl text-foreground">{trainer.full_name}</h1>
            {trainer.bio && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {trainer.bio}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {trainer.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-secondary-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <BookCta
            isLoggedIn={!!user}
            href={`/booking/${trainer.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book with {trainer.full_name.split(" ")[0]}
          </BookCta>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[2fr_1fr] md:px-10">
        {/* Left column */}
        <div>
          <h2 className="font-semibold text-foreground">This week&apos;s availability</h2>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {availability.map((day) => (
              <div key={day.date} className="text-center">
                <div className="font-mono text-[11px] text-muted-foreground">{day.dayLabel}</div>
                <div className="mt-2 flex flex-col gap-1">
                  {day.slots.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground/50">—</span>
                  ) : (
                    day.slots.map((slot) => (
                      <span
                        key={slot.id}
                        className={`rounded px-1 py-1 font-mono text-[10px] ${
                          slot.status === "open"
                            ? "bg-success/15 font-semibold text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {formatTime(slot.time)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-10 font-semibold text-foreground">Services offered</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services listed yet.</p>
            ) : (
              services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div>
                    <div className="font-medium text-card-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.duration_minutes} minutes</div>
                  </div>
                  <div className="font-mono text-lg text-foreground">${s.price}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {trainer.certifications && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-card-foreground">Certifications</h3>
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {trainer.certifications}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground">Client rating</h3>
            <div className="mt-2 font-display text-4xl text-foreground">
              {trainer.avg_rating.toFixed(1)}
              <span className="font-sans text-sm font-normal text-muted-foreground"> / 5</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}