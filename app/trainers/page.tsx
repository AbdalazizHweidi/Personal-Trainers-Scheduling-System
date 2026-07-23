import SiteHeader from "@/components/SiteHeader";
import Avatar from "@/components/Avatar";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import { trainers } from "@/data/trainers";

const filters = ["All", "Strength", "Mobility", "Performance", "Nutrition"];

export default function TrainersPage() {
  return (
    <>
      <SiteHeader current="trainers" />

      <div className="px-10 pt-11 pb-7 border-b border-line">
        <h1 className="text-[46px]">Our trainers</h1>
        <p className="text-steel text-sm mt-2 max-w-[520px]">
          Four coaches, four specialties. Every profile shows real weekly
          availability so you know exactly when you can train.
        </p>
        <div className="flex gap-2 mt-[22px] flex-wrap">
          {filters.map((f, i) => (
            <span
              key={f}
              className={`text-[13px] font-medium px-4 py-2 rounded-full border ${
                i === 0
                  ? "bg-ink text-white border-ink"
                  : "bg-card text-ink-soft border-line"
              }`}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 px-10 pt-9 pb-[70px] max-md:grid-cols-2">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="bg-card border border-line rounded-md p-[22px] flex flex-col gap-3 hover:-translate-y-[3px] hover:shadow-lg transition-transform"
          >
            <Avatar initials={trainer.initials} color={trainer.color} size="lg" />
            <div>
              <h4 className="font-body font-semibold text-base">{trainer.name}</h4>
              <span className="text-xs text-steel mt-0.5 block">{trainer.role}</span>
            </div>
            <p className="text-[13px] text-ink-soft leading-[1.5]">{trainer.bio}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Tag variant={trainer.tagVariant}>{trainer.tagLabel}</Tag>
              <Tag>{trainer.credential}</Tag>
            </div>
            <Button href={`/trainers/${trainer.id}`} variant="outline" small>
              View profile
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}