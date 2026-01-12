"use client"

import { Close } from "@/components/icons/Close"

type Color = {
  id: string
  name: string
  hex_code: string
}

type ColorSwatchPickerProps = {
  colors: Color[]
  selectedColor?: string | null
  onColorChange: (color: string | null) => void
  disabled?: boolean
  "aria-label"?: string
}

export default function ColorSwatchPicker({
  colors,
  selectedColor,
  onColorChange,
  disabled = false,
  "aria-label": ariaLabel = "Color",
}: ColorSwatchPickerProps) {
  const handleColorClick = (colorName: string | null) => {
    if (disabled) return
    
    // If clicking the same color, deselect it (set to null)
    if (selectedColor === colorName) {
      onColorChange(null)
    } else {
      onColorChange(colorName)
    }
  }

  return (
    <div className="flex flex-wrap gap-4" role="radiogroup" aria-label={ariaLabel}>
      {/* Clear/Reset swatch - shows hero images */}
      <button
        type="button"
        onClick={() => handleColorClick(null)}
        disabled={disabled}
        aria-label="Clear color selection"
        className={`
          h-10 w-10 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${selectedColor === null 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
          focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        `}
      >
        <Close className={`h-5 w-5 ${selectedColor === null ? 'text-black' : 'text-gray-400'}`} />
      </button>

      {/* Color swatches */}
      {colors.map((color) => {
        const isSelected = selectedColor === color.name
        
        return (
          <button
            key={color.id}
            type="button"
            onClick={() => handleColorClick(color.name)}
            disabled={disabled}
            aria-label={`Select color ${color.name}`}
            aria-checked={isSelected}
            role="radio"
            className={`
              h-10 w-10 rounded-full border-2
              transition-all duration-200
              ${isSelected 
                ? 'border-black ring-2 ring-black ring-offset-2' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
            `}
            style={{ 
              background: color.hex_code,
              // Add a subtle border for light colors
              boxShadow: isSelected 
                ? '0 0 0 2px white, 0 0 0 4px black' 
                : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            title={color.name}
          />
        )
      })}
    </div>
  )
}
