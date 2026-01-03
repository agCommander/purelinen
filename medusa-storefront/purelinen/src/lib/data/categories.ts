import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export const listCategories = async function () {
  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: { fields: "+category_children" },
        next: { tags: ["categories"] },
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoriesList = async function (
  offset: number = 0,
  limit: number = 100,
  fields?: (keyof HttpTypes.StoreProductCategory)[]
) {
  return sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    query: {
      limit,
      offset,
      fields: fields ? fields.join(",") : undefined,
    },
    next: { tags: ["categories"] },
    cache: "force-cache",
  })
}

export const getCategoryByHandle = async function (categoryHandle: string[]) {
  // Join array handles with "/" for nested categories, or use first element for single handle
  const handle = categoryHandle.length === 1 ? categoryHandle[0] : categoryHandle.join("/")
  
  return sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
    `/store/product-categories`,
    {
      query: { 
        handle: handle,
        fields: "id,name,handle,description,metadata"
      },
      next: { tags: ["categories"] },
      cache: "force-cache",
    }
  )
}
