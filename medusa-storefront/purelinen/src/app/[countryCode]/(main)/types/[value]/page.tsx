import { Metadata } from "next"
import { notFound } from "next/navigation"
import TypeTemplate from "@modules/types/templates"
import { getProductTypesList } from "@lib/data/product-types"

type Props = {
  params: Promise<{ countryCode: string; value: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { value } = await params
  const productTypes = await getProductTypesList(0, 100, ["id", "value"])
  
  const productType = productTypes?.productTypes.find(
    (pt) => pt.value.toLowerCase() === value.toLowerCase()
  )

  if (!productType) {
    return {
      title: `${value} Collections | Pure Linen`,
    }
  }

  return {
    title: `${productType.value} Collections | Pure Linen`,
    description: `Browse ${productType.value} collections`,
  }
}

export default async function TypePage({ params }: Props) {
  const { value, countryCode } = await params

  // Verify the type exists
  const productTypes = await getProductTypesList(0, 100, ["id", "value"])
  const productType = productTypes?.productTypes.find(
    (pt) => pt.value.toLowerCase() === value.toLowerCase()
  )

  if (!productType) {
    notFound()
  }

  return (
    <TypeTemplate typeValue={productType.value} countryCode={countryCode} />
  )
}

