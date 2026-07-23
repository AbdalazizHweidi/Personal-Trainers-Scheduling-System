import Link from "next/link";
import Avatar from "./Avatar";
import type { TrainerCard } from "@/lib/trainers";

const TrainerCard = ({ trainer }: { trainer: TrainerCard }) => {
  return (
    <div className="bg-card border border-line rounded-md p-5 flex flex-col gap-3 transition-all duration-150 hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(23,27,31,.08)]">
      <Avatar initials={trainer.initials} color={trainer.color} size="md" />
      <div>
        <h4 className="font-body font-semibold text-[15px]">{trainer.name}</h4>
        <span className="text-xs text-steel mt-0.5 block">{trainer.role}</span>
      </div>
      <Link
        href={`/trainers/${trainer.id}`}
        className="text-sm font-medium text-ink-soft hover:text-ink w-fit"
      >
        View profile →
      </Link>
    </div>
  );
};

export default TrainerCard;
