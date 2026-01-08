import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"
import { LocalizedLink } from "@/components/LocalizedLink"

export const metadata: Metadata = {
  title: "Custom Made Aprons",
  description: "Custom made aprons and linen products",
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions.flatMap((r) =>
      r.countries
        ? r.countries
            .map((c) => c.iso_2)
            .filter(
              (value): value is string =>
                typeof value === "string" && Boolean(value)
            )
        : []
    )
  )

  const staticParams = countryCodes.map((countryCode) => ({
    countryCode,
  }))

  return staticParams
}

export default function CustomMadeApronsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[20/13] mb-8 md:mb-2">
        <Image
          src="/images/content/custom-made-aprons-hero.jpg"
          alt="Custom Made Aprons"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <Layout className="pt-30 pb-20 md:pt-6 md:pb-32">
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 11, xl: 10 }}
        >
          <h1 className="text-lg md:text-2xl mb-16 md:mb-8">
            Custom Made Aprons
          </h1>
        </LayoutColumn>
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 10, xl: 9 }}
          className="prose prose-lg max-w-none"
        >
          <div className="space-y-6">
          <p className="text-base md:text-base mb-6">
          Linen aprons add a real earthy touch of class to the ambiance of a cafe, restaurant, winery cellar door, etc ... We understand that. So here at PURE LINEN we offer a custom service to ensure you get that perfect look for your project. As a linen specialist, we have a wide range of linen fabrics. We also have experienced sewing teams in Europe and Australia who are ready and able to deliver top quality aprons to satisfy your needs. Please just call us to talk through what you want and seek our advice, alternatively…
            </p>
          <p className="font-normal text-base md:text-lg">
              HOW TO FAST TRACK A QUOTE FOR A CUSTOM PROJECT
            </p>
            
            <ol className="list-decimal list-outside ml-5 space-y-4 text-base">
              <li className="text-black">
                <p>Provide the quantity of aprons</p>
              </li>
              <li className="text-black">
                <p>Provide sizes of aprons</p>
              </li>
              <li className="text-black">
                <p>Advise colour or share the project details with us and we will help you to select the colour</p>
              </li>
              <li className="text-black">
                <p>If you require a custom-logo, please email us a PDF document of your Artwork and let us know the size of the embroidery, the colour and the location of the logo on the products.</p>
              </li>
              <li className="text-black">
                <p>Provide your Details. Please forward us your contact details, shipping address and telephone number.</p>
              </li>
              <li className="text-black">
                <p>Contact Us. Email us all the information above at <a href="mailto:sales@purelinen.com.au" className="text-black underline hover:no-underline">sales@purelinen.com.au</a> and we will provide you with a quote or call +61 08 94187015 for a consultation.</p>
              </li>
            </ol>

            <div className="space-y-4 my-8">
              <p className="font-bold">PLEASE NOTE: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
            </div>

            {/* Aprons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
              <div className="text-center">
                <LocalizedLink 
                  href="/our-products/kitchen-linens/linen-aprons/edgar-linen-cafe-style-aprons"
                  className="text-black underline hover:no-underline"
                >
                  Edgar Apron without Bib
                </LocalizedLink>
                <div className="mt-4">
                  <img 
                    alt="Edgar Apron no bib" 
                    src="https://purelinen.com.au/media/catalog/product/k/l/kl_edgar_1000_5.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <LocalizedLink 
                  href="/our-products/kitchen-linens/linen-aprons/edgar-apron-with-bib"
                  className="text-black underline hover:no-underline"
                >
                  Edgar Apron with Bib
                </LocalizedLink>
                <div className="mt-4">
                  <img 
                    alt="Edgar Apron with bib" 
                    src="https://purelinen.com.au/media/catalog/product/k/l/kl_edgar_bib_01_1.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <LocalizedLink 
                  href="/our-products/kitchen-linens/linen-aprons/felice-apron-with-bib"
                  className="text-black underline hover:no-underline"
                >
                  Felice Apron with Bib
                </LocalizedLink>
                <div className="mt-4">
                  <img 
                    alt="Felice Apron" 
                    src="https://purelinen.com.au/media/catalog/product/k/l/kl_felice_03.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
            </div>
            
            {/* Dimensions Section */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">Our Apron with Bib Dimensions</h2>
              <div className="flex justify-center">
                <img 
                  alt="Custom Apron Dimensions" 
                  src="https://purelinen.com.au/media/catalog/product/k/l/Apron-Graphic.png" 
                  className="max-w-full h-auto"
                  width={350}
                  height={500}
                />
              </div>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
