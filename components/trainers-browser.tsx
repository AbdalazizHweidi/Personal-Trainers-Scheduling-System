"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { Trainer } from "@/lib/types"
import { TrainerCard } from "@/components/trainer-card"
import { cn } from "@/lib/utils"

export function TrainersBrowser({
  trainers,
  categories,
  priceByTrainer,
}: {
  trainers: Trainer[]
  categories: string[]
  priceByTrainer: Record<number, number>
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")
  const [sort, setSort] = useState<"rating" | "price">("rating")

  const filtered = useMemo(() => {
    let list = trainers.filter((t) => {
      const matchesCategory = category === "All" || t.category === category
      const q = query.trim().toLowerCase()
      const matchesQuery =
        q === "" ||
        t.full_name.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })

    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.avg_rating - a.avg_rating
      return (priceByTrainer[a.id] ?? 9999) - (priceByTrainer[b.id] ?? 9999)
    })
    return list
  }, [trainers, category, query, sort, priceByTrainer])

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as "rating" | "price")}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-primary"
          >
            <option value="rating">Top rated</option>
            <option value="price">Lowest price</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 font-mono text-sm text-muted-foreground">
        {filtered.length} trainer{filtered.length === 1 ? "" : "s"} available
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TrainerCard 
              key={t.id} 
              id={t.id} 
              full_name={t.full_name} 
              specialties={t.specialties} 
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-display text-2xl tracking-wide text-muted-foreground">No trainers found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
