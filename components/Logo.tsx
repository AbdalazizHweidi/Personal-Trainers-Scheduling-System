const Logo = ({ light = false }: { light?: boolean }) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-end gap-[3px] h-[26px]">
        <span className="block w-1.5 h-3 bg-flame" />
        <span className="block w-1.5 h-[22px] bg-ink" />
        <span className="block w-1.5 h-4 bg-flame" />
      </div>
      <span
        className={`font-display text-[26px] tracking-[.03em] ${
          light ? "text-white" : "text-ink"
        }`}
      >
        FITCONNECT
      </span>
    </div>
  );
};

export default Logo;
