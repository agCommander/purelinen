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

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseLeave = (categoryId: string) => {
    // Add a small delay before closing to allow movement to mega menu
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 100)
  }

  const handleMouseEnter = (categoryId: string) => {
    // Clear any pending close timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setHoveredCategory(categoryId)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
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
                  // Clear timeout when entering mega menu
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                    timeoutRef.current = null
                  }
                }}
                onClose={() => {
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
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

