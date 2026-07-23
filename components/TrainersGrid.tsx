"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import type { TrainerCard } from "@/lib/trainers";

export default function TrainersGrid({ trainers }: { trainers: TrainerCard[] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = useMemo(() => {
    const unique = new Set<string>();
    trainers.forEach((t) => t.specialties.forEach((s) => unique.add(s)));
    return ["All", ...Array.from(unique).sort()];
  }, [trainers]);

  const filtered =
    activeFilter === "All"
      ? trainers
      : trainers.filter((t) =>
          t.specialties.some((s) => s.toLowerCase() === activeFilter.toLowerCase())
        );

  return (
    <>
      <div className="flex gap-2 mt-[22px] flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-[13px] font-medium px-4 py-2 rounded-full border transition-colors ${
              activeFilter === f
                ? "bg-ink text-white border-ink"
                : "bg-card text-ink-soft border-line hover:border-steel"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-5 px-10 pt-9 pb-[70px] max-md:grid-cols-2">
        {filtered.length === 0 && (
          <p className="col-span-4 text-steel text-sm">
            No trainers match this specialty yet.
          </p>
        )}
        {filtered.map((trainer) => (
          <div
            key={trainer.id}
            className="bg-card border border-line rounded-md p-[22px] flex flex-col gap-3 hover:-translate-y-[3px] hover:shadow-lg transition-transform"
          >
            <Avatar initials={trainer.initials} color={trainer.color} size="lg" />
            <div>
              <h4 className="font-body font-semibold text-base">{trainer.name}</h4>
              <span className="text-xs text-steel mt-0.5 block">{trainer.role}</span>
            </div>
            <p className="text-[13px] text-ink-soft leading-[1.5]">{trainer.bio}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Tag variant={trainer.tagVariant}>{trainer.tagLabel}</Tag>
              <Tag>{trainer.credential}</Tag>
            </div>
            <Button href={`/trainers/${trainer.id}`} variant="outline" small>
              View profile
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}