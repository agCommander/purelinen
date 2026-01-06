"use client"

import { useState, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import ImageGallery from "./image-gallery"
import ProductActions from "./product-actions"
import ProductInfo from "@modules/products/templates/product-info"

type ProductVariantImageHandlerProps = {
  product: HttpTypes.StoreProduct
  materials: {
    id: string
    name: string
    colors: {
      id: string
      name: string
      hex_code: string
    }[]
  }[]
  region: HttpTypes.StoreRegion
  images: HttpTypes.StoreProductImage[]
}

export default function ProductVariantImageHandler({
  product,
  materials,
  region,
  images,
}: ProductVariantImageHandlerProps) {
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | undefined>(undefined)

  // Get variant images if variant is selected and has images
  // Note: variant.images might not be in the TypeScript type but is returned by the API
  const variantImages = useMemo(() => {
    if (!selectedVariant) {
      return undefined
    }
    // Type assertion needed because StoreProductVariant type may not include images
    const variantWithImages = selectedVariant as HttpTypes.StoreProductVariant & { images?: HttpTypes.StoreProductImage[] }
    if (!variantWithImages.images || variantWithImages.images.length === 0) {
      return undefined
    }
    return variantWithImages.images
  }, [selectedVariant])

  return (
    <>
      <ImageGallery 
        images={images} 
        variantId={selectedVariant?.id}
        variantImages={variantImages}
        className="md:hidden" 
      />
      <div className="flex max-lg:flex-col gap-8 xl:gap-27">
        <div className="lg:w-1/2 flex flex-1 flex-col gap-8">
          <ImageGallery 
            images={images} 
            variantId={selectedVariant?.id}
            variantImages={variantImages}
            className="max-md:hidden" 
          />
        </div>
        <div className="sticky flex-1 top-0">
          <ProductInfo product={product} />
          <ProductActions
            product={product}
            materials={materials}
            region={region}
            onVariantChange={setSelectedVariant}
          />
        </div>
      </div>
    </>
  )
}

