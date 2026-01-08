import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Custom Made Napkins",
  description: "Custom made napkins and linen products",
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

export default function CustomMadeNapkinsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-8 md:mb-6">
        <Image
          src="/images/content/custom-napkins-hero.jpg"
          alt="Custom Made Napkins"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <Layout className="pt-10 pb-20 md:pt-6 md:pb-32">
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 11, xl: 10 }}
        >
          <h1 className="text-lg md:text-2xl mb-16 md:mb-16">
            Custom Made Napkins
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
                Provide the quantity of napkins 
              </li>
              <li className="text-black">
                Provide sizes of napkins
              </li>
              <li className="text-black">
                Advise colour or share the project details with us and we will help you to select the colour
              </li>
              <li className="text-black">
                If you require a custom-logo, please email us a PDF document of your Artwork and let us know the size of the embroidery, the colour and the location of the logo on the products.
              </li>
              <li className="text-black">
                Provide your Details. Please forward us your contact details, shipping address and telephone number.
              </li>
              <li className="text-black">
                Contact Us. Email us all the information above at <a href="mailto:sales@purelinen.com.au" className="text-black underline hover:no-underline">sales@purelinen.com.au</a> and we will provide you with a quote or call +61 08 94187015 for a consultation.
              </li>
            </ol>

            <div className="space-y-4 my-8">
              <p className="font-bold">PLEASE NOTE: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
            </div>

            {/* Edging Options */}
            <div className="my-12">
              <p className="font-normal text-lg mb-6">Edging Options</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center">
                  <img 
                    alt="Napkin Plain" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/square01.jpg" 
                    className="max-w-full h-auto mb-4"
                    width={100}
                    height={100}
                  />
                  <p className="text-center">Napkin Plain</p>
                </div>
                <div className="flex flex-col items-center">
                  <img 
                    alt="Napkin Fringed" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/napkin02.jpg" 
                    className="max-w-full h-auto mb-4"
                    width={100}
                    height={100}
                  />
                  <p className="text-center">Napkin Fringed</p>
                </div>
                <div className="flex flex-col items-center">
                  <img 
                    alt="Napkin Ruffles" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/napkin03.jpg" 
                    className="max-w-full h-auto mb-4"
                    width={100}
                    height={100}
                  />
                  <p className="text-center">Napkin Ruffles</p>
                </div>
              </div>
            </div>

            {/* Embroidery Placement Options */}
            <div className="my-12">
              <p className="font-normal text-lg mb-6">Embroidery Placement Options</p>
              <div className="flex justify-center">
                <img 
                  alt="Embroidery Placement" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/embroidery-placement.png" 
                  className="max-w-full h-auto"
                  width={300}
                  height={300}
                />
              </div>
            </div>

            {/* Size Options */}
            <div className="my-12">
              <p className="font-normal text-lg mb-4">Size Options</p>
              <p>45 x 45; 50 x 50; 60 x 60</p>
              <p>...or any other custom size.</p>
            </div>

            {/* Example Images */}
            <div className="my-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex justify-center">
                  <img 
                    alt="example" 
                    src="https://purelinen.com.au/media/catalog/product/n/a/na_urban_hero_02.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="example" 
                    src="https://purelinen.com.au/media/catalog/product/n/a/na_monks_hero_01.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="example" 
                    src="https://purelinen.com.au/media/catalog/product/n/a/na_bistro_hero_02.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>
            </div>

            <hr className="my-12 border-grayscale-200" />

            {/* Monogrammed Napkins Examples */}
            <div className="my-12">
              <h1 className="text-2xl md:text-3xl font-normal mb-8">
                Some examples of monogrammed napkins we have made for clients
              </h1>

              {/* First Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_00_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_01_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_02_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>

              {/* Second Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_03_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center"></div>
                <div className="flex justify-center"></div>
              </div>

              {/* Third Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_04_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_05_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_06_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
              </div>

              {/* Style 3 */}
              <h2 className="text-xl md:text-2xl font-normal mb-6">Style 3</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_07_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_08_800x.jpg" 
                    className="my-5 max-w-full h-auto"
                    width={250}
                    height={375}
                  />
                </div>
                <div className="flex justify-center">
                  <img 
                    alt="mon" 
                    src="https://purelinen.com.au/media/wysiwyg/custom/na_monogram_09_800x.jpg" 
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
