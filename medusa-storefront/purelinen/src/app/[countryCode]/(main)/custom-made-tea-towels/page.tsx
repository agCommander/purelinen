import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"
import { LocalizedLink } from "@/components/LocalizedLink"

export const metadata: Metadata = {
  title: "Custom Made Tea Towels",
  description: "Custom made tea towels and linen products",
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

export default function CustomMadeTeaTowelsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-8 md:mb-12">
        <Image
          src="/images/content/custom-made-tea-towels-hero.jpg"
          alt="Custom Made Tea Towels"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <Layout className="pt-30 pb-20 md:pt-47 md:pb-32">
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 11, xl: 10 }}
        >
          <h1 className="text-lg md:text-2xl mb-16 md:mb-25">
            Custom Made Tea Towels
          </h1>
        </LayoutColumn>
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 10, xl: 9 }}
          className="prose prose-lg max-w-none"
        >
          <div className="space-y-6">
            <p className="font-normal text-base md:text-lg">
              HOW TO FAST TRACK A QUOTE FOR A CUSTOM PROJECT
            </p>
            
            <ol className="list-decimal list-outside ml-5 space-y-4 text-base">
              <li className="text-black">
                <p>Provide the quantity of tea towels</p>
              </li>
              <li className="text-black">
                <p>Provide sizes of products</p>
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

            {/* Blank Tea Towels */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">Blank Tea Towels</h2>
              
              <p className="text-base mb-6">
                <strong>Share the Project Details</strong> Let us know a little about your project, plus the fabric, style, quantity and any other details (eg monogramming) of the tea towels you require.
              </p>
              
              {/* Tea Towels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
                <div className="text-center">
                  <div className="mt-4">
                    <img 
                      alt="InStyle Tea Towel" 
                      src="https://purelinen.com.au/media/catalog/product/k/l/kl_instyle_tt_02_800x.jpg" 
                      className="max-w-full h-auto mx-auto"
                      width={250}
                      height={375}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mt-4">
                    <img 
                      alt="InStyle Tea Towel" 
                      src="https://purelinen.com.au/media/catalog/product/k/l/kl_instyle_tt_01_800x.jpg" 
                      className="max-w-full h-auto mx-auto"
                      width={250}
                      height={375}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  {/* Empty column for spacing */}
                </div>
              </div>
              
              {/* Fabric Ideas Section */}
              <div className="my-8">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Some fabric ideas</h2>
                <p className="text-base">
                  For fabric options, please <LocalizedLink href="/fabrics" className="text-black underline hover:no-underline">see our fabric pages</LocalizedLink>.
                </p>
              </div>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
