import { Metadata } from "next"
import Image from "next/image"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about PURE LINEN",
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

export default function AboutPage() {
  return (
    <>
      <div className="max-md:pt-18">
        <Image
         src="/images/content/CustomMade.jpg" 
          width={2880}
          height={1500}
          alt="Custom Made Linen"  
          className="md:h-screen md:object-cover"
        />
      </div>
      <div className="pt-8 md:pt-26 pb-26 md:pb-36">
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-md max-lg:mb-16 md:text-2xl">
            Welcome to the Home of Quality European Linen in Australia.
            </h3>
          </LayoutColumn>
         {/* <LayoutColumn start={{ base: 1, lg: 8 }} end={{ base: 13, lg: 12 }}> */}
            <div className="mb-16 lg:mb-10 col-span-full">
            <p className="mb-5 lg:mb-1">
              Our high-quality European linens are sought-after by the high-end hospitality industry to the discerning homeowner and specialist companies with linen needs. 
              We pride ourselves on sourcing the very best linens from France, Belgium, Lithuania & Italy. 
              We make to order the majority of our products, while lengths and rolls of fabrics are available to those who wish to produce themselves. 
              We also carry a large range of pre-finished linen products. Our linen products are designed in Australia and crafted by trusted sewing teams in Belgium, France, Italy and Lithuania, while 40% of our ready-made pieces are proudly made in Australia by our experienced teams in Perth. With a passion for linen and a lifetime of using linen products in the bedroom, bathroom, kitchen, living area and more, we know and understand our product. We extend our knowledge and experience to all our clients, so please call or email and we are happy to help and guide you through your choices..
              </p>
 
            </div>
          {/* </LayoutColumn> */}
          <LayoutColumn>
            <Image
              src="/images/content/AboutPL.jpg"
              width={900}
              height={600}
              alt="About PURE LINEN Founder"
              className="mt-26 lg:mt-36 mb-8 lg:mb-26"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
            <h3 className="text-md lg:mb-10 mb-6 md:text-2xl">
            Our Founder</h3>
            </LayoutColumn>
            <div className="mb-16 lg:mb-10 col-span-full">
            <p className="mb-5 lg:mb-1">
            <b>Marina Wiese says</b> “I’m not just selling a product. 
            <br />I am producing something I love. My experience and what I love has become one picture. And I believe in my product; it talks for itself,” she says. 
            <br />“I still get really excited when people buy my product; it means they understand the beauty of this natural fibre and appreciate the resulting folds, touch and patterns as I do.”

            </p>
            </div>
            <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
            <h3 className="text-md lg:mb-10 mb-6 md:text-2xl">
            PURE LINEN & Our Inspiration</h3>
            </LayoutColumn>
            <div className="mb-16 lg:mb-10 col-span-full">
            <p className="mb-5 lg:mb-1">
            WHO WE ARE </p><p>We are a globally sourced, 40% locally made linen wholesaler to the design, retail and hospitality industries of Australia and New Zealand. Founder/director Marina Wiese has researched and sourced the best linens from throughout the world since 2006. It is sold as cut fabric lengths and rolls, plus custom made for bed, table, kitchen and body, so traditional and custom sizes can be ordered. The sewing teams are long-time professionals who have honed their craft over many years and understand the beauty and nuances of natural linens, so transform our fabrics into products with their experience, understanding and passion. PURE LINEN is also now home to the 2015 Gala Gift & Life Instyle Awards Eco Product of the Year (the PLANET EARTH COLLECTION of Stone Washed Belgium Linen for the bed).
            Integrity, honesty, passion and a light touch that accentuates the beauty of natural linen are hallmarks of PURE LINEN products
            </p>
            </div>

          <LayoutColumn start={{ base: 2, lg: 1 }} end={{ base: 12, lg: 7 }}>
            <Image
              src="/images/content/hd_irma_01.jpg"
              width={1000}
              height={1500}
              alt="IRMA"
              className="mb-16 lg:mb-46"
            />
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="mb-6 lg:mb-20 xl:mb-36">
              <p>
              Our Products

              <br /><br />

              <b>Upholstery fabrics:</b> readymade and custom service for soft furnishings, including cushions, curtains, lampshades and more.

              <br /><br /><b>Table linen:</b>  readymade and custom service for domestic and hospitality napery. PURE LINEN also carries a huge range of matching and contrasting tablecloths, napkins, runners and tea towels to suit any home and style. Plus, PURE LINEN supplies commercial linen napery to linen hire companies, event stylists, restaurants, eco-resorts, bistros, cafes and bars. PURE LINEN also offers custom-made tablecloths and napkins to suit your needs.

              <br /><br /><b>Bed linen:</b> PURE LINEN has a wide range of made-to-order bed linen. Choose from a our award-winning Planet Earth collection of stonewashed Belgian linen, to the rustic raw-linen Casablanca bedcover and beautiful colours in our Arctic range of 100% linen bedding. Products include duvet covers, top sheets, fitted sheets and a range of pillowcases. PURE LINEN also works with hospitality clients for special orders.

              <br /><br /><b>Home decor:</b> PURE LINEN offers a range of ready-made cushion covers, throws and curtains. We also offer a custom service for those who want specific sizes, prints or details (embroidery, hemstitch, monograms, etc).

              <br /><br /><b>Extras:</b> Also ask about our screen and hand-printing, embroidery and fashion (women’s and men’s clothing, sleepwear and children’s clothing).

              <br /><br />PURE LINEN is an Australian business. Wholly owned and operated by Australians. The products are either manufactured in Europe by manufacturers who maintain high ethical standards under our PURE LINEN label to our specifications and designs or increasingly, made in Australia by our own sewing teams. To see and feel our products, and for ease of ordering, you’ll find us at the Life InStyle trade fair or you can visit our showroom (by appointment).
              </p>
            </div>
          
          </LayoutColumn>

        <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
            <h3 className="text-md lg:mb-10 mb-6 md:text-2xl">
            Why Choose PURE LINEN?</h3>
            </LayoutColumn>
            <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="mb-6 lg:mb-20 xl:mb-36">
            <p className="mb-5 lg:mb-1">

            <ul>
              <li>Exclusive - PURE LINEN has exclusive rights to Australia and New Zealand from our European manufacturers – all products are made to our design. We can offer you exclusive designs as well, if your order is large enough.</li>

            <li>Eco Friendly - Did you know that linen uses five to twenty times less water and energy than cotton. </li>

            <li>Award Winning - Our suppliers are proud of their commitment to theenvironment – wining awards for their "Ecologically pure and safe production" </li>

            <li>Sell, buy, use and wear our linen with great pride in the knowledge that you are doing “your bit” for the environment!</li>

            <li>Can you imagine the ultimate luxury of sleeping between pure linen sheets; serving dinner on a pure linen table cloth?</li>

            <li>Spoil yourself and your friends and loved ones with classical, classy, environmentally friendly, pure linen.</li>
            </ul>
            </p>
            </div>
          
    </LayoutColumn>
    </Layout>
      
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-md max-lg:mb-6 md:text-2xl">
              Our customers are at the center of everything we do!
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
          <div className="mb-6 lg:mb-20 xl:mb-36">
              <p className="mb-5 lg:mb-9">
                Our team is here to help guide you through the process, offering
                personalised support to ensure that you find exactly what
                you&apos;re looking for.
              </p>
              <p>
                We&apos;re not just selling linens - we&apos;re helping you
                create spaces where you can relax, recharge, and make lasting
                memories. Thank you for choosing PURE LINEN to be a part of
                your home!
              </p>
            </div>
          </LayoutColumn>
        </Layout>
      </div>
    </>
  )
}
