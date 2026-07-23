const StatCard = ({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) => {
  return (
    <div className="bg-card border border-line rounded-md p-[18px]">
      <div className="text-[11px] uppercase tracking-[.06em] text-steel font-mono">
        {label}
      </div>
      <div className="font-display text-[30px] mt-1.5">{value}</div>
      <div className="text-[11px] text-moss mt-1">{delta}</div>
    </div>
  );
};

export default StatCard;
