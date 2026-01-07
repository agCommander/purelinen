import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Shipping and Returns",
  description: "Learn about our shipping and returns policy",
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

export default function ShippingReturnsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[20/10] mb-8">
        <Image
          src="/images/content/returns-hero.jpg"
          alt="Shipping and Returns"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <Layout className="pt-6 pb-20 md:pt-4 md:pb-32">

      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 10, xl: 9 }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">CLAIMS, WARRANT & RETURNS POLICY.</h2>
          
          <p className="text-base">Our returns and warranty policy is listed below. Please read this carefully before purchasing from Pure Linen.</p>
          
          <div className="my-8">
            <h2 className="text-lg md:text-xl font-bold mb-4">"Change of Mind" Refunds Policy</h2>
            
            <p className="text-base mb-2">1. Specific Exclusions</p>
            <p className="text-base mb-4 pl-8">There will be no returning products for replacement or credit under the following circumstances:</p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base">
              <li>Items which were purchased when the product or products were listed on our web site or price list as "ON SALE"</li>
              <li>Products which were made to order - including any <span className="underline">Australian Made</span> products (This includes all Australian Made bed linen sets which includes pillow cases, flat sheets, fitted sheets, doona or duvet covers and bed covers; table linen; home decor items; kitchen linens)</li>
              <li>Any products listed under the Bathroom Linens catalogue - including towels of any type, face washers, back washers and cosmetic sponges</li>
            </ul>
            
            <p className="text-base mt-6 mb-2">2. Special Conditions</p>
            <p className="text-base mb-4 pl-8">The Products listed below are excluded from 'change of mind' returns unless they meet the <span className="underline">General Conditions</span> set out below AND the packaging is unopened and/or the tags are still attached:</p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base">
              <li>Bed Linen items <span className="underline">not Made in Australia</span></li>
            </ul>
          </div>

          <div className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Damaged Goods</h2>
            <p className="text-base mb-4">If you receive a product that appears to have been "Damaged in Transit" - that is, damaged in transit from us to you - you should:-</p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base">
              <li>refuse to accept delivery of the product,</li>
              <li>direct the courier to "Return goods to sender" and</li>
              <li>notify our Customer Service staff immediately</li>
            </ul>
            <p className="text-base mt-4">• Events such as wilful damage, misuse, unauthorised repair or tampering with a product may prevent a product being accepted for return or warranty repair or replacement.</p>
          </div>

          <div className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Returning Product for Replacement</h2>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base">
              <li>A Return Authorization number must be obtained from us before any goods are returned for replacement.</li>
              <li>All costs incurred in returning the product to us for repair, replacement or credit are your responsibility.</li>
              <li>It is your responsibility to ensure that all products are suitably packaged in order to prevent damage during return shipping.</li>
              <li>You must not write on or attach labels to the product being returned.</li>
              <li>We accept no responsibility for goods lost in transit. It is your responsibility to insure them.</li>
              <li>We will not accept goods sent to us as receiver pays.</li>
            </ul>
          </div>

          <div className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Returning Product for Credit</h2>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base">
              <li>Please check the specifications and compatibility of the goods being ordered to ensure they are what you require as we do not supply goods on a trial basis.</li>
              <li>We are happy to advise on the compatibility or suitability of the goods being purchased.</li>
              <li>We cannot, however, guarantee that it will work in your, or suit your situation and we take no responsibility that it will meet your requirements.</li>
              <li>We do not refund or credit for incorrect choice.</li>
              <li>Items that are being returned for credit MUST be unopened in their original undamaged/unmarked packaging, and will incur a restocking fee of a minimum of 10%. NO credit is available for any freight paid.</li>
              <li>No goods will be accepted for refund or credit after 7 days from the date of invoice.</li>
            </ul>
          </div>

          <div className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">General Conditions</h2>
            <p className="text-base mb-4">Return Authorizations are valid for 7 days only, any item sent after the seven days will not be accepted by our returns department.</p>
            <p className="text-base mb-4">In short, to obtain a refund the goods but be in the <span className="underline">same condition as when you received them</span>, but to be more specific ...</p>
            <p className="text-base mb-2">• We reserve the right to refuse any returns that: -</p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base mb-4">
              <li>are incomplete or missing parts; or</li>
              <li>are not returned in their original packaging,</li>
              <li>have been washed; or</li>
              <li>show signs of physical damage to the product or its packaging.</li>
              <li>do not include a valid Return Authorisation Number on the shipping label.</li>
              <li>have an expired Return Authorisation Number.</li>
            </ul>
            <p className="text-base mb-2">• If you receive a product that appears to have been "Damaged in Transit" - that is, damaged in transit from us to you - you should:-</p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-base mb-4">
              <li>refuse to accept delivery of the product,</li>
              <li>direct the courier to "Return goods to sender" and</li>
              <li>notify our Customer Service staff immediately</li>
            </ul>
            <p className="text-base">• Events such as wilful damage, misuse, unauthorised repair or tampering with a product may prevent a product being accepted for return or warranty repair or replacement.</p>
          </div>
        </div>
      </LayoutColumn>
    </Layout>
    </>
  )
}
