"use client"

import * as React from "react"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Drawer } from "@/components/Drawer"
import { LocalizedLink } from "@/components/LocalizedLink"
import { SearchField } from "@/components/SearchField"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import dynamic from "next/dynamic"

const LoginLink = dynamic(
  () => import("@modules/header/components/LoginLink"),
  { loading: () => <></> }
)

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((mod) => mod.CartDrawer),
  { loading: () => <></> }
)

type ProductType = HttpTypes.StoreProductType
type Category = HttpTypes.StoreProductCategory

export const HeaderDrawer: React.FC<{
  countryOptions: {
    country: string | undefined
    region: string
    label: string | undefined
  }[]
  productTypes?: ProductType[]
  categories?: Category[]
  isLoggedIn?: boolean
}> = ({ countryOptions, productTypes = [], categories = [], isLoggedIn = false }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [selectedProductType, setSelectedProductType] = React.useState<ProductType | null>(null)

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("query")

  React.useEffect(() => {
    if (searchQuery) setIsMenuOpen(false)
  }, [searchQuery])

  // Reset to main menu when drawer closes
  React.useEffect(() => {
    if (!isMenuOpen) {
      setSelectedProductType(null)
    }
  }, [isMenuOpen])

  // Get categories for selected product type
  const getCategoriesForProductType = (productType: ProductType) => {
    return categories.filter((category) => {
      const categoryMetadata = category.metadata as any
      const categoryProductTypeId = categoryMetadata?.product_type_id
      return categoryProductTypeId === productType.id
    }).sort((a, b) => {
      // Sort by column first, then by menu_order, then alphabetically
      const aMetadata = a.metadata as any
      const bMetadata = b.metadata as any
      const aColumn = aMetadata?.column ?? 999
      const bColumn = bMetadata?.column ?? 999
      const aOrder = aMetadata?.menu_order ?? 999
      const bOrder = bMetadata?.menu_order ?? 999
      
      // First sort by column
      if (aColumn !== bColumn) {
        return aColumn - bColumn
      }
      
      // Then sort by menu_order
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      
      // Finally sort alphabetically
      return (a.name || '').localeCompare(b.name || '')
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        className="p-1 group-data-[light=true]:md:text-white"
        onPress={() => setIsMenuOpen(true)}
        aria-label="Open menu"
      >
        <Icon name="menu" className="w-6 h-6" wrapperClassName="w-6 h-6" />
      </Button>
      <Drawer
        animateFrom="left"
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        className="rounded-none !p-0"
      >
        {({ close }) => {
          const categoryItems = selectedProductType 
            ? getCategoriesForProductType(selectedProductType)
            : []

          return (
            <div className="flex flex-col h-full bg-white text-black">
              {/* Header: Logo and Search - always visible */}
              <div className="flex-shrink-0 border-b border-grayscale-200 px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <LocalizedLink href="/" onClick={close}>
                    <img
                      src="/images/content/PURELINEN-GREY-LOGO.png"
                      alt="Pure Linen"
                      width={200}
                      className="h-auto"
                    />
                  </LocalizedLink>
                  <button onClick={close} aria-label="Close menu" className="p-2">
                    <Icon name="close" className="w-6 h-6" />
                  </button>
                </div>
                <SearchField
                  countryOptions={countryOptions}
                  isInputAlwaysShown
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {!selectedProductType ? (
                  /* Main Menu: Product Types */
                  <div className="flex flex-col">
                    {productTypes.length > 0 ? (
                      <div className="flex flex-col">
                        {productTypes.map((productType) => (
                          <button
                            key={productType.id}
                            onClick={() => setSelectedProductType(productType)}
                            className="px-4 py-4 text-left border-b border-grayscale-200 hover:bg-grayscale-50 transition-colors flex items-center justify-between"
                          >
                            <span className="text-base font-normal">{productType.value}</span>
                            <Icon name="chevron-right" className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-grayscale-500">
                        No product types available
                      </div>
                    )}
                  </div>
                ) : (
                  /* Category Panel */
                  <div className="flex flex-col">
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedProductType(null)}
                      className="px-4 py-4 text-left border-b border-grayscale-200 hover:bg-grayscale-50 transition-colors flex items-center gap-2"
                    >
                      <Icon name="chevron-left" className="w-5 h-5" />
                      <span className="text-base font-normal">Back</span>
                    </button>

                    {/* Category Items */}
                    {categoryItems.length > 0 ? (
                      <div className="flex flex-col">
                        {categoryItems.map((category) => (
                          <LocalizedLink
                            key={category.id}
                            href={`/store?type=${selectedProductType.value}&category=${category.handle}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="px-4 py-4 text-left border-b border-grayscale-200 hover:bg-grayscale-50 transition-colors"
                          >
                            <span className="text-base font-normal">{category.name}</span>
                          </LocalizedLink>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-grayscale-500">
                        No categories available for {selectedProductType.value}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer: Login and Cart - always visible */}
              <div className="flex-shrink-0 border-t border-grayscale-200 px-4 py-4 flex items-center justify-center gap-6">
                <LoginLink className="p-2" />
                {isLoggedIn && <CartDrawer />}
              </div>
            </div>
          )
        }}
      </Drawer>
    </>
  )
}
