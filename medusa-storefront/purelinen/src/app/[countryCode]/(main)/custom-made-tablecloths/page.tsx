import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "Custom Tablecloths",
  description: "Custom made tablecloths and linen products",
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

export default function CustomTableclothsPage() {
  return (
    <Layout className="pt-30 pb-20 md:pt-47 md:pb-32">
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-lg md:text-2xl mb-16 md:mb-25">
          Custom Tablecloths
        </h1>
      </LayoutColumn>
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 10, xl: 9 }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6">
          <p className="font-bold text-base md:text-lg">
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
            <p className="font-bold">PLEASE NOTE: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
            <p className="font-bold">PLEASE NOTE 1: Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>
            <p className="font-bold">PLEASE NOTE 2: When ordering an Oval Shaped tablecloth, we require that you send us a full-scale template. We will not proceed to manufacture without one.</p>
          </div>

          {/* Section 1: Side Borders */}
          <div className="w-full my-12">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
              Round, Oval, Square or Rectangular with side borders
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/na_custom_tc-side-borders_01.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/na_custom_tc-side-borders_04.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/na_custom_tc-side-borders_03.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
            </div>

            <h4 className="text-center text-sm md:text-base mb-8">
              Images above – Hand-made in Perth WA from art.876 Pearl Blue & BISTRO. Napkins in optical white made in Lithuania (any size to order)
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
              <div className="flex justify-center">
                <img 
                  alt="Round with border" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/round03.jpg" 
                  className="max-w-full h-auto"
                  width={180}
                  height={180}
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="Oval with Border" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/oval03.jpg" 
                  className="max-w-full h-auto"
                  width={240}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="Square or Rectangle 3 piece" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/square04.jpg" 
                  className="max-w-full h-auto"
                  width={180}
                  height={180}
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="square stitched" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/square03.jpg" 
                  className="max-w-full h-auto"
                  width={180}
                  height="auto"
                />
              </div>
            </div>
          </div>

          <hr className="my-12 border-grayscale-200" />

          {/* Section 2: 4 Piece Cross-Stitched */}
          <div className="w-full my-12">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
              Round, Oval, Square or Rectangular with 4 piece cross-stitched
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/na_custom_tc-4-piece_01.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/na_custom_tc-4-piece_02.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
              <div className="flex justify-center"></div>
            </div>

            <h4 className="text-center text-sm md:text-base mb-8">
              Images above – Hand-made in Perth WA from art.876 Arctic Blue & BISTRO. Napkins in optical white made in Lithuania (any size to order)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="flex flex-col items-center">
                <img 
                  alt="Round with stitches" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/round02.jpg" 
                  className="max-w-full h-auto mb-4"
                  width={210}
                  height={210}
                />
                <img 
                  alt="Round with stitches" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/round06.jpg" 
                  className="max-w-full h-auto"
                  width={210}
                  height={210}
                />
                <p className="text-center mt-4 text-sm">
                  Large round tablecloths can be<br />made using 3 runs of fabric.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img 
                  alt="Oval stitched" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/oval02.jpg" 
                  className="max-w-full h-auto mb-4"
                  width={300}
                  height="auto"
                />
                <img 
                  alt="Oval stitched" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/oval05.png" 
                  className="max-w-full h-auto"
                  width={300}
                  height="auto"
                />
                <p className="text-center mt-4 text-sm">
                  Large oval tablecloths can be<br />made using 3 runs of fabric.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img 
                  alt="square stitched" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/square02.png" 
                  className="max-w-full h-auto mb-4"
                  width={180}
                  height={180}
                />
                <img 
                  alt="square stitched" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/square05.png" 
                  className="max-w-full h-auto"
                  width={180}
                  height={180}
                />
                <p className="text-center mt-4 text-sm">
                  Large square/rectangular tablecloths can be<br />made using 3 runs of fabric.
                </p>
              </div>
            </div>
          </div>

          <hr className="my-12 border-grayscale-200" />

          {/* Section 3: Plain Style */}
          <div className="w-full my-12">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
              Round, Oval, Square or Rectangular - plain style
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/catalog/product/n/a/na_urban_hero_03_1.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/catalog/product/n/a/na_bistro_hero_02.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="" 
                  src="https://purelinen.com.au/media/catalog/product/n/a/na_ecoplanet_hero_01.jpg" 
                  className="my-5 max-w-full h-auto"
                  width={250}
                  height="auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="flex justify-center">
                <img 
                  alt="Round tablecloth - one piece" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/round01.jpg" 
                  className="max-w-full h-auto"
                  width={210}
                  height={210}
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="Plain oval" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/oval01.jpg" 
                  className="max-w-full h-auto"
                  width={300}
                  height="auto"
                />
              </div>
              <div className="flex justify-center">
                <img 
                  alt="squareplain" 
                  src="https://purelinen.com.au/media/wysiwyg/custom/square01.jpg" 
                  className="max-w-full h-auto"
                  width={180}
                  height="auto"
                />
              </div>
            </div>
          </div>

          <hr className="my-12 border-grayscale-200" />
        </div>
      </LayoutColumn>
    </Layout>
  )
}
