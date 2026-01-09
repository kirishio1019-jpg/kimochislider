'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  leftLabel?: string
  rightLabel?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  leftLabel,
  rightLabel,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-medium">{leftLabel}</span>
        <span className="font-medium">{rightLabel}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
        <style jsx global>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
          }
          .slider::-webkit-slider-thumb:active {
            transform: scale(1.1);
          }
          .slider::-moz-range-thumb {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
          }
          .slider::-moz-range-thumb:active {
            transform: scale(1.1);
          }
        `}</style>
      </div>
    </div>
  )
}
