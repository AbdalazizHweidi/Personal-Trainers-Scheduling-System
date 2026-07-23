import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Avatar from "@/components/Avatar";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import { getTrainerById } from "@/lib/trainers";

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId } = await params;
  const id = Number(trainerId);
  if (Number.isNaN(id)) notFound();

  const trainer = await getTrainerById(id);
  if (!trainer) notFound();

  return (
    <>
      <SiteHeader current="trainers" />

      <div className="grid grid-cols-[160px_1fr_auto] gap-[30px] items-center px-10 py-11 border-b border-line max-md:grid-cols-1 max-md:text-center">
        <Avatar initials={trainer.initials} color={trainer.color} size="xl" />
        <div>
          <h1 className="text-[38px]">{trainer.name}</h1>
          <div className="text-flame-dark font-mono text-[13px] mt-1.5 uppercase">
            {trainer.role}
          </div>
          <p className="text-ink-soft text-sm mt-3 max-w-[560px]">{trainer.fullBio}</p>
          <div className="flex gap-2 mt-3.5 flex-wrap max-md:justify-center">
            <Tag variant={trainer.tagVariant}>{trainer.tagLabel}</Tag>
            <Tag>{trainer.credential}</Tag>
          </div>
        </div>
        <Button href="/booking" variant="primary">
          Book with {trainer.name.split(" ")[0]}
        </Button>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-10 px-10 py-10 max-md:grid-cols-1">
        <div>
          <h3 className="font-body text-base font-semibold">This week&apos;s availability</h3>
          <div className="grid grid-cols-7 gap-1.5 mt-3.5 max-md:grid-cols-4">
            {trainer.availability.map((day) => (
              <div key={day.day} className="text-center">
                <div className="font-mono text-[11px] text-steel mb-1.5">{day.day}</div>
                {day.closed ? (
                  <div className="bg-paper-dim rounded-[3px] text-[10px] py-1.5 px-0.5 text-ink-soft opacity-40">
                    Closed
                  </div>
                ) : (
                  day.slots.map((slot, i) => (
                    <div
                      key={slot.time + i}
                      className={`rounded-[3px] text-[10px] py-1.5 px-0.5 mb-1 ${
                        slot.free
                          ? "bg-moss-tint text-moss font-semibold"
                          : "bg-paper-dim text-ink-soft"
                      }`}
                    >
                      {slot.time}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>

          <h3 className="font-body text-base font-semibold mt-[34px]">Services offered</h3>
          <div className="mt-3.5">
            {trainer.services.map((svc, i) => (
              <div
                key={svc.name + i}
                className="bg-card border border-line rounded-md flex justify-between items-center py-[18px] px-5 mb-2.5 cursor-pointer hover:border-steel transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm">{svc.name}</div>
                  <div className="text-xs text-steel mt-0.5">{svc.sub}</div>
                </div>
                <div className="font-mono text-base">${svc.price}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-card border border-line rounded-md p-[22px] mb-4">
            <h4 className="font-body text-sm font-semibold">Certifications</h4>
            <ul className="mt-3.5 flex flex-col gap-2.5">
              {trainer.certifications.map((cert, i) => (
                <li key={i} className="text-[13px] flex gap-2 items-center text-ink-soft">
                  <span className="w-1.5 h-1.5 rounded-full bg-flame flex-shrink-0" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-line rounded-md p-[22px] mb-4">
            <h4 className="font-body text-sm font-semibold">Client rating</h4>
            <div className="font-display text-4xl mt-1.5">
              {trainer.rating.toFixed(1)}{" "}
              <span className="font-body text-[13px] text-steel font-normal">
                / 5 ({trainer.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}