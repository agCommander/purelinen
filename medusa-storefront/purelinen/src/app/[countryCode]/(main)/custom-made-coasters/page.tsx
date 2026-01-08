import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"
import { LocalizedLink } from "@/components/LocalizedLink"

export const metadata: Metadata = {
  title: "Custom Made Coasters",
  description: "Custom made coasters and linen products",
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

export default function CustomMadeCoastersPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] mb-8 md:mb-6">
        <Image
          src="/images/content/custom-made-coasters-hero.jpg"
          alt="Custom Made Coasters"
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
            Custom Made Coasters
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
                <p>Provide the quantity of coasters</p>
              </li>
              <li className="text-black">
                <p>Provide sizes of coasters</p>
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

            {/* Style 1 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 1</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_01_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_02_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_03_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
              <div className="text-center mb-8">
                <p>Monogrammed with gold centres and pewter borders</p>
                <p>Colours of linen fabric: Natural, Optical White, Black</p>
                <p>Size: 21 x 12 (in the sample photos) - can be made to any size</p>
              </div>
            </div>

            {/* Style 2 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 2</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_04_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_05_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_06_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
              <div className="text-center mb-8">
                <p>Monogrammed with gold centres and pewter borders</p>
                <p>Colours of linen fabric: Natural, Optical White, Black</p>
                <p>Size: 21 x 12 (in the sample photos) - can be made to any size</p>
              </div>
            </div>

            {/* Style 3 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 3</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_07_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_08_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_09_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
              <div className="text-center mb-8">
                <p>Monogrammed with gold centres and pewter borders</p>
                <p>Colours of linen fabric: Natural, Optical White, Black</p>
                <p>Size: 12 x 12 (in the sample photos) - can be made to any size</p>
              </div>
            </div>

            {/* Style 4 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 4</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_10_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_11_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center"></div>
              </div>
              <div className="text-center mb-8">
                <p>Style: Plain</p>
                <p>Colours of linen fabric: Any - <LocalizedLink href="/fabrics" className="text-black underline hover:no-underline">see our fabric pages</LocalizedLink></p>
                <p>Size: 10 x 20 (in the sample photos) - can be made to any size</p>
              </div>
            </div>

            {/* Style 5 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 5</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_12_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_13_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_14_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
              <div className="text-center mb-8">
                <p>Style: Plain with rounded corners</p>
                <p>Colours of linen fabric: Natural, Optical White, Black</p>
                <p>Size: 12 x 12 (in the sample photos) - can be made to any size</p>
              </div>
            </div>

            {/* Style 6 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 6</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_15_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center"></div>
                <div className="flex justify-center"></div>
              </div>
              <div className="text-center mb-8">
                <p>Style: Plain - Square</p>
                <p>Colours of linen fabric: Any - <LocalizedLink href="/fabrics" className="text-black underline hover:no-underline">see our fabric pages</LocalizedLink></p>
                <p>Size: 12 x 12 (in the sample photo)</p>
                <p>but can be made to any size</p>
              </div>
            </div>

            {/* Style 7 */}
            <div className="my-12">
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 7</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_coasters_16_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center"></div>
                <div className="flex justify-center"></div>
              </div>
              <div className="text-center mb-8">
                <p>Style: Plain - Round</p>
                <p>Colours of linen fabric: Any - <LocalizedLink href="/fabrics" className="text-black underline hover:no-underline">see our fabric pages</LocalizedLink></p>
                <p>Size: 12 diameter (in the sample photo)</p>
                <p>but can be made to any size</p>
              </div>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
