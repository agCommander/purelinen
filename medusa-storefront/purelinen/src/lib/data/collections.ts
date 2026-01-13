import { sdk } from "@lib/config"
import { getProductsList } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export const retrieveCollection = async function (id: string) {
  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next: { tags: ["collections"] },
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const getCollectionsList = async function (
  offset: number = 0,
  limit: number = 100,
  fields?: (keyof HttpTypes.StoreCollection)[]
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.client
    .fetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>("/store/collections", {
      query: { limit, offset, fields: fields ? fields.join(",") : undefined },
      next: { tags: ["collections"] },
      cache: "force-cache",
    })
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async function (
  handle: string,
  fields?: (keyof HttpTypes.StoreCollection)[]
): Promise<HttpTypes.StoreCollection> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: {
        handle,
        fields: fields ? fields.join(",") : undefined,
        limit: 1,
      },
      next: { tags: ["collections"], revalidate: 0 },
      cache: "no-store",
    })
    .then(({ collections }) => collections[0])
}

export const getCollectionsWithProducts = async (
  countryCode: string
): Promise<HttpTypes.StoreCollection[] | null> => {
  const { collections } = await getCollectionsList(0, 3)

  if (!collections) {
    return null
  }

  const collectionIds = collections
    .map((collection) => collection.id)
    .filter(Boolean) as string[]

  const { response } = await getProductsList({
    queryParams: { collection_id: collectionIds },
    countryCode,
  })

  response.products.forEach((product) => {
    const collection = collections.find(
      (collection) => collection.id === product.collection_id
    )

    if (collection) {
      if (!collection.products) {
        collection.products = []
      }

      collection.products.push(product)
    }
  })

  return collections as unknown as HttpTypes.StoreCollection[]
}

export const getCollectionsByTypeValue = async function (
  typeValue: string,
  colorGroups?: string[]
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  const queryParams: Record<string, string | string[]> = {}
  
  if (colorGroups && colorGroups.length > 0) {
    queryParams.colorGroup = colorGroups
  }
  
  const queryString = new URLSearchParams()
  if (colorGroups && colorGroups.length > 0) {
    colorGroups.forEach((group) => queryString.append("colorGroup", group))
  }
  
  const url = `/store/custom/type-collections-by-value/${encodeURIComponent(typeValue)}${queryString.toString() ? `?${queryString.toString()}` : ""}`
  
  return sdk.client
    .fetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>(url, {
      method: "GET",
      next: { tags: ["collections"] },
      cache: "force-cache",
    })
    .then(({ collections, count }) => ({ collections, count }))
}

export const getCollectionsByCategoryId = async function (
  categoryId: string
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.client
    .fetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>(`/store/custom/category-collections/${encodeURIComponent(categoryId)}`, {
      method: "GET",
      next: { tags: ["collections"] },
      cache: "force-cache",
    })
    .then(({ collections, count }) => ({ collections, count }))
}
