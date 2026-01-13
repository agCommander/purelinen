"use client"

import { useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { NumberField } from "@/components/NumberField"
import { getProductPrice } from "@lib/util/get-product-price"

type SizeOption = {
  id: string
  value: string
  variant?: HttpTypes.StoreProductVariant
}

type SizeSelectorProps = {
  sizes: SizeOption[]
  selectedSize?: string | null
  onSizeChange: (size: string | null) => void
  quantity: number
  onQuantityChange: (quantity: number) => void
  product: HttpTypes.StoreProduct
  disabled?: boolean
  showPrices?: boolean
  maxQuantity?: number
  ariaLabel?: string
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  quantity,
  onQuantityChange,
  product,
  disabled = false,
  showPrices = false,
  maxQuantity = 999,
  ariaLabel = "Size",
}: SizeSelectorProps) {
  // Get prices for each size variant
  const sizesWithPrices = useMemo(() => {
    return sizes.map((size) => {
      const price = size.variant
        ? getProductPrice({
            product,
            variantId: size.variant.id,
          }).variantPrice
        : null

      return {
        ...size,
        price: price?.calculated_price || null,
        priceNumber: price?.calculated_price_number || null,
      }
    })
  }, [sizes, product])

  const handleSizeClick = (sizeValue: string) => {
    if (disabled || !showPrices) return
    
    if (selectedSize === sizeValue) {
      onSizeChange(null)
    } else {
      onSizeChange(sizeValue)
    }
  }

  return (
    <div className="flex flex-col" role="radiogroup" aria-label={ariaLabel}>
      {sizesWithPrices.map((size, index) => {
        const isSelected = selectedSize === size.value
        const isLast = index === sizesWithPrices.length - 1
        
        return (
          <div key={size.id}>
            <div
              className={`flex items-center justify-between py-3 ${
                !isLast ? "border-b border-grayscale-200" : ""
              } ${disabled ? "opacity-50" : ""}`}
            >
              <div
                className={`flex items-center flex-1 ${
                  disabled || !showPrices ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => handleSizeClick(size.value)}
                style={{ gap: "30px" }}
              >
                <span
                  className={`text-sm ${
                    isSelected ? "underline" : ""
                  }`}
                >
                  {size.value}
                </span>
                {showPrices && size.price && (
                  <span className="text-sm text-grayscale-600">
                    {size.price}
                  </span>
                )}
              </div>
              {isSelected && showPrices && (
                <div
                  className="ml-4 pointer-events-auto"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <NumberField
                    key={`quantity-${size.id}-${quantity}`}
                    value={quantity}
                    onChange={(value) => {
                      if (typeof value === 'number' && value >= 1) {
                        onQuantityChange(value)
                      }
                    }}
                    minValue={1}
                    maxValue={maxQuantity && maxQuantity > 0 ? maxQuantity : 999}
                    isDisabled={disabled}
                    size="sm"
                    className="!border-0 [&_input]:text-base [&_button]:text-base"
                    aria-label={`Quantity for ${size.value}`}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
