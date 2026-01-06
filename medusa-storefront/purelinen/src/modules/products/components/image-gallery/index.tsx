"use client"

import { useMemo, useEffect, useState } from "react"
import { ProductPageGallery } from "@/components/ProductPageGallery"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  variantId?: string
  variantImages?: HttpTypes.StoreProductImage[]
  className?: string
}

const ImageGallery = ({ images, variantId, variantImages, className }: ImageGalleryProps) => {
  // Force remount when variant changes by using a counter
  const [remountKey, setRemountKey] = useState(0)
  
  useEffect(() => {
    // Force remount when variantId or variantImages change
    setRemountKey(prev => prev + 1)
  }, [variantId, variantImages])

  // If a variant is selected and has variant-specific images, use those
  // Otherwise, fall back to product images
  const imagesToDisplay = useMemo(() => {
    if (variantId && variantImages && variantImages.length > 0) {
      return variantImages
    }
    return images
  }, [variantId, variantImages, images])
  
  const filteredImages = useMemo(() => {
    return imagesToDisplay.filter((image) => Boolean(image.url))
  }, [imagesToDisplay])
  
  const placeholderPath = "/images/content/placeholder.png"

  // If no images, show placeholder
  if (!filteredImages.length) {
    return (
      <ProductPageGallery key={`placeholder-${remountKey}`} className={className}>
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={placeholderPath}
            alt="Product placeholder"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 589px, (max-width: 1279px) 384px, 456px"
            className="object-cover"
          />
        </div>
      </ProductPageGallery>
    )
  }

  // Use remountKey to force complete remount when variant changes
  const galleryKey = `gallery-${variantId || 'default'}-${remountKey}`

  return (
    <ProductPageGallery 
      key={galleryKey} 
      resetKey={`${variantId || 'default'}-${remountKey}`} 
      className={className}
    >
      {filteredImages.map((image, index) => (
        <div
          key={`${variantId || 'default'}-${image.id}-${index}-${remountKey}`}
          className="relative aspect-[3/4] w-full overflow-hidden"
        >
          <Image
            key={`img-${variantId || 'default'}-${image.id}-${index}-${remountKey}`}
            src={image.url}
            priority={index <= 2 ? true : false}
            alt={`Product image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 589px, (max-width: 1279px) 384px, 456px"
            className="object-cover"
          />
        </div>
      ))}
    </ProductPageGallery>
  )
}

export default ImageGallery
