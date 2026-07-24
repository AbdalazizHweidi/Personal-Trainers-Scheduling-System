import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "primary" | "success" | "muted" | "outline"

const variants: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  muted: "bg-muted text-muted-foreground",
  outline: "border border-border text-foreground",
}

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
