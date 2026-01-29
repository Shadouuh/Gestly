import * as React from "react"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min: number
  max: number
  step?: number
  value: number[]
  onValueChange: (value: number[]) => void
  formatLabel?: (value: number) => string
}

export function Slider({ min, max, step = 1, value, onValueChange, formatLabel, className, ...props }: SliderProps) {
  // Simple implementation for range slider using two inputs
  // For a full dual-thumb slider without libraries, it requires significant CSS/JS.
  // We will use a simplified approach with two inputs for this demo to ensure stability.
  
  const [minVal, maxVal] = value

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step)
    onValueChange([val, maxVal])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step)
    onValueChange([minVal, val])
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative h-2 bg-gray-200 rounded-full dark:bg-gray-700">
        <div 
          className="absolute h-full bg-[color:var(--primary-bg)] rounded-full opacity-50"
          style={{ 
            left: `${((minVal - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxVal - min) / (max - min)) * 100}%`
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-auto z-20"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-auto z-20"
        />
        
        {/* Visual Thumbs */}
        <div 
            className="absolute h-4 w-4 bg-white border-2 border-[color:var(--primary-bg)] rounded-full -mt-1 shadow-md pointer-events-none z-10 transition-transform"
            style={{ left: `calc(${((minVal - min) / (max - min)) * 100}% - 8px)` }}
        />
        <div 
            className="absolute h-4 w-4 bg-white border-2 border-[color:var(--primary-bg)] rounded-full -mt-1 shadow-md pointer-events-none z-10 transition-transform"
            style={{ left: `calc(${((maxVal - min) / (max - min)) * 100}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs font-medium tabular-nums bg-[color:var(--ghost-hover-bg)] px-2 py-1 rounded-[calc(var(--radius)_-_8px)] border border-[color:var(--border)]">
            {formatLabel ? formatLabel(minVal) : minVal}
        </div>
        <div className="text-xs font-medium tabular-nums bg-[color:var(--ghost-hover-bg)] px-2 py-1 rounded-[calc(var(--radius)_-_8px)] border border-[color:var(--border)]">
            {formatLabel ? formatLabel(maxVal) : maxVal}
        </div>
      </div>
    </div>
  )
}
