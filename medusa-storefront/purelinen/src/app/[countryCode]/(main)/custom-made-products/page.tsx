import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Custom Made Products",
  description: "Custom made linen products",
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

export default function CustomMadeProductsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] mb-8 md:mb-12">
        <Image
          src="/images/content/custom-products-hero.jpg"
          alt="Custom Made Products"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <Layout className="pt-6 pb-20 md:pt-4 md:pb-32">
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 11, xl: 10 }}
        >
          <h1 className="text-lg md:text-2xl mb-16 md:mb-25">
            Custom Made Products
          </h1>
        </LayoutColumn>
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 10, xl: 9 }}
          className="prose prose-lg max-w-none"
        >
          <div className="space-y-6">
            <p>We know that getting 'just what you want' is very important to you. One of our specialties is making table linen to order.</p>

            <p>Love our linen, but want something uniquely yours? We offer a custom service to the design and hospitality industries. While our vast range includes readymade and made-to-order pieces, please contact us to discuss custom projects and ideas across any of our collections and fabrics. And, if you can't find the fabric you want, then speak with us – we have a huge international network and work with some of the most highly respected mills in the world, so can likely sort the perfect solution for your project. We also love collaborative projects, so feel free to call to discuss any ideas.</p>
            
            <p>We support small and large batch customization</p>
            <p>From raw materials to finished products, a one stop service</p>
            
            <div className="my-8">
              <p className="font-bold text-base md:text-lg mb-4">HOW TO FAST TRACK A QUOTE FOR A CUSTOM PROJECT</p>
              <ol className="list-decimal list-outside ml-5 space-y-4 text-base">
                <li>Provide the quantity of tablecloths; runners or placemats or napkins or cocktail napkins or coasters</li>
                <li>Provide sizes of products</li>
                <li>Advise colour or share the project details with us and we will help you to select the colour</li>
                <li>If you require a custom-logo, please email us a PDF document of your Artwork and let us know the size of the embroidery, the colour and the location of the logo on the products.</li>
                <li>Provide your Details. Please forward us your contact details, shipping address and telephone number.</li>
                <li>Contact Us. Email us all the information above at <a href="mailto:sales@purelinen.com.au" className="text-black underline hover:no-underline">sales@purelinen.com.au</a> and we will provide you with a quote or call +61 08 94187015 for a consultation.</li>
              </ol>
            </div>

            <div className="my-8">
              <p className="font-bold text-base md:text-lg mb-4">THE FABRICS WE OFFER</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base">
                <li>100% Linen</li>
                <li>56% Linen / 44% Polyester</li>
                <li>100% Cotton</li>
              </ul>
            </div>

            <div className="my-8">
              <p className="mb-2">The width of our linens:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base">
                <li>140 cm</li>
                <li>150 cm</li>
                <li>280 cm</li>
                <li>300 cm</li>
              </ul>
            </div>

            <div className="my-8">
              <p className="mb-2">Weight:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base">
                <li>from 118 gsm to 560 gsm</li>
              </ul>
            </div>

            <p>Yarn-Dyed and Plain Dyed</p>
            <p>Colour fastness 3.5</p>
            <p>Pre-shrunk (all our linen fabric are pre-shrunk, except art.902 and 3040)</p>
            
            <div className="my-8">
              <p className="font-bold text-base md:text-lg mb-4">SHRINKAGE 3%-5%</p>
              <p>Please be aware that linen will shrink after washing. Many of our products are pre-shrunk and we generally state that in the product or fabric descriptions. In the case of raw linen you can expect it to shrink up to 8%, so please be sure to allow for that amount of shrinkage if the product you are ordering is made from raw linen. Even the products listed as pre-shrunk can shrink a further 4% after washing.</p>
            </div>

            <div className="my-8">
              <p className="font-bold text-base md:text-lg mb-4">ECO FRIENDLY</p>
              <p>The Fabrics are OEKO-TEX Standard certified and some belongs of Masters of Linens Group</p>
            </div>

            <div className="my-8">
              <p className="font-bold text-base md:text-lg mb-4">SAMPLE DELIVERY</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base">
                <li>Fabric Samples - Free delivery of sample of linen fabric.</li>
                <li>Samples of Finished Products - You can order finished products as a sample (we require a payment for the products + delivery cost)</li>
              </ul>
            </div>

            <p>You can select products from our designs or provide us your design</p>

            <div className="my-8">
              <p className="font-bold text-base md:text-lg mb-4">PRODUCTION TIME</p>
              <p>Production Time: can be 5-7 days for small orders or 2-4 weeks for larger orders</p>
              <p>Urgent orders can be negotiable with 10% surcharge as a rush fee</p>
              <p>We require <strong>50% deposit</strong> for all custom-made projects before we start production</p>
            </div>

            <p className="font-bold">Custom Made products are not refundable and not exchangeable so PLEASE choose your colour, fabric and style very carefully.</p>

            <p>While we can work to any specifications, please click on the links below to view the options and styles we have produced for clients in the past. Of course, if you have something outside of these parameters, please contact us to discuss.</p>

            <div className="my-8 space-y-4">
              <div>
                <LocalizedLink 
                  href="/custom-made-tablecloths"
                  className="inline-block px-6 py-3 bg-black text-white font-bold hover:bg-grayscale-800 transition-colors"
                >
                  VIEW CUSTOM TABLE LINEN OPTIONS & STYLES
                </LocalizedLink>
              </div>
              <div>
                <LocalizedLink 
                  href="/custom-made-linen-curtaina"
                  className="inline-block px-6 py-3 bg-black text-white font-bold hover:bg-grayscale-800 transition-colors"
                >
                  VIEW CUSTOM LINEN CURTAIN OPTIONS & STYLES
                </LocalizedLink>
              </div>
              <div>
                <LocalizedLink 
                  href="/custom-made-kitchen-linen-category"
                  className="inline-block px-6 py-3 bg-black text-white font-bold hover:bg-grayscale-800 transition-colors"
                >
                  VIEW CUSTOM KITCHEN LINEN OPTIONS & STYLES
                </LocalizedLink>
              </div>
              <div>
                <LocalizedLink 
                  href="/custom-made-cushion-covers-category"
                  className="inline-block px-6 py-3 bg-black text-white font-bold hover:bg-grayscale-800 transition-colors"
                >
                  VIEW CUSTOM CUSHION COVER OPTIONS & STYLES
                </LocalizedLink>
              </div>
            </div>

            <hr className="my-12 border-grayscale-200" />
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
