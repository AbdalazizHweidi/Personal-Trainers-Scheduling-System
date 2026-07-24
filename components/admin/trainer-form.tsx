"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TrainerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const specialties = String(formData.get("specialties") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.get("full_name"),
          bio: formData.get("bio"),
          certifications: formData.get("certifications"),
          specialties,
        }),
      });
      if (!res.ok) throw new Error("Failed to create trainer");
      router.push("/admin/trainers");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Full name</label>
        <input name="full_name" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Specialties (comma-separated)</label>
        <input name="specialties" placeholder="Strength, Mobility" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Certifications</label>
        <input name="certifications" className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Bio</label>
        <textarea name="bio" rows={4} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create trainer"}
      </button>
    </form>
  );
}