import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingStars({
  rating,
  size = 16,
  showValue = false,
  reviewCount,
  className,
}: {
  rating: number
  size?: number
  showValue?: boolean
  reviewCount?: number
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i <= Math.round(rating)
                ? "fill-primary text-primary"
                : "fill-muted text-muted"
            }
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
          {typeof reviewCount === "number" && (
            <span className="font-normal text-muted-foreground"> ({reviewCount})</span>
          )}
        </span>
      )}
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
    </div>
  )
}
