import SiteHeader from "@/components/SiteHeader";
import TrainersGrid from "@/components/TrainersGrid";
import { getTrainers } from "@/lib/trainers";

export default async function TrainersPage() {
  const trainers = await getTrainers();

  return (
    <>
      <SiteHeader current="trainers" />

      <div className="px-10 pt-11 pb-7 border-b border-line">
        <h1 className="text-[46px]">Our trainers</h1>
        <p className="text-steel text-sm mt-2 max-w-[520px]">
          Four coaches, four specialties. Every profile shows real weekly
          availability so you know exactly when you can train.
        </p>
      </div>

      <TrainersGrid trainers={trainers} />
    </>
  );
}