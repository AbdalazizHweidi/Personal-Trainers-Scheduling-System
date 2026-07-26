import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllTrainersAdmin } from "@/lib/queries/admin";
import { TrainersTable } from "@/components/admin/trainers-table";

export const dynamic = "force-dynamic";

export default async function AdminTrainersPage() {
  const supabase = createAdminClient();
  const trainers = await getAllTrainersAdmin(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Trainers</h1>
        <Link
          href="/admin/trainers/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Add trainer
        </Link>
      </div>
      <TrainersTable trainers={trainers} />
    </div>
  );
}