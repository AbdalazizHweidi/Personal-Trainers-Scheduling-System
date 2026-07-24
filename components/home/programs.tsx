type Program = { id: number; name: string; type: string; duration_minutes: number; price: number };

export function Programs({ programs }: { programs: Program[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
      <div className="mb-10 flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <h2 className="font-display text-4xl text-foreground">Programs & pricing</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Simple, transparent pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-sm"
          >
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {p.type}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-card-foreground">{p.name}</h3>
            <div className="mt-3 font-mono text-2xl text-primary">
              ${p.price}{" "}
              <small className="font-sans text-sm font-normal text-muted-foreground">
                / {p.duration_minutes} min
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}