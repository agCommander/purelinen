import { HttpTypes } from "@medusajs/types"
import CollectionPreview from "@modules/collections/components/collection-preview"
import { LayoutColumn } from "@/components/Layout"

type CollectionGridProps = {
  collections: HttpTypes.StoreCollection[]
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-grayscale-500">No collections found.</p>
      </div>
    )
  }

  return (
    <>
      {collections.map((collection) => (
        <LayoutColumn key={collection.id} className="md:!col-span-3 !col-span-6">
          <CollectionPreview collection={collection} />
        </LayoutColumn>
      ))}
    </>
  )
}

