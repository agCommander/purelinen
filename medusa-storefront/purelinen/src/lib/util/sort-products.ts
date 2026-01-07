import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
  _position?: number
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @param positions Optional map of product IDs to their position values
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions,
  positions?: Record<string, number>
): HttpTypes.StoreProduct[] {
  const sortedProducts = products as MinPricedProduct[]

  // Apply position sorting first if positions are provided
  if (positions) {
    sortedProducts.forEach((product) => {
      product._position = positions[product.id] ?? 999999 // High number for products without position
    })

    // Sort by position first (lower numbers first), then by other criteria
    sortedProducts.sort((a, b) => {
      const positionDiff = (a._position ?? 999999) - (b._position ?? 999999)
      if (positionDiff !== 0) {
        return positionDiff
      }
      // If positions are equal, fall through to other sorting
      return 0
    })
  }

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute the minimum price for each product
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product._minPrice = Math.min(
          ...product.variants.map(
            (variant) => variant?.calculated_price?.calculated_amount || 0
          )
        )
      } else {
        product._minPrice = Infinity
      }
    })

    // Sort products based on the precomputed minimum prices
    // But respect position order if positions were set
    sortedProducts.sort((a, b) => {
      // If positions are set and different, maintain position order
      if (positions && a._position !== undefined && b._position !== undefined) {
        const positionDiff = a._position - b._position
        if (positionDiff !== 0) {
          return positionDiff
        }
      }
      
      // Otherwise sort by price
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      // If positions are set and different, maintain position order
      if (positions && a._position !== undefined && b._position !== undefined) {
        const positionDiff = a._position - b._position
        if (positionDiff !== 0) {
          return positionDiff
        }
      }
      
      // Otherwise sort by created_at
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  return sortedProducts
}
