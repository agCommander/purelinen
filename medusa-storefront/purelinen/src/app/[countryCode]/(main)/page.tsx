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
          <LocalizedLink href={`/types/${productType.value}`}>
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
      {/* First 2 images section */}
      <div className="pt-12 md:pt-12">
        <div className="flex flex-col md:flex-row gap-0">
          <div className="w-full md:w-1/2 relative group">
            <a href="/categories/placeholder-hero-category-1" className="block">
              <Image
                src="/images/content/home/home-1.jpg"
                width={1440}
                height={1500}
                alt="Bistro Table Linen"
                className="w-full h-full md:h-screen object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 text-left">
                <p className="text-xs md:text-xs font-normal">Bistro Table Linen</p>
              </div>
            </a>
          </div>
          <div className="w-full md:w-1/2 relative group">
            <a href="/au/products/bl-cas-bc" className="block">
              <Image
                src="/images/content/home/home-2.jpg"
                width={1440}
                height={1500}
                alt="Casablanca Bed Cover"
                className="w-full h-full md:h-screen object-cover ml-[2px]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 text-left">
                <p className="text-xs md:text-xs font-normal">Casablanca Bed Cover</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      {/* 4 images section 1*/}
      <div className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[2px]">
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/bedroom.jpg"
                  alt="Product 1"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">BED LINEN</h2>
                  <p>PURE LINEN bed linen will change the mood of your rooms instantly. 
                    It exudes quality - feels and looks unlike anything else around. 
                    Made from top-notch eco French flax and Belgian linens, it&rsquo;s weighty, robust and for keeps.</p>
                </div>
                <a 
                  href="/au/types/Bedroom" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/table-linen.jpg"
                  alt="Product 2"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">TABLE LINEN</h2>
                  <p>Modern, trendy, simple, cool, casual, formal, traditional, outdoor, indoor, special occasion. 
                    PURE LINEN has table linen for every situation, every home and for the hospitality industry.</p>
                </div>
                <a 
                  href="/au/types/Table Linen" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/home-decor.jpg"
                  alt="Product 3"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">LINEN THROWS</h2>
                  <p>PURE LINEN throws come in various sizes and are perfect for the sofa, table, bed and beach&hellip; 
                    They are versatile enough to wrap around yourself or drape over your favourite chair. A definite must for all seasons..</p>
                </div>
                <a 
                  href="/au/categories/throws" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/cushions.jpg"
                  alt="Product 4"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">LINEN CUSHION COVERS</h2>
                  <p>PURE LINEN has linen cushion covers in both casual and formal styles. 
                    From raw eco-natural linens to embroidered styles on very high quality fabrics to give your decor a classy edge.</p>
                </div>
                <a 
                  href="/au/categories/cushion-covers" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
       {/* 4 images section 2*/}
       <div className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[2px]">
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/tea-towels.jpg"
                  alt="Product 5"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">LINEN TEA TOWELS</h2>
                  <p>Classy, formal and every-day linen tea towels to liven-up any kitchen. A great range and great prices</p>
                </div>
                <a 
                  href="/au/categories/tea-towels" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/aprons.jpg"
                  alt="Product 6"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">LINEN APRONS</h2>
                  <p>PURE LINEN's classy "cafe" style aprons, with or without bibs. Home, cafe, bistro, restaurant - all ideal homes for these great looking aprons</p>
                </div>
                <a 
                  href="/au/categories/aprons" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/bathroom.jpg"
                  alt="Product 7"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">BATHROOM LINENS</h2>
                  <p>PURE LINEN 100% linen bathroom hand towels! Once you've tried linen towels you're hooked. They don't just look fabulous, the feel is amazing.</p>
                </div>
                <a 
                  href="/au/types/Bathroom" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
          <div className="w-full relative group">
            <div className="relative aspect-[2/3]">
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src="/images/content/home/fabrics.jpg"
                  alt="Product 8"
                  className="object-contain"
                  fill
                />
              </div>
              {/* Overlay with text and button - appears on hover */}
              <div className="absolute inset-0 bg-grayscale-800 flex flex-col items-center justify-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm md:text-base mb-4 text-center">
                  <h2 className="text-base md:text-lg font-medium mb-2">LINEN FABRICS</h2>
                  <p>Linen fabrics are PURE LINEN's specialty. 
                    We supply manufacturers of clothing, furniture and home wares and fashion designers, retailers, interior designers and decorators. 
                    Our colours and styles of fabrics are virtually unlimited.</p>
                </div>
                <a 
                  href="/au/types/Fabrics" 
                  className="bg-black text-white px-6 py-3 text-xs md:text-sm font-medium hover:bg-grayscale-900 transition-colors"
                >
                  VIEW PRODUCTS
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Final 2 images section */}
      <div className="pt-0">
        <div className="flex flex-col md:flex-row gap-0">
          <div className="w-full md:w-1/2 relative group">
            <a href="/store?type=placeholder-5" className="block">
              <Image
                src="/images/content/home/home-3.jpg"
                width={1440}
                height={1500}
                alt="Product 5"
                className="w-full h-full md:h-screen object-cover mr-[2px] mt-[2px]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 text-left">
                <p className="text-xs md:text-xs font-normal">Product Name 5</p>
              </div>
            </a>
          </div>
          <div className="w-full md:w-1/2 relative group">
            <a href="/store?type=placeholder-6" className="block">
              <Image
                src="/images/content/home/home-4.jpg"
                width={1440}
                height={1500}
                alt="Product 6"
                className="w-full h-full md:h-screen object-cover ml-[2px] mt-[2px]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 text-left">
                <p className="text-xs md:text-xs font-normal">Product Name 6</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
