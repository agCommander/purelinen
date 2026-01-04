import { getProductsListWithSort } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { useInfiniteQuery } from "@tanstack/react-query"

export const useStoreProducts = ({
  page,
  queryParams,
  sortBy,
  countryCode,
}: {
  page: number
  queryParams: HttpTypes.StoreProductListParams
  sortBy: SortOptions | undefined
  countryCode: string
}) => {
  const query = useInfiniteQuery({
    initialPageParam: page,
    queryKey: ["products", queryParams, sortBy, countryCode],
    queryFn: async ({ pageParam }) => {
      return await getProductsListWithSort({
        page: pageParam,
        queryParams,
        sortBy,
        countryCode,
      })
    },
    getNextPageParam: (lastPage: {
      response: { products: HttpTypes.StoreProduct[]; count: number }
      nextPage: number | null
      queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
    }) => {
      if (!lastPage.nextPage) {
        return undefined
      }
      return (
        Math.ceil(lastPage.nextPage / (lastPage.queryParams?.limit || 12)) + 1
      )
    },
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    gcTime: 1000 * 60 * 5, // Keep inactive queries in cache for 5 minutes
  })
  
  return query
}
