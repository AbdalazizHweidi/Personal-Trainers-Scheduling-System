import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTrainerByIdAdmin, getServicesByTrainerAdmin } from "@/lib/queries/admin";
import { TrainerEditForm } from "@/components/admin/trainer-edit-form";
import { TrainerServices } from "@/components/admin/trainer-services";

export const dynamic = "force-dynamic";

export default async function EditTrainerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainerId = Number(id);
  if (Number.isNaN(trainerId)) notFound();

  const supabase = createAdminClient();
  const trainer = await getTrainerByIdAdmin(supabase, trainerId);
  if (!trainer) notFound();

  const services = await getServicesByTrainerAdmin(supabase, trainerId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between">
        <h1 className="font-display text-3xl text-foreground">Edit {trainer.full_name}</h1>
        <Link
          href="/admin/trainers"
          aria-label="Close and return to trainers"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
      </div>

      <div className="mt-6 max-w-lg">
        <TrainerEditForm trainer={trainer} />
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Services</h2>
        <TrainerServices trainerId={trainer.id} initialServices={services} />
      </div>
    </div>
  );
}