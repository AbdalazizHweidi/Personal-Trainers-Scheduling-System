import { cn } from "@/lib/utils"

const sizeMap = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
}

export function TrainerAvatar({
  initials,
  color,
  size = "md",
  className,
}: {
  initials: string | null
  color: string | null
  size?: keyof typeof sizeMap
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-display font-normal text-white",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: color ?? "#E8552B" }}
      aria-hidden="true"
    >
      {initials ?? "?"}
    </div>
  )
}
