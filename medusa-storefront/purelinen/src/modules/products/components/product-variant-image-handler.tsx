"use client"

import { useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import ImageGallery from "./image-gallery"
import ProductActions from "./product-actions"
import ProductInfo from "@modules/products/templates/product-info"

type ProductImageWithVariant = HttpTypes.StoreProductImage & {
  variant_id?: string | null
}

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
  colorMap: Record<string, string>
}

export default function ProductVariantImageHandler({
  product,
  materials,
  region,
  images,
  colorMap,
}: ProductVariantImageHandlerProps) {
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant | undefined>(undefined)
  const [allProductImages, setAllProductImages] = useState<ProductImageWithVariant[] | undefined>(undefined)
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  // Fetch all product images with variant flags once when component mounts
  useEffect(() => {
    if (!product?.id) {
      return
    }

    setIsLoadingImages(true)
    
    // Fetch all images for this product from the custom endpoint
    sdk.client
      .fetch<{ images: ProductImageWithVariant[] }>(
        `/store/custom/products/${product.id}/images`,
        {
          cache: "no-store",
        }
      )
      .then(({ images: productImagesData }) => {
        if (productImagesData && productImagesData.length > 0) {
          setAllProductImages(productImagesData)
        } else {
          // Fallback to default images if endpoint fails
          setAllProductImages(images.map(img => ({ ...img, variant_id: null })))
        }
      })
      .catch((error) => {
        console.error("Error fetching product images:", error)
        // Fallback to default images if endpoint fails
        setAllProductImages(images.map(img => ({ ...img, variant_id: null })))
      })
      .finally(() => {
        setIsLoadingImages(false)
      })
  }, [product?.id, images])

  // Filter images client-side based on selected variant
  const imagesToDisplay = useMemo(() => {
    if (!allProductImages) {
      // If we haven't loaded images yet, use default images
      return images
    }

    if (!selectedVariant?.id) {
      // No variant selected - show only hero images (variant_id is null)
      return allProductImages
        .filter(img => !img.variant_id)
        .map(({ variant_id, ...img }) => img) // Remove variant_id from output
    }

    // Variant selected - show only images for this variant
    const variantSpecificImages = allProductImages.filter(
      img => img.variant_id === selectedVariant.id
    )

    if (variantSpecificImages.length > 0) {
      // Return variant-specific images without variant_id field
      return variantSpecificImages.map(({ variant_id, ...img }) => img)
    }

    // If no variant-specific images, show hero images as fallback
    return allProductImages
      .filter(img => !img.variant_id)
      .map(({ variant_id, ...img }) => img)
  }, [allProductImages, selectedVariant?.id, images])

  return (
    <>
      <ImageGallery 
        images={imagesToDisplay} 
        variantId={selectedVariant?.id}
        variantImages={undefined}
        className="md:hidden" 
      />
      <div className="flex max-lg:flex-col gap-8 xl:gap-27">
        <div className="lg:w-1/2 flex flex-1 flex-col gap-8">
          <ImageGallery 
            images={imagesToDisplay} 
            variantId={selectedVariant?.id}
            variantImages={undefined}
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
            colorMap={colorMap}
          />
        </div>
      </div>
    </>
  )
}

