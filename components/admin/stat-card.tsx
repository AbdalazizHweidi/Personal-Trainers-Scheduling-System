type Props = { label: string; value: string; delta?: string };

export function StatCard({ label, value, delta }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-display text-3xl text-card-foreground">{value}</div>
      {delta && <div className="mt-1 text-xs text-success">{delta}</div>}
    </div>
  );
}