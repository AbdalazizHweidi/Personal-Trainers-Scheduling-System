type Day = {
  d: string;
  slots: { time: string; free?: boolean }[];
  closed?: boolean;
};

const week: Day[] = [
  { d: "MON", slots: [{ time: "7:00a", free: true }, { time: "9:00a" }, { time: "5:30p", free: true }] },
  { d: "TUE", slots: [{ time: "7:00a" }, { time: "6:30p", free: true }] },
  { d: "WED", slots: [{ time: "7:00a", free: true }, { time: "12:00p", free: true }] },
  { d: "THU", slots: [{ time: "9:00a" }, { time: "5:30p", free: true }] },
  { d: "FRI", slots: [{ time: "7:00a", free: true }, { time: "6:30p" }] },
  { d: "SAT", slots: [{ time: "9:00a", free: true }] },
  { d: "SUN", slots: [], closed: true },
];

const AvailabilityGrid = () => {
  return (
    <div className="grid grid-cols-7 gap-1.5 mt-3.5">
      {week.map((day) => (
        <div key={day.d} className="text-center">
          <div className="font-mono text-[11px] text-steel mb-1.5">{day.d}</div>
          {day.closed ? (
            <div className="bg-paper-dim rounded-[3px] text-[10px] px-0.5 py-1 mb-1 text-ink-soft opacity-40">
              Closed
            </div>
          ) : (
            day.slots.map((slot, i) => (
              <div
                key={i}
                className={`rounded-[3px] text-[10px] px-0.5 py-1 mb-1 ${
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
  );
};

export default AvailabilityGrid;
