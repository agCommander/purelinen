"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Layout, LayoutColumn } from "@/components/Layout"
import { CategoryFilter } from "@modules/store/components/refinement-list/category-filter"
import { CollectionFilter } from "@modules/store/components/refinement-list/collection-filter"
import { MobileFilters } from "@modules/store/components/refinement-list/mobile-filters"
import { MobileSort } from "@modules/store/components/refinement-list/mobile-sort"
import SortProducts, {
  SortOptions,
} from "@modules/store/components/refinement-list/sort-products"
import { TypeFilter } from "@modules/store/components/refinement-list/type-filter"
import FilterPanel from "@modules/store/components/filter-panel"
import { Icon } from "@/components/Icon"
import { useState } from "react"

type RefinementListProps = {
  title?: string
  collections?: Record<string, string>
  collection?: string[]
  categories?: Record<string, string>
  category?: string[]
  types?: Record<string, string>
  type?: string[]
  colorFilterGroups?: Array<{
    groupName: string
    hexCode: string
    colorCount: number
  }>
  sortBy: SortOptions | undefined
  "data-testid"?: string
}

const RefinementList = ({
  title = "Shop",
  collections,
  collection,
  categories,
  category,
  types,
  type,
  colorFilterGroups = [],
  sortBy,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  
  // Get filter values from URL params
  const selectedProductType = searchParams.get("productType")
  const selectedColorGroups = searchParams.getAll("colorGroup")

  const setQueryParams = useCallback(
    (name: string, value: string | string[]) => {
      const query = new URLSearchParams(searchParams)

      if (Array.isArray(value)) {
        query.delete(name)
        value.forEach((v) => query.append(name, v))
      } else {
        query.set(name, value)
      }

      router.push(`${pathname}?${query.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setMultipleQueryParams = useCallback(
    (params: Record<string, string | string[]>) => {
      const query = new URLSearchParams(searchParams)

      Object.entries(params).forEach(([name, value]) => {
        if (Array.isArray(value)) {
          query.delete(name)
          value.forEach((v) => query.append(name, v))
        } else {
          query.set(name, value)
        }
      })

      router.push(`${pathname}?${query.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  return (
    <Layout className="mb-6 md:mb-8">
      <LayoutColumn>
        <h2 className="text-md md:text-2xl mb-6 md:mb-7" id="products">
          {title}
        </h2>
        <div className="flex justify-between gap-10">
          <div className="flex gap-4">
            <MobileFilters
              collections={collections}
              collection={collection}
              categories={categories}
              category={category}
              types={types}
              type={type}
              setMultipleQueryParams={setMultipleQueryParams}
            />
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-grayscale-300 rounded hover:bg-grayscale-50 md:hidden"
              aria-label="Open filters"
            >
              <Icon name="sliders" className="w-5 h-5" />
              <span className="text-sm">Filters</span>
              {(selectedProductType || selectedColorGroups.length > 0) && (
                <span className="ml-1 px-1.5 py-0.5 bg-black text-white text-xs rounded-full">
                  {(selectedProductType ? 1 : 0) + selectedColorGroups.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 border border-grayscale-300 rounded hover:bg-grayscale-50"
              aria-label="Open filters"
            >
              <Icon name="sliders" className="w-5 h-5" />
              <span>Filters</span>
              {(selectedProductType || selectedColorGroups.length > 0) && (
                <span className="ml-1 px-1.5 py-0.5 bg-black text-white text-xs rounded-full">
                  {(selectedProductType ? 1 : 0) + selectedColorGroups.length}
                </span>
              )}
            </button>
          </div>
          <MobileSort sortBy={sortBy} setQueryParams={setQueryParams} />
          <div className="flex justify-between gap-4 max-md:hidden">
            {typeof categories !== "undefined" && (
              <CategoryFilter
                categories={categories}
                category={category}
                setQueryParams={setQueryParams}
              />
            )}
            {typeof types !== "undefined" && (
              <TypeFilter
                types={types}
                type={type}
                setQueryParams={setQueryParams}
              />
            )}
            {typeof collections !== "undefined" && (
              <CollectionFilter
                collections={collections}
                collection={collection}
                setQueryParams={setQueryParams}
              />
            )}
          </div>
          <SortProducts
            sortBy={sortBy}
            setQueryParams={setQueryParams}
            data-testid={dataTestId}
          />
        </div>
        
        {/* Filter Panel */}
        {types && (
          <FilterPanel
            isOpen={isFilterPanelOpen}
            onClose={() => setIsFilterPanelOpen(false)}
            productTypes={types}
            colorFilterGroups={colorFilterGroups}
            selectedProductType={selectedProductType}
            selectedColorGroups={selectedColorGroups}
            onProductTypeChange={(value) => {
              if (value) {
                setQueryParams("productType", value)
              } else {
                const query = new URLSearchParams(searchParams)
                query.delete("productType")
                router.push(`${pathname}?${query.toString()}`, { scroll: false })
              }
            }}
            onColorGroupsChange={(groups) => {
              const query = new URLSearchParams(searchParams)
              query.delete("colorGroup")
              groups.forEach((group) => query.append("colorGroup", group))
              router.push(`${pathname}?${query.toString()}`, { scroll: false })
            }}
          />
        )}
      </LayoutColumn>
    </Layout>
  )
}

export default RefinementList
