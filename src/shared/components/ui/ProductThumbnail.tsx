import { useMemo, useState, useEffect } from 'react'
import { LottieIcon } from '@shared/components/ui/LottieIcon'
import { getCategoryColor, getCategoryIcon, getCategoryAnimation, getCategoryPng } from '@shared/utils/categoryHelpers'

interface ProductThumbnailProps {
  imageUrl?: string | null
  category?: string
  name: string
  className?: string
  iconSize?: number
}

export function ProductThumbnail({
  imageUrl,
  category,
  name,
  className,
  iconSize = 24,
}: ProductThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [imageUrl])

  const color = getCategoryColor(category || '')
  const Icon = getCategoryIcon(category || '')
  const lottieAnim = getCategoryAnimation(category || '')
  const pngIcon = getCategoryPng(category || '')

  const placeholderStyle = useMemo(() => {
    return { 
        background: `linear-gradient(135deg, ${color}15 0%, ${color}40 100%)`,
        color: color 
    }
  }, [color])

  if (imageUrl && !imageError) {
    return (
      <div
        className={`relative overflow-hidden ${className || ''} ${
          !imageLoaded ? '' : 'bg-transparent border border-[color:var(--border)]'
        }`}
        style={!imageLoaded ? placeholderStyle : undefined}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm shadow-sm flex items-center justify-center overflow-hidden">
                {pngIcon ? (
                  <img 
                    src={pngIcon} 
                    alt={category} 
                    className="object-contain drop-shadow-md hover:scale-110 transition-transform duration-300" 
                    style={{ width: iconSize * 1.8, height: iconSize * 1.8 }} 
                  />
                ) : lottieAnim ? (
                  <LottieIcon animationData={lottieAnim} size={iconSize * 1.5} />
                ) : (
                  <Icon size={iconSize} strokeWidth={2} />
                )}
             </div>
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={name}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  // Fallback if no image URL or error loading image
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className || ''}`}
      style={placeholderStyle}
    >
      <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm shadow-sm flex items-center justify-center overflow-hidden">
        {pngIcon ? (
           <img 
             src={pngIcon} 
             alt={category} 
             className="object-contain drop-shadow-md hover:scale-110 transition-transform duration-300" 
             style={{ width: iconSize * 1.8, height: iconSize * 1.8 }} 
           />
        ) : lottieAnim ? (
           <LottieIcon animationData={lottieAnim} size={iconSize * 1.5} />
        ) : (
           <Icon size={iconSize} strokeWidth={2} />
        )}
      </div>
    </div>
  )
}
