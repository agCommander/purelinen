"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { IS_PURELINEN } from "@lib/config/site-config"
import { useCustomer } from "hooks/customer"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { data: customer } = useCustomer()

  // For Pure Linen, check if customer is logged in
  if (IS_PURELINEN && !customer) {
    // Not logged in - don't show prices for Pure Linen
    return (
      <div className="text-sm text-grayscale-500 mb-8">
        <a href="/auth/login" className="underline">
          Login to view prices
        </a>
      </div>
    )
  }

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-grayscale-50 animate-pulse" />
  }

  // Check if this is a discount (from Linen Things price list) vs wholesale (Pure Linen price list)
  // Only show as discount if it's from Linen Things price list, not Pure Linen
  // For Pure Linen, wholesale prices should not show as discounts even if they're lower than base
  const isDiscount = 
    selectedPrice.price_type === 'sale' && // Price list type
    selectedPrice.calculated_price_number < (selectedPrice.original_price_number ?? 0) &&
    !IS_PURELINEN // Only show discounts for Linen Things, not Pure Linen wholesale prices

  if (isDiscount && variant) {
    return (
      <div>
        <p className="text-sm mb-1 text-grayscale-500 line-through">
          {selectedPrice.original_price}
        </p>
        <p className="text-md mb-8 text-red-primary">
          {selectedPrice.calculated_price}
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="text-md mb-8">
        {!variant && "From "}
        {selectedPrice.calculated_price}
      </p>
    </>
  )
}
