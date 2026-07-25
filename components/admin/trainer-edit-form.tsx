"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpecialtiesEditor } from "@/components/admin/specialties-editor";

type Trainer = {
  id: number;
  full_name: string;
  specialties: string[];
  bio: string | null;
  certifications: string | null;
  photo_url: string | null;
  avg_rating: number;
};

export function TrainerEditForm({ trainer }: { trainer: Trainer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(trainer.photo_url);
  const [specialties, setSpecialties] = useState<string[]>(trainer.specialties);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : trainer.photo_url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("specialties", specialties.join(","));

    try {
      const res = await fetch(`/api/admin/trainers/${trainer.id}`, {
        method: "PATCH",
        body: formData,
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
        <p className="mt-1 text-xs text-muted-foreground">Leave empty to keep the current photo.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Full name</label>
        <input
          name="full_name"
          defaultValue={trainer.full_name}
          required
          className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Specialties</label>
        <SpecialtiesEditor initial={trainer.specialties} onChange={setSpecialties} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Rating</label>
        <input
          type="number"
          name="avg_rating"
          min="0"
          max="5"
          step="0.1"
          defaultValue={trainer.avg_rating}
          className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Certifications</label>
        <input
          name="certifications"
          defaultValue={trainer.certifications ?? ""}
          className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Bio</label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={trainer.bio ?? ""}
          className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}