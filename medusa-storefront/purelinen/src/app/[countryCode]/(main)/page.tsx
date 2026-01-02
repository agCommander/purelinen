import { Metadata } from "next"
import Image from "next/image"
import { getRegion } from "@lib/data/regions"
import { getProductTypesList } from "@lib/data/product-types"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { CollectionsSection } from "@/components/CollectionsSection"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

const ProductTypesSection: React.FC = async () => {
  const productTypes = await getProductTypesList(0, 20, [
    "id",
    "value",
    "metadata",
  ])

  if (!productTypes) {
    return null
  }

  return (
    <Layout className="mb-26 md:mb-6 max-md:gap-x-2">
      <LayoutColumn>
        <h3 className="text-md md:text-2xl mb-8 md:mb-15">Our products</h3>
      </LayoutColumn>
      {productTypes.productTypes.map((productType, index) => (
        <LayoutColumn
          key={productType.id}
          start={index % 2 === 0 ? 1 : 7}
          end={index % 2 === 0 ? 7 : 13}
        >
          <LocalizedLink href={`/store?type=${productType.value}`}>
            {typeof productType.metadata?.image === "object" &&
              productType.metadata.image &&
              "url" in productType.metadata.image &&
              typeof productType.metadata.image.url === "string" && (
                <Image
                  src={productType.metadata.image.url}
                  width={1200}
                  height={900}
                  alt={productType.value}
                  className="mb-2 md:mb-8"
                />
              )}
            <p className="text-xs md:text-md">{productType.value}</p>
          </LocalizedLink>
        </LayoutColumn>
      ))}
    </Layout>
  )
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <div className="pt-12 md:pt-12">
        <Image
          src="/images/content/home.png"
          width={2880}
          height={1500}
          alt="PURE LINEN PURE LUXURY"
          className="md:h-screen md:object-cover"
        />
      </div>
      <div className="pt-8 pb-6 md:pt-8 md:pb-36">
        <Layout className="mb-26 md:mb12">
          <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
            <h3 className="text-md max-md:mb-6 md:text-2xl">
            Spoil yourself and your friends and loved ones with classical, classy, environmentally friendly, pure linen.
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
            <div className="flex items-center h-full">
              <div className="md:text-md">
                <p>Discover Our Products</p>
                <LocalizedLink href="/store" variant="underline">
                  Explore Now
                </LocalizedLink>
              </div>
            </div>
          </LayoutColumn>
        </Layout>
        {/* <CollectionsSection className="mb-22 md:mb-36" /> */}
        {/* <ProductTypesSection /> */}
        <Layout>
          <LayoutColumn className="col-span-full">
            <h3 className="text-md md:text-2xl mb-8 md:mb-16">
              About PURE LINEN
            </h3>
            <Image
              src="/images/content/frenchmotif.jpg"
              width={1700}
              height={468}
              alt="French Motif"
              className="mb-8 md:mb-16 max-md:aspect-[3/2] max-md:object-cover"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, md: 7 }}>
            <h2 className="text-md md:text-2xl">
              At PURE LINEN, we believe that a linen is the heart of every
              home.
            </h2>
          </LayoutColumn>
          <LayoutColumn
            start={{ base: 1, md: 8 }}
            end={13}
            className="mt-6 md:mt-19"
          >
            <div className="md:text-md">
              <p className="mb-5 md:mb-9">
                We are dedicated to delivering high-quality, thoughtfully
                designed linens that merge comfort and style effortlessly.
              </p>
              <p className="mb-5 md:mb-3">
                Our mission is to transform your home into a sanctuary
                of relaxation and beauty, with products built to last.
              </p>
              <LocalizedLink href="/about" variant="underline">
                Read more about PURE LINEN
              </LocalizedLink>
            </div>
          </LayoutColumn>
        </Layout>
      </div>
    </>
  )
}
