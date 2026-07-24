import { TrainerForm } from "@/components/admin/trainer-form";

export default function NewTrainerPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-foreground">Add trainer</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Trainers don't have their own login — this is the only way they get added.
      </p>
      <TrainerForm />
    </div>
  );
}