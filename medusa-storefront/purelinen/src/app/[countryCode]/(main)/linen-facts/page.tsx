import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Linen Facts & Features",
  description: "Learn about the properties and benefits of linen fabric",
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

export default function LinenFactsPage() {
  return (
    <>
      {/* Full-width hero image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] mb-8 md:mb-12">
        <Image
          src="/images/content/linen-facts-hero.jpg"
          alt="Linen Facts & Features"
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
            Linen Facts and Features
          </h1>
        </LayoutColumn>
        <LayoutColumn
          start={{ base: 1, lg: 2, xl: 3 }}
          end={{ base: 13, lg: 10, xl: 9 }}
          className="prose prose-lg max-w-none"
        >
          <div className="space-y-6">
            <p className="text-base">One of the world's oldest fabrics, linen is woven from the fibres of the flax plant and is a completely natural resource – perhaps the most ecologically sound fabric of all.</p>
            
            <ul className="list-disc list-outside ml-5 space-y-4 text-base">
              <li>Whilst only the very best fibres are used by the Linen industry, no part of the flax plant is wasted; the left over linseeds, oil, straw and fibre are used in everything from lino and soap to cattlefeed and paper. Few products are so efficiently used as flax.</li>
              
              <li>The production of linen fabric uses five to twenty times less water and energy than the production of cotton or other synthetic fabrics. Linen fabrics are biodegradable and recyclable.</li>
              
              <li>Linen is available in different qualities varying from almost silk-like to sack-linen. Linen is usually white to ivory, may be washed at 95 deg C and should be ironed when damp. When being washed the first time, linen shrinks, as is the case with most natural fibres.</li>
              
              <li>Due to its one-time common use to make fine fabric, "linens" became the generic term for sheets and pillowcases, although these are now often made of cotton or synthetic fibres.</li>
              
              <li>The characteristic most often associated with linen yarn is the presence of "slubs", or small knots that occur randomly along its length. However, these are actually defects associated with low quality. The finest linen has a very consistent diameter with no slubs.</li>
              
              <li>The standard measure of bulk linen yarn is the lea. A yarn having a size of 1 lea will give 300 yards per pound. The fine yarns used in handkerchiefs, etc., might be 40 lea, and give 40 x 300 = 12000 yards per pound.</li>
              
              <li>Paper for the US dollar is 25% linen and 75% cotton. It is specially made for the Bureau of Engraving and Printing and possession of the blank paper by outsiders is a federal crime.</li>
              
              <li>The word linen is derived from the Latin for the flax plant, which is linum, and the earlier Greek linon.</li>
              
              <li>Linen is one of the world's oldest fabrics. Mummies have been found wrapped in linen shrouds dating as far back as 4500 B.C.</li>
              
              <li>Flax yarns and fabrics increase about 20% in strength on wetting. Linen is also therefore stronger when being washed, resulting in greater longevity than, for example, cotton.</li>
              
              <li>Over time linen textiles become softer and actually improves in comfort.</li>
              
              <li>When linen fabrics are in contact with the skin, the nodes along the length of the fibre absorb perspiration, then swell and release the moisture to the outside air, thus creating a fabric self cooled by evaporation. As a result linen is a popular choice for bedding particularly in hot climates.</li>
              
              <li>Linen is highly hygroscopic as it is capable to rapidly absorb and yield moisture. It evaporates water as quickly as the pond surface. Linen can absorb up to 20% of its own weight in moisture while still feeling dry to the touch. That explains why linen cloth always feels fresh and cool.</li>
              
              <li>Linen is virtually lint free, non-static, non-allergenic, naturally insect-repellent and gives UV protection.</li>
              
              <li>Pure linen damask is the name given to products woven from pure flax yarns in a special manner so that patterns are visible even in an all white cloth.</li>
              
              <li>Linen is woven from the fibres of the flax plant and is a completely natural product. Linen fibre is totally biodegradable and recyclable.</li>
              
              <li>Linen is renowned for its spectacular durability and long life. The tensile strength of linen thread is twice as high as that of cotton and three times that of wool.</li>
              
              <li>The Flax cell is highly compatible with the human cell thereby producing benevolent effects on the human organism.</li>
              
              <li>Flax fabric is an excellent filter protecting against a chemically aggressive medium, noise and dust.</li>
              
              <li>Linen reduces gamma radiation nearly by half and protects the human organism against solar radiation. Flax fibre from contaminated soils appears not to exhibit even small traces of radiation.</li>
              
              <li>Linen underwear possesses rare bacteriological properties. Resistant to fungus and bacteria, it is found to be an effective barrier to some diseases.</li>
              
              <li>According to medical studies conducted in Japan, bed-ridden patients do not develop bedsores where linen bed sheets are used. Wearing linen clothes helps to get rid of some skin diseases - from common rash to chronic eczemas.</li>
              
              <li>Linen does not cause allergic reactions and is helpful in treating a number of allergic disorders.</li>
              
              <li>Linen is effective in dealing with inflammatory conditions, reducing fever and regulating air ventilation, and is also helpful in the treatment of some neurological ailments.</li>
              
              <li>Linen cloth does not accumulate static electricity - even a small blend of flax fibres (up to 10%) to a cloth is enough to eliminate the static electricity effect.</li>
              
              <li>Linen possesses high air permeability and heat conductivity properties. Heat conductivity of linen is five times as high as that of wool and 19 times as that of silk. In hot weather those dressed in linen clothes are found to show the skin temperature 3°-4°C below that of their silk or cotton-wearing friends. According to some studies, a person wearing linen clothes perspires 1.5 times less than when dressed in cotton clothes and twice less than when dressed in viscose clothes. Meanwhile in cold weather linen is an ideal warmth-keeper.</li>
              
              <li>Silica present in the flax fibre protects linen against rotting - the mummies of Egyptian Pharaohs preserved to the present day are wrapped in the finest linen cloth.</li>
              
              <li>For more information, visit <a href="https://en.wikipedia.org/wiki/Linen" target="_blank" rel="noopener noreferrer" className="text-black underline hover:no-underline">the Wikipedia linen pages</a>.</li>
            </ul>
          </div>
        </LayoutColumn>
      </Layout>
    </>
  )
}
