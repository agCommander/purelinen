import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Custom Made Runners",
  description: "Custom made runners and linen products",
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

export default function CustomMadeRunnersPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-8 md:mb-12">
        <Image
          src="/images/content/custom-made-runners-hero.jpg"
          alt="Custom Made Runners"
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
            Custom Made Runners
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
                <p>Provide the quantity of tablecloths; runners or placemats or napkins or cocktail napkins or coasters</p>
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
              <p className="font-normal">PLEASE NOTE: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
              <p className="font-normal">PLEASE NOTE 1: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
              <p className="font-normal">PLEASE NOTE 2: When ordering an Oval Shaped tablecloth, we require that you send us a full-scale template. We will not proceed to manufacture without one.</p>
            </div>

            {/* Runner Styles */}
            <div className="my-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <img 
                    alt="runners plain" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/runners01.jpg" 
                    className="max-w-full h-auto mb-4"
                    width={210}
                    height="auto"
                  />
                  <p className="text-center">Runner - Plain</p>
                </div>
                <div className="flex flex-col items-center">
                  <img 
                    alt="runners fringes" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/runners02.jpg" 
                    className="max-w-full h-auto mb-4"
                    width={210}
                    height="auto"
                  />
                  <p className="text-center">Runner - with fringes</p>
                </div>
                <div className="flex flex-col items-center">
                  <img 
                    alt="runners ruffles" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/runners03.jpg" 
                    className="max-w-full h-auto mb-4"
                    width={210}
                    height="auto"
                  />
                  <p className="text-center">Runner - with ruffles</p>
                </div>
              </div>
            </div>

            {/* Size Options */}
            <div className="my-12">
              <p className="font-normal text-lg mb-4">Size Options</p>
              <p>42 x 150; 42 x 180; 42 x 200; 42 x 220; 42 x 250</p>
              <p>50 x 150; 50 x 180; 50 x 200; 50 x 220; 50 x 250</p>
              <p>...or any other custom size.</p>
            </div>

            {/* Example Images */}
            <div className="my-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex justify-center">
                  <img 
                    alt="example" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/runner_01_250x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height="auto"
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="example" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/runner_02_250x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height="auto"
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="example" 
                    src="https://purelinen.com.au/media/catalog/product/n/a/na_bistro_01_800x.jpg" 
                    className="my-5 max-w-full h-auto"
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
