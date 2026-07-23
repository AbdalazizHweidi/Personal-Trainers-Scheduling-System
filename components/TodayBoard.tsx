type Row = {
  time: string;
  who: string;
  what: string;
  status: "open" | "booked";
};

const rows: Row[] = [
  { time: "7:00a", who: "Jordan Reyes", what: "Strength · 60 min", status: "booked" },
  { time: "9:00a", who: "Amara Osei", what: "Mobility · 30 min", status: "open" },
  { time: "12:30p", who: "Leo Martins", what: "Performance · 60 min", status: "open" },
  { time: "5:30p", who: "Priya Nair", what: "Small group · 45 min", status: "booked" },
  { time: "6:30p", who: "Jordan Reyes", what: "Strength · 30 min", status: "open" },
];

const TodayBoard = () => {
  return (
    <div className="bg-ink rounded-lg px-[22px] pt-[22px] pb-4 text-white">
      <div className="flex justify-between items-center mb-3.5 border-b border-[#333] pb-3">
        <b className="font-display text-lg tracking-[.03em]">Today&apos;s board</b>
        <span className="font-mono text-[11px] text-[#8b9198]">TUE · JUL 21</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-[64px_1fr_auto] gap-3 items-center py-2.5 px-1 ${
            i !== rows.length - 1 ? "border-b border-[#262b30]" : ""
          }`}
        >
          <span className="font-mono text-[13px] text-[#c7ccd1]">{row.time}</span>
          <div>
            <span className="text-[13px] font-medium block">{row.who}</span>
            <span className="text-[11px] text-[#8b9198] block mt-0.5">
              {row.what}
            </span>
          </div>
          <span
            className={`font-mono text-[10px] tracking-[.06em] uppercase px-2 py-[3px] rounded-[2px] ${
              row.status === "open"
                ? "bg-[rgba(255,90,31,.18)] text-[#ff8f5c]"
                : "bg-white/[.08] text-[#8b9198]"
            }`}
          >
            {row.status === "open" ? "Open" : "Booked"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TodayBoard;
