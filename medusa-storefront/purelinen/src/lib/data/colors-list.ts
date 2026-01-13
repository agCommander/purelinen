"use server"

import { sdk } from "@lib/config"

/**
 * Server-side function to fetch color filter groups from backend API
 * Returns array of filter groups with a representative hex code for the filter panel
 */
export async function getColorsList(): Promise<
  Array<{
    name: string
    hexCode: string
  }>
> {
  try {
    const response = await sdk.client.fetch<{
      filterGroups: Array<{
        name: string
        hexCode: string
      }>
    }>("/store/custom/colors/filter-groups", {
      next: { tags: ["color-filter-groups"], revalidate: 3600 }, // Cache for 1 hour
      cache: "force-cache",
    })

    return response.filterGroups || []
  } catch (error) {
    console.error("Error fetching color filter groups:", error)
    return []
  }
}
