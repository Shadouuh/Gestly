import { Star } from 'lucide-react'
import { useState } from 'react'

interface RatingStarsProps {
  rating: number
  max?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  size?: number
  className?: string
}

export function RatingStars({ 
  rating, 
  max = 5, 
  interactive = false, 
  onChange, 
  size = 16,
  className = ''
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  return (
    <div className={`flex items-center gap-0.5 ${className}`} onMouseLeave={() => interactive && setHoverRating(null)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const isFilled = (hoverRating ?? rating) >= starValue
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-bg)] rounded-[calc(var(--radius)_-_12px)]`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                isFilled 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'fill-transparent text-gray-300 dark:text-gray-600'
              }`}
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        )
      })}
    </div>
  )
}
