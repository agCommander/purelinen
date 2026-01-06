import React, { Suspense } from "react"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import { collectionMetadataCustomFieldsSchema } from "@lib/util/collections"
import ProductVariantImageHandler from "@modules/products/components/product-variant-image-handler"
import ImageGallery from "@modules/products/components/image-gallery"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { LocalizedLink } from "@/components/LocalizedLink"
import { Layout, LayoutColumn } from "@/components/Layout"
import { Breadcrumbs } from "@/components/Breadcrumbs"

type ProductTemplateProps = {
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
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  materials,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const images = product.images || []
  const hasImages = Boolean(
    product.images &&
      product.images.filter((image) => Boolean(image.url)).length > 0
  )

  const collectionDetails = collectionMetadataCustomFieldsSchema.safeParse(
    product.collection?.metadata ?? {}
  )

  // Build breadcrumbs: Category > Collection > Product
  const breadcrumbItems = []
  
  // Add first category if available
  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0]
    if (category.handle) {
      breadcrumbItems.push({
        label: category.name,
        href: `/categories/${category.handle}`,
      })
    }
  }
  
  // Add collection if available
  if (product.collection?.handle) {
    breadcrumbItems.push({
      label: `${product.collection.title} Collection`,
      href: `/collections/${product.collection.handle}`,
    })
  }
  
  // Add current product (not a link)
  breadcrumbItems.push({
    label: product.title,
  })

  return (
    <div
      className="pt-18 md:pt-26 lg:pt-37 pb-26 md:pb-36"
      data-testid="product-container"
    >
      <Layout>
        <LayoutColumn className="mb-26 md:mb-52">
          <Breadcrumbs items={breadcrumbItems} className="mb-6 md:mb-8" />
          <ProductVariantImageHandler
            product={product}
            materials={materials}
            region={region}
            images={images}
          />
        </LayoutColumn>
      </Layout>
      {collectionDetails.success &&
        ((typeof collectionDetails.data.product_page_heading === "string" &&
          collectionDetails.data.product_page_heading.length > 0) ||
          typeof collectionDetails.data.product_page_image?.url ===
            "string") && (
          <Layout>
            <LayoutColumn>
              {typeof collectionDetails.data.product_page_heading ===
                "string" &&
                collectionDetails.data.product_page_heading.length > 0 && (
                  <h2 className="text-md md:text-2xl mb-8">
                    {collectionDetails.data.product_page_heading}
                  </h2>
                )}
              {typeof collectionDetails.data.product_page_image?.url ===
                "string" && (
                <div className="relative mb-8 md:mb-20 aspect-[3/2]">
                  <Image
                    src={collectionDetails.data.product_page_image.url}
                    alt="Collection product page image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </LayoutColumn>
          </Layout>
        )}
      {collectionDetails.success &&
        collectionDetails.data.product_page_wide_image &&
        typeof collectionDetails.data.product_page_wide_image.url ===
          "string" && (
          <div className="relative mb-8 md:mb-20 aspect-[3/2] md:aspect-[7/3]">
            <Image
              src={collectionDetails.data.product_page_wide_image.url}
              alt="Collection product page wide image"
              fill
              className="object-cover"
            />
          </div>
        )}
      {collectionDetails.success &&
        (typeof collectionDetails.data.product_page_cta_image?.url ===
          "string" ||
          (typeof collectionDetails.data.product_page_cta_heading ===
            "string" &&
            collectionDetails.data.product_page_cta_heading.length > 0) ||
          (typeof collectionDetails.data.product_page_cta_link === "string" &&
            collectionDetails.data.product_page_cta_link.length > 0)) && (
          <Layout>
            {typeof collectionDetails.data.product_page_cta_image?.url ===
              "string" && (
              <LayoutColumn start={1} end={{ base: 10, md: 6 }}>
                <div className="relative aspect-[3/4]">
                  <Image
                    src={collectionDetails.data.product_page_cta_image.url}
                    fill
                    alt="Collection product page CTA image"
                  />
                </div>
              </LayoutColumn>
            )}
            {((typeof collectionDetails.data.product_page_cta_heading ===
              "string" &&
              collectionDetails.data.product_page_cta_heading.length > 0) ||
              (typeof collectionDetails.data.product_page_cta_link ===
                "string" &&
                collectionDetails.data.product_page_cta_link.length > 0)) && (
              <LayoutColumn start={{ base: 1, md: 7 }} end={13}>
                {typeof collectionDetails.data.product_page_cta_heading ===
                  "string" &&
                  collectionDetails.data.product_page_cta_heading.length >
                    0 && (
                    <h3 className="text-md md:text-2xl my-8 md:mt-20">
                      {collectionDetails.data.product_page_cta_heading}
                    </h3>
                  )}
                {typeof collectionDetails.data.product_page_cta_link ===
                  "string" &&
                  collectionDetails.data.product_page_cta_link.length > 0 &&
                  typeof product.collection?.handle === "string" && (
                    <p className="text-base md:text-md">
                      <LocalizedLink
                        href={`/collections/${product.collection.handle}`}
                        variant="underline"
                      >
                        {collectionDetails.data.product_page_cta_link}
                      </LocalizedLink>
                    </p>
                  )}
              </LayoutColumn>
            )}
          </Layout>
        )}

      <Suspense fallback={<SkeletonRelatedProducts />}>
        <RelatedProducts product={product} countryCode={countryCode} />
      </Suspense>
    </div>
  )
}

export default ProductTemplate
