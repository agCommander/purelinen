import { HttpTypes } from "@medusajs/types"
import { Layout, LayoutColumn } from "@/components/Layout"
import CollectionPreview from "@modules/collections/components/collection-preview"
import { getCollectionsByTypeValue } from "@lib/data/collections"

export default async function TypeTemplate({
  typeValue,
  countryCode,
}: {
  typeValue: string
  countryCode: string
}) {
  const { collections } = await getCollectionsByTypeValue(typeValue)

  if (!collections || collections.length === 0) {
    return (
      <div className="md:pt-12 py-4 md:pb-6">
        <Layout className="!max-w-none w-full !px-[20px] mb-6 md:mb-6">
          <LayoutColumn>
            <h2 className="text-md md:text-md mb-6 md:mb-7">
              No collections found for {typeValue}
            </h2>
          </LayoutColumn>
        </Layout>
      </div>
    )
  }

  return (
    <div className="md:pt-12 py-4 md:pb-6">
      <Layout className="!max-w-none w-full !px-[24px] mb-6 mt-6 md:mt-6 md:mb-6">
        <LayoutColumn>
          <h2 className="text-md md:text-md mb-6 md:mb-7" id="collections">
            {typeValue} Collections
          </h2>
        </LayoutColumn>
      </Layout>
      <Layout className="!max-w-none w-full !px-[20px] gap-x-[20px] md:!gap-x-[20px] gap-y-10 md:gap-y-6 mb-6">
        {collections.map((collection) => (
          <LayoutColumn key={collection.id} className="md:!col-span-3 !col-span-6">
            <CollectionPreview collection={collection} />
          </LayoutColumn>
        ))}
      </Layout>
      <div className="pb-10 md:pb-20" />
    </div>
  )
}

