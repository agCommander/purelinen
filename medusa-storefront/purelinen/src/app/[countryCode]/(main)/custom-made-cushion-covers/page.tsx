import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"
import { LocalizedLink } from "@/components/LocalizedLink"

export const metadata: Metadata = {
  title: "Custom Made Cushion Covers",
  description: "Custom made cushion covers and linen products",
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

export default function CustomMadeCushionCoversPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-8 md:mb-12">
        <Image
          src="/images/content/custom-made-cushions-hero.jpg"
          alt="Custom Made Cushion Covers"
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
            Custom Made Cushion Covers
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
                <p>Provide the quantity of cushion covers</p>
              </li>
              <li className="text-black">
                <p>Provide sizes of cushion covers</p>
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
              <p className="font-bold">PLEASE NOTE: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
            </div>

            {/* Cushion Styles */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">Cushion Styles</h2>
              
              {/* Style Diagrams */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <img 
                    alt="Plain cushion" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/hd_squareplain.png" 
                    className="max-w-full h-auto mx-auto mb-4"
                    width={220}
                    height={220}
                  />
                  <p className="text-base">Cushion - Plain</p>
                </div>
                
                <div className="text-center">
                  <img 
                    alt="Cushion with piping" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/hd_squarewithpiping.png" 
                    className="max-w-full h-auto mx-auto mb-4"
                    width={220}
                    height={220}
                  />
                  <p className="text-base">Cushion - with piping</p>
                </div>
                
                <div className="text-center">
                  <img 
                    alt="Cushion with flanges" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/hd_squarewithflange.png" 
                    className="max-w-full h-auto mx-auto mb-4"
                    width={220}
                    height={220}
                  />
                  <p className="text-base">Cushion - with flanges</p>
                </div>
                
                <div className="text-center">
                  <img 
                    alt="Cushion with fringes" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/hd_squarewithfringe.png" 
                    className="max-w-full h-auto mx-auto mb-4"
                    width={220}
                    height={220}
                  />
                  <p className="text-base">Cushion - with fringes</p>
                </div>
              </div>
              
              {/* Style Examples */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <img 
                    alt="Plain cushion example" 
                    src="https://purelinen.com.au/media/catalog/product/h/d/hd_cushoins-palin.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={220}
                    height={220}
                  />
                </div>
                
                <div className="text-center">
                  <img 
                    alt="Cushion with piping example" 
                    src="https://purelinen.com.au/media/catalog/product/h/d/hd_cushions-piping.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={220}
                    height={220}
                  />
                </div>
                
                <div className="text-center">
                  <img 
                    alt="Cushion with flanges example" 
                    src="https://purelinen.com.au/media/catalog/product/h/d/hd_cushions-flanges.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={220}
                    height={220}
                  />
                </div>
                
                <div className="text-center">
                  <img 
                    alt="Cushion with fringes example" 
                    src="https://purelinen.com.au/media/catalog/product/b/l/bl_monks_02_1.jpg" 
                    className="max-w-full h-auto mx-auto"
                    width={220}
                    height={220}
                  />
                </div>
              </div>
            </div>
            
            {/* Size Options */}
            <div className="my-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Size Options</h2>
              <p className="text-base">45 x 45; 50 x 50; 60 x 60 or any other sizes.</p>
            </div>
            
            {/* Fabric Ideas */}
            <div className="my-8">
              <h2 id="fabric" className="text-xl md:text-2xl font-semibold mb-4">Some fabric ideas</h2>
              <p className="text-base">
                For fabric options, please <LocalizedLink href="/fabrics" className="text-black underline hover:no-underline">see our fabric pages</LocalizedLink>.
              </p>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
