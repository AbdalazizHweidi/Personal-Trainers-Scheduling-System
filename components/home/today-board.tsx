"use client";

import { useEffect, useState } from "react";
import { ScheduleRow } from "@/lib/queries/schedule";

export function TodayBoard({ initialRows }: { initialRows: ScheduleRow[] }) {
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/schedule/today");
        if (!res.ok) return;
        const { board } = await res.json();
        setRows(board);
      } catch {
        // keep showing the last known board rather than clearing it
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg bg-foreground p-5 text-background">
      <div className="mb-3 border-b border-background/15 pb-3">
        <b className="font-display text-lg tracking-wide">Today&apos;s board</b>
      </div>

      <div className="flex flex-col">
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[60px_1fr_auto] items-center gap-3 border-b border-background/10 py-3 last:border-none"
          >
            <span className="font-mono text-sm text-background/70">{r.time}</span>

            <div>
              <span className="block text-sm font-medium">{r.trainerName}</span>
              {r.serviceName && (
                <span className="block text-xs text-background/60">{r.serviceName}</span>
              )}
            </div>

            <span
              className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                r.status === "open"
                  ? "bg-success/20 text-success"
                  : "bg-background/10 text-background/60"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}