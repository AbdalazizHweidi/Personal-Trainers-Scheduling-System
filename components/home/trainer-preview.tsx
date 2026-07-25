"use client";

import { useRef } from "react";
import { TrainerCard } from "@/components/trainers/trainer-card";
import { FeaturedTrainer } from "@/lib/queries/trainers";

export function TrainerPreview({ trainers }: { trainers: FeaturedTrainer[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-4xl text-foreground">Meet the trainers</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2">
        {trainers.map((t) => (
          <TrainerCard key={t.id} id={t.id} full_name={t.full_name} specialties={t.specialties} photo_url={t.photo_url} />
        ))}
      </div>
    </section>
  );
}