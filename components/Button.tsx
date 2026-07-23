import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-flame text-white hover:bg-flame-dark border-transparent",
  outline: "bg-transparent border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "bg-transparent text-ink-soft font-medium hover:text-ink border-transparent",
};

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-[3px] border transition-all duration-150 leading-none";

type CommonProps = {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
};

const Button = ({
  variant = "primary",
  small = false,
  block = false,
  className = "",
  children,
  href,
  ...rest
}: ButtonAsButton | ButtonAsLink) => {
  const classes = `${base} ${variantClasses[variant]} ${
    small ? "px-3.5 py-2 text-[13px]" : "px-[22px] py-[11px]"
  } ${block ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};

export default Button;
