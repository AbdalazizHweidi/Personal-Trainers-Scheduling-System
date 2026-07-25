"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TrainerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        body: formData, // no Content-Type header — browser sets the multipart boundary
      });
      if (!res.ok) throw new Error();
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
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Photo</label>
        <div className="flex items-center gap-4">
          {preview ? (
            <img src={preview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">
              No photo
            </div>
          )}
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-secondary-foreground"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Full name</label>
        <input name="full_name" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Specialties (comma-separated)</label>
        <input name="specialties" placeholder="Strength, Mobility" required className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Starting rating</label>
        <input
          type="number"
          name="avg_rating"
          min="0"
          max="5"
          step="0.1"
          defaultValue="5.0"
          className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Shown until real reviews come in. Defaults to 5.0.
        </p>
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