"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCountryCode } from "hooks/country-code"
import { Icon } from "@/components/Icon"
import FilterPanel from "@modules/store/components/filter-panel"

type FilterButtonProps = {
  productTypes: Record<string, string>
  colorFilterGroups: Array<{
    name: string
    hexCode: string
  }>
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  productTypes,
  colorFilterGroups,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useCountryCode()

  // Extract product type from URL - check both pathname (types page) and query params (store page)
  const getSelectedProductType = () => {
    // Check if we're on a types page
    const typesMatch = pathname.match(/\/types\/([^\/\?]+)/)
    if (typesMatch) {
      return typesMatch[1] // Return the product type value from the path
    }
    // Otherwise check query params
    return searchParams.get("productType")
  }

  const selectedProductType = getSelectedProductType()
  const selectedColorGroups = searchParams.getAll("colorGroup")

  // Count active filters
  const activeFilterCount =
    (selectedProductType ? 1 : 0) + selectedColorGroups.length

  // Build home page URL
  const getHomeUrl = () => {
    return countryCode ? `/${countryCode}` : "/"
  }

  // Build types page URL (collections page for product type)
  const getTypesUrl = (typeValue: string, colorGroups: string[]) => {
    const basePath = countryCode ? `/${countryCode}/types/${typeValue}` : `/types/${typeValue}`
    if (colorGroups.length > 0) {
      const params = new URLSearchParams()
      colorGroups.forEach((group) => params.append("colorGroup", group))
      return `${basePath}?${params.toString()}`
    }
    return basePath
  }

  // Handle product type change
  const handleProductTypeChange = (type: string | null) => {
    if (type) {
      // Navigate to types page (collections page for this product type)
      // Preserve color groups if they exist
      const currentColorGroups = searchParams.getAll("colorGroup")
      router.push(getTypesUrl(type, currentColorGroups), { scroll: false })
    } else {
      // If clearing product type, navigate to home page instead of store
      router.push(getHomeUrl(), { scroll: false })
    }
  }

  // Handle color groups change
  const handleColorGroupsChange = (groupNames: string[]) => {
    // Check if we're on a types page (collections page for product type)
    const isTypesPage = pathname.includes("/types/")
    
    if (isTypesPage && selectedProductType) {
      // If on types page, update URL with color groups
      const params = new URLSearchParams()
      groupNames.forEach((group) => params.append("colorGroup", group))
      const newUrl = params.toString() 
        ? `${pathname}?${params.toString()}`
        : pathname
      router.push(newUrl, { scroll: false })
    } else if (selectedProductType) {
      // If we have a product type selected (from query params), navigate to that product type's page
      router.push(getTypesUrl(selectedProductType, groupNames), { scroll: false })
    } else {
      // If no product type selected, navigate to home page
      // (Color filtering without a product type doesn't make sense)
      router.push(getHomeUrl(), { scroll: false })
    }
  }

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsFilterPanelOpen(true)}
        className="flex items-center gap-1 px-4 py-2 rounded hover:bg-grayscale-50"
        aria-label="Open filters"
      >
        <Icon name="sliders" className="w-5 h-5" />
        <span className="hidden md:hidden">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-1 py-0.5 bg-grayscale-500 text-white text-xs hidden md:inline">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        productTypes={productTypes}
        colorFilterGroups={colorFilterGroups}
        selectedProductType={selectedProductType}
        selectedColorGroups={selectedColorGroups}
        onProductTypeChange={handleProductTypeChange}
        onColorGroupsChange={handleColorGroupsChange}
      />
    </>
  )
}
