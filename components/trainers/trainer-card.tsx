import Link from "next/link";

type Props = { id: number; full_name: string; specialties: string[] };

export function TrainerCard({ id, full_name, specialties }: Props) {
  const initials = full_name.split(" ").map((n) => n[0]).join("");

  return (
    <Link
      href={`/trainers/${id}`}
      className="flex w-56 shrink-0 flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
        {initials}
      </div>

      <div>
        <h4 className="font-semibold text-card-foreground">{full_name}</h4>
        <div className="mt-1 flex flex-wrap gap-1">
          {specialties.map((s) => (
            <span
              key={s}
              className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-secondary-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <span className="text-sm font-medium text-primary">View profile →</span>
    </Link>
  );
}