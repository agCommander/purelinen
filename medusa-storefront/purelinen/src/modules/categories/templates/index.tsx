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

  // Pass categoryId as a single string (Medusa API expects single string, not array)
  const categoryId = category.id || undefined

  return (
    <div className="md:pt-12 py-4 md:pb-6">
      <Layout className="!max-w-none w-full !px-[20px] mb-6 md:mb-6">
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

