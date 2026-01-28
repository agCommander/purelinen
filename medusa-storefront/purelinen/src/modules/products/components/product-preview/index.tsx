"use client"

import { HttpTypes } from "@medusajs/types"
import { LocalizedLink } from "@/components/LocalizedLink"
import Thumbnail from "@modules/products/components/thumbnail"
import { getProductPrice } from "@lib/util/get-product-price"
import { IS_PURELINEN } from "@lib/config/site-config"
import { useCustomer } from "hooks/customer"

export default function ProductPreview({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { data: customer } = useCustomer()
  
  // For Pure Linen, hide prices if not logged in
  const shouldShowPrice = !IS_PURELINEN || (IS_PURELINEN && !!customer)
  
  const { cheapestPrice } = getProductPrice({
    product: product,
  })

  // Only show as discount if it's from Linen Things price list, not Pure Linen wholesale
  const hasReducedPrice =
    cheapestPrice &&
    cheapestPrice.calculated_price_number <
      (cheapestPrice?.original_price_number || 0) &&
    !IS_PURELINEN // Don't show Pure Linen wholesale prices as discounts

  return (
    <LocalizedLink href={`/products/${product.handle}`}>
      <Thumbnail
        thumbnail={product.thumbnail}
        images={product.images}
        size="square"
        className="mb-4 md:mb-6"
      />
      <div className="flex justify-between max-md:flex-col">
        <div className="max-md:text-xs">
          <p className="mb-1">{product.title}</p>
          {product.collection && (
            <p className="text-grayscale-500 text-xs max-md:hidden">
              {product.collection.title}
            </p>
          )}
        </div>
        {shouldShowPrice && cheapestPrice ? (
          hasReducedPrice ? (
            <div>
              <p className="font-semibold max-md:text-xs text-red-primary">
                {cheapestPrice.calculated_price}
              </p>
              <p className="max-md:text-xs text-grayscale-500 line-through">
                {cheapestPrice.original_price}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold max-md:text-xs">
                {cheapestPrice.calculated_price}
              </p>
            </div>
          )
        ) : !shouldShowPrice ? (
          <div className="text-xs text-grayscale-500"> 
            {/* prefer nothing here instead of login to view prices */}
          </div>
        ) : null}
      </div>
    </LocalizedLink>
  )
}
