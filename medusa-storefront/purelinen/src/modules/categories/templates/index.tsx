import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getRegion } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

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

  // Ensure categoryId is passed as an array (PaginatedProducts expects string | string[])
  const categoryId = category.id ? [category.id] : undefined

  // Debug: Log category info (server-side, check terminal/backend logs)
  console.log('[CategoryTemplate Server] Category:', {
    id: category.id,
    name: category.name,
    handle: category.handle,
    categoryId: categoryId
  })

  return (
    <div className="md:pt-12 py-4 md:pb-6">
      <Layout className="mb-6 md:mb-8">
        <LayoutColumn>
          <h2 className="text-md md:text-2xl mb-6 md:mb-7" id="products">
            {category.name}
          </h2>
          {/* Temporary debug info - remove after debugging */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-yellow-100 text-xs">
              Debug: Category ID = {category.id || 'MISSING'}, CategoryId Array = {JSON.stringify(categoryId)}
            </div>
          )}
          {category.description && (
            <div className="mb-8 text-base-regular">
              <p>{category.description}</p>
            </div>
          )}
        </LayoutColumn>
      </Layout>
      <Suspense fallback={<SkeletonProductGrid />}>
        {region && categoryId && (
          <PaginatedProducts
            page={pageNumber}
            categoryId={categoryId}
            countryCode={countryCode}
          />
        )}
      </Suspense>
      <div className="pb-10 md:pb-20" />
    </div>
  )
}

