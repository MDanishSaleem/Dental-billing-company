"use client"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  max?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
}

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((star) => {
        const filled = star <= Math.floor(rating)
        const partial = !filled && star <= rating + 0.5

        return (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled || partial
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-slate-300"
              )}
            />
            {partial && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className={cn(sizeMap[size], "fill-amber-400 text-amber-400")} />
              </div>
            )}
          </button>
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
