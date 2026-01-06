import { HttpTypes } from "@medusajs/types"
import CollectionPreview from "@modules/collections/components/collection-preview"

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
    <ul className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
      {collections.map((collection) => (
        <li key={collection.id}>
          <CollectionPreview collection={collection} />
        </li>
      ))}
    </ul>
  )
}

