import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTrainerById } from "@/lib/queries/trainers";
import { getServicesByTrainer } from "@/lib/queries/services";
import { getWeekAvailability } from "@/lib/queries/availability";
import { Navbar } from "@/app/nav";
import { Footer } from "@/components/site-footer";
import { BookingFlow } from "@/components/booking-flow";

function parseTrainerId(id: string): number | null {
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId: rawId } = await params;
  const trainerId = parseTrainerId(rawId);
  if (trainerId === null) notFound();

  const supabase = await createClient();
  const trainer = await getTrainerById(supabase, trainerId);
  if (!trainer) notFound();

  const [services, availability] = await Promise.all([
    getServicesByTrainer(supabase, trainerId),
    getWeekAvailability(supabase, trainerId),
  ]);

  return (
    <>
      <Navbar />
      <BookingFlow trainer={trainer} services={services} availability={availability} />
      <Footer />
    </>
  );
}