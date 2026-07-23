import Tag from "./Tag";

type Variant = "default" | "flame" | "moss" | "chalk";

const ProgramCard = ({
  tagLabel,
  tagVariant = "default",
  title,
  price,
  unit,
  features,
}: {
  tagLabel: string;
  tagVariant?: Variant;
  title: string;
  price: string;
  unit: string;
  features: string[];
}) => {
  return (
    <div className="bg-card border border-line rounded-md p-[26px]">
      <Tag variant={tagVariant}>{tagLabel}</Tag>
      <h3 className="font-body text-[17px] font-semibold mt-3.5">{title}</h3>
      <div className="font-mono text-[26px] mt-3.5 mb-1.5 text-ink">
        {price} <small className="text-xs text-steel font-normal">/ {unit}</small>
      </div>
      <ul className="list-none mt-3.5 p-0 flex flex-col gap-2">
        {features.map((f, i) => (
          <li
            key={i}
            className="text-[13px] text-ink-soft flex gap-2 items-start before:content-['—'] before:text-flame before:shrink-0"
          >
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramCard;
