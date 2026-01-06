import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getRegion } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import { getCollectionsByCategoryId } from "@lib/data/collections"
import CollectionGrid from "@modules/categories/components/collection-grid"

export default async function CategoryTemplate({
  category,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1

  const region = await getRegion(countryCode)

  // Pass categoryId as a single string (Medusa API expects single string, not array)
  const categoryId = category.id || undefined

  // Check if category should display collections instead of products
  const displayMode = (category.metadata as any)?.display_mode || "products"
  const shouldShowCollections = displayMode === "collections"

  // Fetch collections if needed
  const collectionsData = shouldShowCollections && categoryId
    ? await getCollectionsByCategoryId(categoryId)
    : null

  return (
    <div className="md:pt-12 py-4 md:pb-6">
      <Layout className="!max-w-none w-full !px-[24px] mb-6 mt-6 md:mt-6 md:mb-6">
        <LayoutColumn>
          <h2 className="text-md md:text-md mb-6 md:mb-7" id="products">
            {category.name}
          </h2>
          {category.description && (
            <div className="mb-8 text-base-regular">
              <p>{category.description}</p>
            </div>
          )}
        </LayoutColumn>
      </Layout>
      {shouldShowCollections ? (
        <Suspense fallback={<SkeletonProductGrid />}>
          <Layout className="!max-w-none w-full !px-[24px]">
            {collectionsData && collectionsData.collections.length > 0 ? (
              <CollectionGrid collections={collectionsData.collections} />
            ) : (
              <div className="text-center py-12">
                <p className="text-grayscale-500">No collections found for this category.</p>
              </div>
            )}
          </Layout>
        </Suspense>
      ) : (
        <Suspense fallback={<SkeletonProductGrid />}>
          {region && categoryId && (
            <PaginatedProducts
              page={pageNumber}
              categoryId={categoryId}
              countryCode={countryCode}
            />
          )}
        </Suspense>
      )}
      <div className="pb-10 md:pb-20" />
    </div>
  )
}

