type Status = "confirmed" | "pending" | "past";

const classes: Record<Status, string> = {
  confirmed: "bg-moss-tint text-moss",
  pending: "bg-chalk-tint text-chalk",
  past: "bg-paper-dim text-steel",
};

const labels: Record<Status, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  past: "Completed",
};

const StatusPill = ({ status }: { status: Status }) => {
  return (
    <span
      className={`font-mono text-[10px] uppercase px-[9px] py-1 rounded-full tracking-[.04em] ${classes[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default StatusPill;
