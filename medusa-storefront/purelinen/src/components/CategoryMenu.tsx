"use client"

import * as React from "react"
import { LocalizedLink } from "@/components/LocalizedLink"
import { MegaMenu } from "@/components/MegaMenu"
import { HttpTypes } from "@medusajs/types"

type ProductType = HttpTypes.StoreProductType
type Category = HttpTypes.StoreProductCategory

export const CategoryMenu: React.FC<{
  productTypes: ProductType[]
  categories: Category[]
}> = ({ productTypes, categories }) => {
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(
    null
  )

  const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseLeave = (categoryId: string) => {
    // Clear any pending open timeout if user moves away before menu opens
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
    // Add a small delay before closing to allow movement to mega menu
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 100)
  }

  const handleMouseEnter = (categoryId: string) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    // Clear any existing open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
    }
    // Add 500ms delay before opening the menu
    openTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(categoryId)
      openTimeoutRef.current = null
    }, 400)
  }

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <nav className="flex items-center gap-4">
      {productTypes.map((productType) => {
        const isHovered = hoveredCategory === productType.id
        return (
          <div
            key={productType.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(productType.id)}
            onMouseLeave={() => handleMouseLeave(productType.id)}
          >
            <LocalizedLink
              href={`/types/${productType.value}`}
              className="text-[13px] font-normal hover:underline"
            >
              {productType.value}
            </LocalizedLink>
            {isHovered && (
              <MegaMenu
                productType={productType}
                categories={categories}
                isOpen={true}
                onMouseEnter={() => {
                  // Clear close timeout when entering mega menu
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current)
                    closeTimeoutRef.current = null
                  }
                }}
                onClose={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current)
                  }
                  setHoveredCategory(null)
                }}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

