import Link from "next/link";

type Props = {
  id: number;
  full_name: string;
  specialties: string[];
  bio: string | null;
  certifications: string | null;
};

export function TrainerListCard({ id, full_name, specialties, bio, certifications }: Props) {
  const initials = full_name.split(" ").map((n) => n[0]).join("");

  return (
    <Link
      href={`/trainers/${id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">
        {initials}
      </div>

      <div>
        <h4 className="font-semibold text-card-foreground">{full_name}</h4>
        {bio && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-1">
        {specialties.map((s) => (
          <span
            key={s}
            className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-secondary-foreground"
          >
            {s}
          </span>
        ))}
        {certifications && (
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {certifications}
          </span>
        )}
      </div>

      <span className="text-sm font-medium text-primary">View profile →</span>
    </Link>
  );
}