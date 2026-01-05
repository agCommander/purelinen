import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import { collectionMetadataCustomFieldsSchema } from "@lib/util/collections"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { Layout, LayoutColumn } from "@/components/Layout"
import { getCategoriesList } from "@lib/data/categories"
import { getProductTypesList } from "@lib/data/product-types"
import { getRegion } from "@lib/data/regions"

export default async function CollectionTemplate({
  sortBy,
  collection,
  category,
  type,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  category?: string[]
  type?: string[]
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1

  const collectionDetails = collectionMetadataCustomFieldsSchema.safeParse(
    collection.metadata ?? {}
  )

  const [categories, types, region] = await Promise.all([
    getCategoriesList(0, 100, ["id", "name", "handle"]),
    getProductTypesList(0, 100, ["id", "value"]),
    getRegion(countryCode),
  ])

  return (
    <div className="md:pt-12 py-4 md:pb-6">
      {/*<div className="max-md:mt-18 relative aspect-[2/1] md:h-screen w-full max-w-full mb-8 md:mb-19">
        <Image
          src={
            collectionDetails.data?.collection_page_image?.url ||
            "/images/content/living-room-gray-two-seater-puffy-sofa.png"
          }
          fill
          alt={collection.title + " image"}
          className="object-cover z-0"
        />
      </div>*/}
      <Layout className="!max-w-none w-full !px-[24px] mb-6 mt-6 md:mt-6 md:mb-6">
        <LayoutColumn>
          <h2 className="text-md md:text-md mb-6 md:mb-7">{collection.title} COLLECTION</h2>
          {collectionDetails.success &&
            typeof collectionDetails.data.description === "string" &&
            collectionDetails.data.description.length > 0 && (
              <p className="text-xs text-grayscale-500 md:text-md">
                {collectionDetails.data.description}
              </p>
            )}
        </LayoutColumn>
      </Layout>
      {/*<RefinementList
        //sortBy={sortBy}
        //title={collection.title}
        //categories={Object.fromEntries(
        //  categories.product_categories.map((c) => [c.handle, c.name])
        //)}
        //category={category}
        //types={Object.fromEntries(
        //  types.productTypes.map((t) => [t.value, t.value])
        //)}
        type={type}
      />*/}
      <Suspense fallback={<SkeletonProductGrid />}>
        {region && (
          <PaginatedProducts
            sortBy={sortBy}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            categoryId={
              !category
                ? undefined
                : categories.product_categories
                    .filter((c) => category.includes(c.handle))
                    .map((c) => c.id)
            }
            typeId={
              !type
                ? undefined
                : types.productTypes
                    .filter((t) => type.includes(t.value))
                    .map((t) => t.id)
            }
          />
        )}
      </Suspense>
      <div className="pb-10 md:pb-20" />
    </div>
  )
}
