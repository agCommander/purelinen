import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { CategoriesSlider } from "@modules/store/components/categories-slider"

import { getCollectionsList } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"
import { getProductTypesList } from "@lib/data/product-types"
import { getColorFilterGroups } from "@lib/data/color-groups"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getRegion } from "@lib/data/regions"

const StoreTemplate = async ({
  sortBy,
  collection,
  category,
  productType,
  colorGroup,
  page,
  countryCode,  
}: {
  sortBy?: SortOptions
  collection?: string[]
  category?: string[]
  productType?: string
  colorGroup?: string[]
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page, 10) : 1

  const [collections, categories, productTypes, colorFilterGroups, region] = await Promise.all([
    getCollectionsList(0, 100, ["id", "title", "handle"]),
    getCategoriesList(0, 100, ["id", "name", "handle", "metadata"]),
    getProductTypesList(0, 100, ["id", "value"]),
    getColorFilterGroups(),
    getRegion(countryCode),
  ])

  return (
    <div className="md:pt-47 py-26 md:pb-36">
      <RefinementList
        collections={Object.fromEntries(
          collections.collections.map((c) => [c.handle, c.title])
        )}
        collection={collection}
        categories={Object.fromEntries(
          categories.product_categories.map((c) => [c.handle, c.name])
        )}
        category={category}
        types={Object.fromEntries(
          productTypes.productTypes.map((t) => [t.value, t.value])
        )}
        colorFilterGroups={colorFilterGroups}
        sortBy={sortBy} 
      />
      <CategoriesSlider />
      <Suspense fallback={<SkeletonProductGrid />}>
        {region && (
          <PaginatedProducts
            sortBy={sortBy}
            page={pageNumber}
            countryCode={countryCode}
            collectionId={
              !collection
                ? undefined
                : collections.collections
                    .filter((c) => collection.includes(c.handle))
                    .map((c) => c.id)
            }
            categoryId={
              !category
                ? undefined
                : categories.product_categories
                    .filter((c) => category.includes(c.handle))
                    .map((c) => c.id)
            }
           
          />
        )}
      </Suspense>
    </div>
  )
}

export default StoreTemplate
