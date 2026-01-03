import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, getCategoriesList } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    type?: string | string[]
    page?: string
    sortBy?: SortOptions
  }>
}

export async function generateStaticParams() {
  const categories = await getCategoriesList(0, 100, ["handle"])

  if (!categories || !categories.product_categories) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const categoryHandles = categories.product_categories
    .map((category) => category.handle)
    .filter(Boolean) as string[]

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params

  try {
    const response = await getCategoryByHandle([handle])
    const category = response.product_categories?.[0]

    if (!category) {
      notFound()
    }

    return {
      title: `${category.name} | PURE LINEN`,
      description: category.description || `${category.name} category`,
    } as Metadata
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { handle, countryCode } = await params
  const { page } = await searchParams

  const response = await getCategoryByHandle([handle])
  const category = response.product_categories?.[0]

  if (!category) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={category}
      page={page}
      countryCode={countryCode}
    />
  )
}

