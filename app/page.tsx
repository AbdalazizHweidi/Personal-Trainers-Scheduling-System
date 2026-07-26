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

export const metadata = {
  title: "FitConnect | Personal Training Studio",
  description:
    "One downtown studio, certified trainers, and a booking system that gets out of your way. Book 1-on-1, group, or online coaching sessions today.",
};
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [trainers, programs, board] = await Promise.all([
    getFeaturedTrainers(supabase),
    getFeaturedPrograms(supabase),
    getTodaysBoard(supabase),
  ]);

  return (
    <>
      <Navbar />
      <Hero isLoggedIn={!!user}>
        <TodayBoard initialRows={board} />
      </Hero>
      <Programs programs={programs} />
      <TrainerPreview trainers={trainers} />
      <Footer />
    </>
  );
}