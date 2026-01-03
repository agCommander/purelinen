"use client"

import * as React from "react"
import { LocalizedLink } from "@/components/LocalizedLink"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

type ProductType = HttpTypes.StoreProductType
type Category = HttpTypes.StoreProductCategory

// Helper function to get product type image paths
// Returns array of image paths, or null if none configured
const getProductTypeImages = (productType: ProductType): string[] | null => {
  const metadata = productType.metadata as any
  
  // First, check if menu_images are configured in metadata
  if (metadata?.menu_images && Array.isArray(metadata.menu_images) && metadata.menu_images.length > 0) {
    return metadata.menu_images.map((filename: string) => 
      `/images/content/product-type/${filename.trim()}`
    )
  }
  
  // Fallback to hard-coded image map
  const imageMap: Record<string, string> = {
    "Dining": "dining.jpg",
    "Bedroom": "bedroom.jpg",
    "Home Decor": "home-decor.jpg",
    "Bathroom": "bathroom.jpg",
    "Tea Towels": "tea-towels.jpg",
    "Aprons": "aprons.jpg",
    "Fabrics": "fabrics.jpg",
    "Accessories": "accessories.jpg"
  }

  const filename = imageMap[productType.value]
  if (!filename) return null

  return [`/images/content/product-type/${filename}`]
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
  
  // Get product type configuration from metadata
  const productTypeMetadata = productType.metadata as any
  
  const productTypeImages = getProductTypeImages(productType)
  const numImages = productTypeImages ? productTypeImages.length : 0
  
  // Always use 6-column grid
  // Allocate 2 columns per image, categories get remaining columns
  // 1 image: 2 columns for images, 4 columns for categories
  // 2 images: 4 columns for images, 2 columns for categories
  const imagesColSpan = numImages > 0 ? numImages * 2 : 0
  const categoriesColSpan = 6 - imagesColSpan // Remaining columns go to categories
  
  // Map to valid Tailwind classes (Tailwind requires full class names at build time)
  const colSpanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
  }
  

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
      {/* Use a full-width container instead of Layout to avoid centering */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-6 gap-0 h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
            {/* Categories - render columns based on available space */}
            <div className={`${colSpanClasses[categoriesColSpan] || 'col-span-4'} grid h-full`} style={{ gridTemplateColumns: `repeat(${categoriesColSpan}, 1fr)` }}>
              {subMenuCategories.length > 0 ? (
                // Render columns based on available space (4 columns when 4 available, 2 columns when 2 available)
                Array.from({ length: categoriesColSpan }).map((_, colIndex) => {
                  const columnCategories = subMenuCategories.filter((category) => {
                    const categoryMetadata = category.metadata as any
                    const assignedColumn = categoryMetadata?.column
                    // If column is explicitly set, use it if it's within available columns; otherwise distribute by index
                    if (assignedColumn !== undefined && assignedColumn !== null && assignedColumn < categoriesColSpan) {
                      return assignedColumn === colIndex
                    }
                    // Default: distribute sequentially
                    const index = subMenuCategories.indexOf(category)
                    return index % categoriesColSpan === colIndex
                  })
                  
                  const isEmpty = columnCategories.length === 0
                  
                  return (
                    <div
                      key={colIndex}
                      className={`px-2 py-4 h-full flex flex-col ${
                        colIndex < categoriesColSpan - 1 
                          ? isEmpty 
                            ? "border-r border-white" 
                            : "border-r border-grayscale-200" 
                          : ""
                      }`}
                    >
                      {columnCategories.length > 0 && (
                        <div className="space-y-2">
                          {columnCategories.map((category) => (
                            <LocalizedLink
                              key={category.id}
                              href={`/categories/${category.handle}`}
                              className="text-xs font-normal hover:underline block"
                            >
                              {category.name}
                            </LocalizedLink>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="px-2 py-4 h-full col-span-4">
                  <LocalizedLink
                    href={`/store?type=${productType.value}`}
                    className="text-xs font-normal hover:underline block"
                  >
                    View All {productType.value}
                  </LocalizedLink>
                </div>
              )}
            </div>

            {/* Product Type Images hard right - each image gets 2 columns */}
            {productTypeImages && productTypeImages.length > 0 && (
              <>
                {productTypeImages.map((imagePath, imageIndex) => (
                  <div 
                    key={imageIndex} 
                    className="col-span-2 p-5 flex flex-col h-full"
                  >
                    <LocalizedLink
                      href={`/store?type=${productType.value}`}
                      className="flex-1 relative min-h-0 mb-4 overflow-hidden"
                    >
                      <Image
                        src={imagePath}
                        alt={`${productType.value} ${imageIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                    </LocalizedLink>
                    {/*imageIndex === productTypeImages.length - 1 && (
                      <div className="text-sm font-medium text-center flex-shrink-0">
                        {productType.value}
                      </div>
                    )}*/}
                  </div>
                ))}
              </>
            )}
        </div>
      </div>
    </div>
  )
}

