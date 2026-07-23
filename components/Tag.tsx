import { ReactNode } from "react";

type Variant = "default" | "flame" | "moss" | "chalk";

const variantClasses: Record<Variant, string> = {
  default: "bg-paper-dim text-steel",
  flame: "bg-flame-tint text-flame-dark",
  moss: "bg-moss-tint text-moss",
  chalk: "bg-chalk-tint text-chalk",
};

const Tag = ({
  variant = "default",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) => {
  return (
    <span
      className={`inline-block font-mono text-[11px] tracking-[.06em] uppercase px-2.5 py-1 rounded-[2px] ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};

export default Tag;
