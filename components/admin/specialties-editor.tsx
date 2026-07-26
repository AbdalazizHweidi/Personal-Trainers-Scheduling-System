"use client";

import { useState } from "react";

type Props = {
  initial: string[];
  onChange: (specialties: string[]) => void;
};

export function SpecialtiesEditor({ initial, onChange }: Props) {
  const [specialties, setSpecialties] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  function commit(next: string[]) {
    setSpecialties(next);
    onChange(next);
  }

  function addSpecialty() {
    const value = draft.trim();
    if (!value || specialties.includes(value)) {
      setDraft("");
      return;
    }
    commit([...specialties, value]);
    setDraft("");
  }

  function removeSpecialty(value: string) {
    commit(specialties.filter((s) => s !== value));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {specialties.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 rounded bg-secondary px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-secondary-foreground"
          >
            {s}
            <button
              type="button"
              onClick={() => removeSpecialty(s)}
              className="text-secondary-foreground/60 hover:text-destructive"
              aria-label={`Remove ${s}`}
            >
              ×
            </button>
          </span>
        ))}
        {specialties.length === 0 && (
          <span className="text-xs text-muted-foreground">No specialties yet.</span>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSpecialty();
            }
          }}
          placeholder="e.g. Strength"
          className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={addSpecialty}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Add
        </button>
      </div>
    </div>
  );
}