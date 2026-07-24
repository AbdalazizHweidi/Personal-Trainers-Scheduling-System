import { createClient } from "@/lib/supabase/server";
import { getFeaturedTrainers } from "@/lib/queries/trainers";
import { getFeaturedPrograms } from "@/lib/queries/services";
import { getTodaysBoard } from "@/lib/queries/schedule";
import { Hero } from "@/components/home/hero";
import { TodayBoard } from "@/components/home/today-board";
import { Programs } from "@/components/home/programs";
import { TrainerPreview } from "@/components/home/trainer-preview";
import { Navbar } from "./nav";
import { Footer } from "@/components/site-footer";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [trainers, programs, board] = await Promise.all([
    getFeaturedTrainers(supabase),
    getFeaturedPrograms(supabase),
    getTodaysBoard(supabase),
  ]);

  return (
    <>
      <Navbar />
      <Hero>
        <TodayBoard initialRows={board} />
      </Hero>
      <Programs programs={programs} />
      <TrainerPreview trainers={trainers} />
      <Footer />
    </>
  );
}