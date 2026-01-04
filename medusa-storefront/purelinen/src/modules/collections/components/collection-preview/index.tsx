import { HttpTypes } from "@medusajs/types"
import { LocalizedLink } from "@/components/LocalizedLink"
import Image from "next/image"

export default function CollectionPreview({
  collection,
}: {
  collection: HttpTypes.StoreCollection
}) {
  const imageUrl =
    typeof collection.metadata?.image === "object" &&
    collection.metadata.image &&
    "url" in collection.metadata.image &&
    typeof collection.metadata.image.url === "string"
      ? collection.metadata.image.url
      : "/images/content/placeholder.png"

  return (
    <LocalizedLink href={`/collections/${collection.handle}`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden mb-4 md:mb-6">
        <Image
          src={imageUrl}
          alt={collection.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="max-md:text-xs">
        <p className="mb-1">{collection.title}</p>
        {typeof collection.metadata?.description === "string" &&
          collection.metadata.description.length > 0 && (
            <p className="text-grayscale-500 text-xs max-md:hidden">
              {collection.metadata.description}
            </p>
          )}
      </div>
    </LocalizedLink>
  )
}

