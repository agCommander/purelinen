import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

export const getProductsById = async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  const query: any = {
    id: ids,
    region_id: regionId,
    fields: "*variants.calculated_price,+variants.inventory_quantity",
  }
  
  // Add sales_channel_id if available (required when API key has multiple sales channels)
  const salesChannelId = process.env.NEXT_PUBLIC_SALES_CHANNEL_ID
  if (salesChannelId) {
    query.sales_channel_id = salesChannelId
  }
  
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      query,
      next: { tags: ["products"] },
      cache: "force-cache",
    })
    .then(({ products }) => products)
}

export const getProductByHandle = async function (
  handle: string,
  regionId: string
) {
  const query: any = {
    handle,
    region_id: regionId,
    fields: "*variants.calculated_price,+variants.inventory_quantity,*categories,*variants.images",
  }
  
  // Add sales_channel_id if available (required when API key has multiple sales channels)
  const salesChannelId = process.env.NEXT_PUBLIC_SALES_CHANNEL_ID
  if (salesChannelId) {
    query.sales_channel_id = salesChannelId
  }
  
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      query,
      next: { tags: ["products"] },
    })
    .then(({ products }) => products[0])
}

export const getProductFashionDataByHandle = async function (handle: string) {
  try {
    return await sdk.client.fetch<{
      materials: {
        id: string
        name: string
        colors: {
          id: string
          name: string
          hex_code: string
        }[]
      }[]
    }>(`/store/custom/fashion/${handle}`, {
      method: "GET",
      next: { tags: ["products"] },
      cache: "force-cache",
    })
  } catch (error) {
    // Return empty fashion data if endpoint doesn't exist (404) or fails
    // This is a custom endpoint that may not be available for all products
    return {
      materials: [],
    }
  }
}

export const getProductsList = async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> {
  const page = Math.max(1, pageParam || 1)
  const limit = queryParams?.limit || 12
  const offset = (page - 1) * limit
  
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  
  // Get sales channel ID from environment variable if available (optional)
  // Only needed if the publishable API key is associated with multiple sales channels
  const salesChannelId = process.env.NEXT_PUBLIC_SALES_CHANNEL_ID
  
  const finalQuery: any = {
    limit,
    offset,
    region_id: region.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity",
    ...queryParams,
  }
  
  // Add sales_channel_id if explicitly provided (optional - API key should be configured with single channel)
  if (salesChannelId) {
    finalQuery.sales_channel_id = salesChannelId
  }
  
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        query: finalQuery,
        next: { tags: ["products"] },
        cache: "no-store", // Changed to no-store to ensure fresh data after inventory updates
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? page + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
    .catch((error) => {
      console.error('[getProductsList] API error:', error)
      throw error
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const getProductsListWithSort = async function ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
