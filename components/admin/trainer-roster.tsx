import { RosterItem } from "@/lib/queries/admin";

export function TrainerRoster({ items }: { items: RosterItem[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h4 className="text-sm font-semibold text-card-foreground">Trainer roster</h4>
      <div className="mt-3 flex flex-col">
        {items.map((t) => {
          const initials = t.fullName.split(" ").map((n) => n[0]).join("");
          return (
            <div key={t.id} className="flex items-center gap-3 border-b border-border py-3 last:border-none">
              {t.photoUrl ? (
                <img src={t.photoUrl} alt={t.fullName} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                  {initials}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-card-foreground">{t.fullName}</div>
                <div className="text-xs text-muted-foreground">{t.sessionsToday} sessions today</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}