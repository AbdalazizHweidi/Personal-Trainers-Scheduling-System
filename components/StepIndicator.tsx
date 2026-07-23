const steps = [
  { n: 1, label: "Service" },
  { n: 2, label: "Time" },
  { n: 3, label: "Confirm" },
];

const StepIndicator = ({ current }: { current: number }) => {
  return (
    <div className="flex items-center gap-2.5 mb-10 font-mono">
      {steps.map((step, i) => {
        const done = current > step.n;
        const isCurrent = current === step.n;
        return (
          <div key={step.n} className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-2 text-xs ${
                isCurrent ? "text-ink font-semibold" : "text-steel"
              }`}
            >
              <div
                className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center text-[11px] ${
                  done
                    ? "bg-moss border-moss text-white"
                    : isCurrent
                    ? "bg-flame border-flame text-white"
                    : "border-steel-line"
                }`}
              >
                {step.n}
              </div>
              {step.label}
            </div>
            {i !== steps.length - 1 && (
              <div className="w-[26px] h-px bg-steel-line" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
