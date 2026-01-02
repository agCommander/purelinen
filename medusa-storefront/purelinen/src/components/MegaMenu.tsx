"use client"

import * as React from "react"
import { LocalizedLink } from "@/components/LocalizedLink"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

type ProductType = HttpTypes.StoreProductType
type Category = HttpTypes.StoreProductCategory

// Helper function to get product type image path
const getProductTypeImage = (productTypeValue: string): string | null => {
  // Map product type names to image filenames
  // You can adjust these filenames to match your actual image files
  const imageMap: Record<string, string> = {
    "Dining": "dining.jpg",
    "Kitchen": "kitchen.jpg",
    "Bedroom": "bedroom.jpg",
    "Home Decor": "home-decor.jpg",
    "Bathroom": "bathroom.jpg",
    "Fabrics": "fabrics.jpg",
    "Accessories": "accessories.jpg"
  }

  const filename = imageMap[productTypeValue]
  if (!filename) return null

  return `/images/content/product-type/${filename}`
}

export const MegaMenu: React.FC<{
  productType: ProductType
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onMouseEnter?: () => void
}> = ({ productType, categories, isOpen, onClose, onMouseEnter }) => {
  if (!isOpen) return null

  // Filter categories by product type - match category.metadata.product_type_id with productType.id
  const subMenuCategories = categories
    .filter((category) => {
      const categoryMetadata = category.metadata as any
      const categoryProductTypeId = categoryMetadata?.product_type_id
      return categoryProductTypeId === productType.id
    })
    .sort((a, b) => {
      // Sort by menu_order if available, otherwise alphabetically by name
      const aMetadata = a.metadata as any
      const bMetadata = b.metadata as any
      const aOrder = aMetadata?.menu_order ?? 999
      const bOrder = bMetadata?.menu_order ?? 999
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      // If same order, sort alphabetically
      return (a.name || '').localeCompare(b.name || '')
    })
    // Don't slice here - let column assignment handle distribution
  
  const productTypeImage = getProductTypeImage(productType.value)

  return (
    <div
      data-mega-menu
      className="fixed left-0 right-0 w-full bg-white border-t border-grayscale-200 shadow-lg z-50"
      style={{ 
        top: "48px", // h-12 = 48px
      }}
      onMouseEnter={onMouseEnter} // Keep menu open when hovering
      onMouseLeave={onClose}
    >
      <Layout className="py-0">
        <LayoutColumn className="p-0">
          <div className="grid grid-cols-12 gap-0 h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
            {/* Categories in 4 columns with vertical borders */}
            <div className="col-span-8 grid grid-cols-4 h-full">
              {subMenuCategories.length > 0 ? (
                // Organize categories into 4 columns
                // If category has metadata.column (0-3), use that; otherwise distribute sequentially
                Array.from({ length: 4 }).map((_, colIndex) => {
                  const columnCategories = subMenuCategories.filter((category) => {
                    const categoryMetadata = category.metadata as any
                    const assignedColumn = categoryMetadata?.column
                    // If column is explicitly set (0-3), use it; otherwise distribute by index
                    if (assignedColumn !== undefined && assignedColumn !== null) {
                      return assignedColumn === colIndex
                    }
                    // Default: distribute sequentially
                    const index = subMenuCategories.indexOf(category)
                    return index % 4 === colIndex
                  })
                  
                  return (
                    <div
                      key={colIndex}
                      className={`px-4 py-4 h-full flex flex-col ${
                        colIndex < 3 ? "border-r border-grayscale-200" : ""
                      }`}
                    >
                      <div className="space-y-2">
                        {columnCategories.map((category) => (
                          <LocalizedLink
                            key={category.id}
                            href={`/store?type=${productType.value}&category=${category.handle}`}
                            className="text-xs font-normal hover:underline block"
                          >
                            {category.name}
                          </LocalizedLink>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="px-4 py-4 h-full">
                  <LocalizedLink
                    href={`/store?type=${productType.value}`}
                    className="text-xs font-normal hover:underline block"
                  >
                    View All {productType.value}
                  </LocalizedLink>
                </div>
              )}
            </div>

            {/* Product Type Image hard right */}
            {productTypeImage && (
              <div className="col-span-4 p-5 flex flex-col h-full">
                <LocalizedLink
                  href={`/store?type=${productType.value}`}
                  className="flex-1 relative min-h-0 mb-4 overflow-hidden"
                >
                  <Image
                    src={productTypeImage}
                    alt={productType.value}
                    fill
                    className="object-cover"
                  />
                </LocalizedLink>
                <div className="text-sm font-medium text-center flex-shrink-0">
                  {productType.value}
                </div>
              </div>
            )}
          </div>
        </LayoutColumn>
      </Layout>
    </div>
  )
}

