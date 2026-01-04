import * as React from "react"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { twMerge } from "tailwind-merge"

type ThumbnailProps = {
  thumbnail?: HttpTypes.StoreProduct["thumbnail"]
  images?: HttpTypes.StoreProduct["images"]
  size?: "small" | "medium" | "large" | "full" | "square" | "3/4"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <div
      className={twMerge(
        "relative w-full overflow-hidden",
        className,
        isFeatured && "aspect-[11/14]",
        !isFeatured && size !== "square" && size !== "3/4" && "aspect-[9/16]",
        size === "square" && "aspect-[1/1]",
        size === "3/4" && "aspect-[3/4]",
        size === "small" && "w-[180px]",
        size === "medium" && "w-[290px]",
        size === "large" && "w-[440px]",
        size === "full" && "w-full"
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} />
    </div>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
}: Pick<ThumbnailProps, "size"> & { image?: string }) => {
  const placeholderPath = "/images/content/placeholder.png"
  const imageSrc = image || placeholderPath

  return (
    <Image
      src={imageSrc}
      alt="Thumbnail"
      className="absolute inset-0 object-cover object-center"
      draggable={false}
      quality={50}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  )
}

export default Thumbnail
