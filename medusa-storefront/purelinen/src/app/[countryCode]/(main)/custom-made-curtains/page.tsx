import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"
import { LocalizedLink } from "@/components/LocalizedLink"

export const metadata: Metadata = {
  title: "Custom Made Curtains",
  description: "Custom made curtains and linen products",
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

export default function CustomMadeCurtainsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-8 md:mb-12">
        <Image
          src="/images/content/custom-made-curtains-hero.jpg"
          alt="Custom Made Curtains"
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
            Custom Made Curtains
          </h1>
        </LayoutColumn>
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 10, xl: 9 }}
          className="prose prose-lg max-w-none"
        >
          <div className="space-y-6">
            
            <p className="text-base md:text-base mb-6">
              Curtains are like the jewellery of the home. We understand that. So here at PURE LINEN we offer a custom service to ensure you get that perfect piece to finish off your interior. As a linen specialist, we have a wide range of linen fabrics to act as sheer, block-out or decorative curtains. We also have experienced sewing teams in Europe and Australia who are ready and able to share their expertise in detailing beautifully bespoke curtains for you or your project. Of course, we have lived and breathed linen curtains throughout our lives, so can advise on fabric selections and options. Please just call us to talk through what you want and seek our advice, alternatively…
            </p>
            <p className="font-normal text-base md:text-lg">
              HOW TO FAST TRACK A QUOTE FOR A CUSTOM PROJECT
            </p>
            
            <ol className="list-decimal list-outside ml-5 space-y-4 text-base">
              <li className="text-black">
                <p>Provide the quantity of curtains</p>
              </li>
              <li className="text-black">
                <p>Provide sizes of curtains</p>
              </li>
              <li className="text-black">
                <p>Provide finished sizes of curtains and the finish: Curtain with a <span className="underline">sleeve</span> for the curtain rod or Curtain with <span className="underline">tabs</span> for the curtain rod or Curtain with <span className="underline">ties</span> for the curtain rod</p>
              </li>
              <li className="text-black">
                <p>Advise colour or share the project details with us and we will help you to select the colour</p>
              </li>
              <li className="text-black">
                <p>Provide your Details. Please forward us your contact details, shipping address and telephone number.</p>
              </li>
              <li className="text-black">
                <p>Contact Us. Email us all the information above at <a href="mailto:sales@purelinen.com.au" className="text-black underline hover:no-underline">sales@purelinen.com.au</a> and we will provide you with a quote or call +61 08 94187015 for a consultation.</p>
              </li>
            </ol>

            <div className="space-y-4 my-8">
             <p className="font-bold">PLEASE NOTE 2: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
            </div>

            {/* Curtain Styles */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">Curtain Styles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
                <div className="text-center">
                  <p className="text-base mb-4">
                    Curtain with a <span className="underline">sleeve</span> for the curtain rod
                  </p>
                  <img 
                    alt="Curtain with sleeve" 
                    src="https://purelinen.com.au/media/catalog/product/h/d/image007.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={250}
                    height={375}
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-base mb-4">
                    Curtain with <span className="underline">tabs</span> for the curtain rod
                  </p>
                  <img 
                    alt="Curtain with tabs" 
                    src="https://purelinen.com.au/media/catalog/product/h/d/image008.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={250}
                    height={375}
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-base mb-4">
                    Curtain with <span className="underline">ties</span> for the curtain rod
                  </p>
                  <img 
                    alt="Curtain with ties" 
                    src="https://purelinen.com.au/media/catalog/product/h/d/image009.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
