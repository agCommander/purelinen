"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
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
  const [variantImages, setVariantImages] = useState<HttpTypes.StoreProductImage[] | undefined>(undefined)
  const [isLoadingVariantImages, setIsLoadingVariantImages] = useState(false)

  // Fetch variant-specific images from custom endpoint when variant is selected
  useEffect(() => {
    if (!selectedVariant?.id) {
      setVariantImages(undefined)
      return
    }

    setIsLoadingVariantImages(true)
    
    // Fetch variant-specific images from custom endpoint
    sdk.client
      .fetch<{ images: HttpTypes.StoreProductImage[] }>(
        `/store/custom/variants/${selectedVariant.id}/images`,
        {
          cache: "no-store",
        }
      )
      .then(({ images: variantImagesData }) => {
        // Only set variant images if there are actually variant-specific images
        // If empty array, set to undefined so hero images are shown
        if (variantImagesData && variantImagesData.length > 0) {
          setVariantImages(variantImagesData)
        } else {
          setVariantImages(undefined)
        }
      })
      .catch((error) => {
        console.error("Error fetching variant images:", error)
        setVariantImages(undefined)
      })
      .finally(() => {
        setIsLoadingVariantImages(false)
      })
  }, [selectedVariant?.id])

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

