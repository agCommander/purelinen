import { Metadata } from "next"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "Care Guide",
  description: "How to care for your linen products",
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

export default function CareGuidePage() {
  return (
    <Layout className="pt-30 pb-20 md:pt-47 md:pb-32">
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-lg md:text-2xl mb-16 md:mb-25">
          Care Guide
        </h1>
      </LayoutColumn>
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 10, xl: 9 }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">CARING FOR LINEN.</h1>
          
          <div className="mb-6 space-y-2">
            <h2 className="text-lg md:text-xl font-semibold">
              <a href="#ironing" className="text-black hover:underline">Ironing Tips</a> | <a href="#laundering" className="text-black hover:underline">Laundering Tips</a> | <a href="#storing" className="text-black hover:underline">Storing linen</a> | <a href="#traveling" className="text-black hover:underline">Traveling with linen</a>
            </h2>
            <h2 className="text-lg md:text-xl font-semibold">
              <a href="#drycleaning" className="text-black hover:underline">Dry cleaning linen</a> | <a href="#furnishings" className="text-black hover:underline">Cleaning linen furnishings</a> | <a href="#stains" className="text-black hover:underline">Stain removal chart</a>
            </h2>
          </div>

          <p className="text-base">Given a reasonable amount of care, pure linen will last a lifetime and can be passed from generation to generation.</p>
          
          <p className="text-base">With a minimum amount of proper care, the natural beauty of linen is easily maintained. Linen is the strongest natural fibre known to man, and of all textile fibres is the one which washes best. Linen often becomes a family heirloom as it wears extremely well and is able to maintain its special qualities throughout its long life. The more linen is washed the softer and more luminous it becomes. Provided a few simple rules are followed, linen will remain in pristine condition for years, through normal household use.</p>

          <div id="ironing" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Ironing Tips</h2>
            
            <p className="text-base mb-4">Most people regard ironing as a chore. But ironing linen can become a less onerous task if you do it when the linen is damp. If linen is taken out of the dryer or off the line while still damp and then ironed immediately, the chore ceases to be a chore at all.</p>
            
            <p className="text-base mb-4">Be sure the sole plate of your iron is clean and smooth for quicker and easier ironing.</p>
            <p className="text-base mb-4">If you have a steam iron, check for mineral deposits, which can cause brown spotting.</p>
            <p className="text-base mb-4">Check your ironing board and its cover. For speedy ironing, use well padded boards with smooth heat-reflective covers.</p>
            <p className="text-base mb-4">Begin with dampened linen. Steam ironing dry linen is less effective than dry or steam ironing dampened linens. A professional steamer is the only appliance that provides enough steam to remove wrinkles from heavier linens. The steam from a household iron is just not enough.</p>
            <p className="text-base mb-4">Store linen items in a plastic bag in the refrigerator or freezer from 6 to 24 hours before ironing. This will make them easier to iron and will prevent mildew.</p>
            <p className="text-base mb-4">Use spray starch (if desired) and iron with a steam iron at a medium to hot setting. Starch provides extra crispness, particularly to napkins to be folded into fancy shapes. For a softer look, select spray-on fabric sizing instead. In a pinch, smooth things over with spray-on wrinkle remover.</p>
            <p className="text-base mb-4">Iron on the wrong side first, then on the right side to bring out the sheen, especially damasks and light-colored linens. Iron dark linens on the wrong side only.</p>
            <p className="text-base mb-4">Choose a temperature setting compatible with the fabric weight. Pure linen can withstand the highest temperature setting on your iron. Test an inconspicuous corner first.</p>
            <p className="text-base mb-4">Iron linen until smooth but not dry. Once wrinkles are gone, hang the linen item until it is bone dry.</p>
            <p className="text-base mb-4">When ironing embroidered linen, keep the embroidery stitches rounded and dimensional by pressing item on the wrong side atop a soft towel.</p>
            <p className="text-base mb-4">Use a press cloth to safeguard delicate lace and cutwork. A press cloth also helps to avoid press marks over seams, hems and pockets.</p>
            <p className="text-base mb-4">Place a table next to the ironing board when ironing large tablecloths. Roll finished sections of the cloth over the table rather than letting it pile up under the ironing board.</p>
            <p className="text-base mb-4">Minimize creasing ironed tablecloths by rolling them around a tube or hanging them.</p>
          </div>

          <div id="laundering" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Laundering Linen</h2>
            
            <p className="text-base mb-4">Many people prefer to launder linen, especially table linens, handkerchiefs and bed linen, because the more linen is washed, the softer and more luminous it becomes. Its luminous quality is caused by nodes on the flax fibers, which reflect light. These same people often choose to wash linen articles because they know linen, as a natural fiber, launders beautifully.</p>
            
            <p className="text-base mb-4">Shirts and other garments worn close to the body are easily washed. Freshly washed linen has a naturally clean fragrance and gives one the sense of well-being. In the case of hand or machine washing use a sufficient amount of water since linen is very absorbent.</p>
            
            <p className="text-base mb-4">A variety of drying methods is recommended for linen: line drying, machine drying or rolling in terry towels. Whatever method you use, remember to remove the linen from the line, the dryer or the towels while it is still damp. If linen dries thoroughly, it becomes brittle and takes several hours to recover its natural moisture and full flexibility. (The natural moisture content of linen is between 6-8%. Linen dried beyond this point will re-absorb moisture from the air.)</p>
            
            <div className="my-6">
              <p className="font-bold text-base mb-2">SHRINKAGE</p>
              <p className="text-base">Please be aware that linen will shrink after washing. Many of our products are pre-shrunk and we generally state that in the product or fabric descriptions. In the case of raw linen you can expect it to shrink up to 15%, so please be sure to allow for that amount of shrinkage if the product you are ordering is made from raw linen. Even the products listed as pre-shrunk can shrink a further 4% after washing.</p>
            </div>
            
            <div className="my-6">
              <p className="font-bold text-base mb-2">LAUNDRY TIPS</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base">
                <li>Use pure soap or gentle detergent when laundering linens.</li>
                <li>Soap works best in soft water. (In hard water it forms curds that makes fabrics dingy and stiff).</li>
                <li>Launder any stains when fresh. If allowed to set, stains may be impossible to remove at a later date.</li>
                <li>Use oxygen-type bleaches for white linen, instead of chlorine bleaches which can cause yellowing.</li>
                <li>Select a water temperature between warm to hot, depending on the care instructions.</li>
                <li>Place delicate or fringed linens in a pillowcase before putting them into a washing machine.</li>
                <li>Whether hand or machine washing, be sure to rinse the linen item completely in lots of water to remove all soap, detergent and residual soil. This will help to avoid formation of "age spots" which are caused by oxidation of cellulose (linen's primary component).</li>
                <li>Once rinsing and spinning cycles on a washing machine are complete, either line dry the linen items, lay them flat or hang garments -- all until slightly damp. Avoid wringing out linen before drying.</li>
              </ul>
            </div>
            
            <div className="my-6">
              <p className="font-bold text-base mb-2">DRYING TIPS</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base">
                <li>Never tumble-dry linen as this can over-dry the fibres and makes ironing more difficult. Linen naturally dries quickly anyway.</li>
                <li>To keep white linens white, try drying them in the sun.</li>
              </ul>
            </div>
          </div>

          <div id="storing" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Storing Linen</h2>
            
            <p className="text-base mb-4">Always launder or dry clean linen before storing.</p>
            <p className="text-base mb-4">Soiled linen encourages mildew, so linens must be clean before storing. Ventilation, light and lack of available food discourage mildew growth. If mildew does attack your linens, brush the mold off outdoors to avoid scattering spores in your house. Then soak the linen item in a solution of oxygen bleach and water before laundering. If possible, dry in the sun.</p>
            <p className="text-base mb-4">Be sure to rinse thoroughly all soap and detergent from linen items to avoid formation of "age spots," caused by the oxidation of cellulose, linen's primary component.</p>
            <p className="text-base mb-4">Store in a cool, dry, well-ventilated area.</p>
            <p className="text-base mb-4">Use pure linen, cotton or muslin, not synthetics, as covers or garment bags.</p>
            <p className="text-base mb-4">Use acid-free tissue paper, not regular tissue paper. The acids in regular tissue paper can yellow linen.</p>
            <p className="text-base mb-4">Do not store linens in plastic bags, cedar chests and cardboard boxes. Fumes from petroleum-based polyurethane can rot and streak the fabric. Cedar fumes and the acids in unvarnished wood yellow linen, as does the acid in cardboard.</p>
            <p className="text-base mb-4">When storing for a long time, refold the linen occasionally.</p>
          </div>

          <div id="traveling" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Traveling with Linen</h2>
            
            <p className="text-base mb-4">Iron linen garments before packing for a trip.</p>
            <p className="text-base mb-4">Stuff sleeves and wrap garments with tissue paper. You can use regular tissue paper for packing for travel.</p>
            <p className="text-base mb-4">Cover garments with plastic dry cleaning bags to help prevent wrinkling.</p>
            <p className="text-base mb-4">Fold or hang garments in luggage at the last possible minute. When hanging garments in a garment bag or fold-over luggage, pull arms of jackets and blouses around to the front.</p>
            <p className="text-base mb-4">Unpack and hang up garments as soon as possible upon arrival.</p>
            <p className="text-base mb-4">Use a travel iron to press out any creases that may have developed in travel. Do not try to steam out wrinkles; wrinkles must be pressed out with an iron.</p>
          </div>

          <div id="drycleaning" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Dry Cleaning Linen</h2>
            
            <p className="text-base mb-4">Today, most manufacturers of linen garments and other linen items, especially interior furnishings, recommend dry cleaning. Why, if linen is a natural-fiber fabric and can be washed? Through the ages people have washed linen in streams and boiled linen in pots to get it clean. To dry it, they simply spread the linen out to dry in the sun.</p>
            <p className="text-base mb-4">The underlying reason is not the linen, rather the dyes, finishes, interfacing, lining, buttons, trim and even the thread that may be used in construction, of garments especially. Undyed sanitorized linen launders beautifully, but few things are fashioned out of undyed linen. The added treatments and additions to the fabric complicate the cleaning process. If dry cleaning is the method of cleaning used, it is important to point out spots so the dry cleaner can pretreat the stain correctly.</p>
            <p className="text-base mb-4">If dry cleaning is recommended, choose a dry cleaner who does work on the premises. Ask whether solvents are regularly changed. If white linens turn gray or yellow, it may be an indication that the solvents need to be replaced.</p>
            <p className="text-base mb-4">Probably the most quoted reason for choosing dry cleaning over laundering is that it is easier, and less time-consuming. The decision rests with the consumer if the manufacturer's care label offers the choice of laundering or dry cleaning.</p>
          </div>

          <div id="furnishings" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Cleaning Linen Furnishings</h2>
            
            <div className="my-6">
              <p className="font-semibold text-base mb-2">Draperies</p>
              <p className="text-base mb-4">Dry cleaning is recommended for cleaning draperies. Selecting a reputable dry cleaner, especially one who does the work on site, provides the best opportunity for your draperies to receive a thorough, professional cleaning.</p>
            </div>
            
            <div className="my-6">
              <p className="font-semibold text-base mb-2">Wall coverings</p>
              <p className="text-base mb-4">Keeping linen wall coverings looking clean and fresh can be as simple as an occasional vacuum, using the brushless attachment on your vacuum cleaner. Because linen is anti-static, wall coverings of linen do not attract dust. When staining occasionally occurs, use a good waterless shampoo. Choose cleaning products especially developed for fine fabrics.</p>
            </div>
            
            <div className="my-6">
              <p className="font-semibold text-base mb-2">Upholstery & Carpets</p>
              <p className="text-base mb-4">Dry cleaning is the recommended method for cleaning upholstery and carpets. Word of mouth is one of the best ways to find a reputable, professional dry cleaner in your area.</p>
            </div>
            
            <div className="my-6">
              <p className="font-semibold text-base mb-2">Spot Cleaning Upholstery/Carpeting</p>
              <p className="text-base mb-4">Use a cleaning product specifically for upholstery or carpeting. Be sure to test the product on an inconspicuous area before trying to remove the stain. Carefully read and follow the product's label directions.</p>
            </div>
          </div>

          <div id="stains" className="my-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Linen Stain Removal Chart</h2>
            
            <p className="text-base mb-4">Always follow CARE labels.</p>
            <p className="text-base mb-6">If you are going to launder, follow these instructions for removing stains.</p>
            
            <div className="space-y-6">
              <div>
                <p className="font-bold text-base mb-2">BALLPOINT INK</p>
                <p className="text-base">Hold stain against towel, spray closely from behind with aerosol hair spray. Ink should transfer to towel</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">BEVERAGES</p>
                <p className="text-base">Soak in cool water. Re-wash with stain remover. Launder using chlorine bleach (if safe for fabric) or oxygen bleach.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">BLOOD</p>
                <p className="text-base">Immediately rinse with cool water. For dried stains, soak in warm water with a product containing enzymes. Launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">CANDLE WAX</p>
                <p className="text-base">Scrape off as much as possible with dull side of knife, then iron between absorbent paper, changing paper until wax is absorbed.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">CHOCOLATE</p>
                <p className="text-base">Pre-wash with product containing enzymes in warm water or treat with pre-wash stain remover. Launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">COLLAR, CUFF SOIL</p>
                <p className="text-base">Pre-wash with stain remover, liquid laundry detergent or paste of granular detergent and water. Launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">COSMETICS</p>
                <p className="text-base">Pre-wash with stain remover, liquid laundry detergent or paste of granular detergent and water or rub with bar of soap. Launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">DAIRY PRODUCTS</p>
                <p className="text-base">Soak in a product containing enzymes for at least 30 minutes (hours for aged stains). Launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">DEODORANTS / ANTI-PERSPIRANTS</p>
                <p className="text-base">Pre-treat with liquid laundry detergent. Launder. For heavy stains pre-treat with pre-wash stain remover. Allow to stand 5 to 10 minutes. Launder using an oxygen bleach.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">EGG</p>
                <p className="text-base">Soak in product containing enzymes. Launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">FRUIT JUICE</p>
                <p className="text-base">Rinse with cool water.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">GRASS</p>
                <p className="text-base">Soak in product containing enzymes. If stains persist, launder using a chlorine bleach (if safe for fabric) or oxygen bleach.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">GREASE SPOTS, OIL</p>
                <p className="text-base">Pre-treat with pre-wash stain remover or liquid laundry detergent. For heavy stains, place stain face down on clean paper towels. Apply cleaning agent to back of stain. Replace paper towels under stain frequently. Let dry, rinse and launder using hottest water safe for fabric.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">INK</p>
                <p className="text-base">Use ink eradicator on undyed, untreated linen.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">LEMON, LIME JUICE, VINEGAR</p>
                <p className="text-base">Rinse immediately with cool water.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">LIPSTICK</p>
                <p className="text-base">On pure linen, rub with a little salad oil to dissolve lipstick, then launder to remove oil.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">MEAT JUICE</p>
                <p className="text-base">Rinse with cool, never hot, water.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">MILDEW</p>
                <p className="text-base">Badly mildewed fabrics may be beyond repair. Launder stained item using chlorine bleach, (if safe for fabric). Or soak in oxygen bleach and hot water. Then launder.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">PERSPIRATION</p>
                <p className="text-base">Use pre-wash stain remover or rub with bar of soap. If color of fabric has changed, apply ammonia to fresh stains, white vinegar to old stains and rinse. Launder using hottest water safe for fabric.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">RED WINE</p>
                <p className="text-base">Cover with salt if stain is fresh, then rinse with cool water. If stain has dried, try club soda.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">SCORCH</p>
                <p className="text-base">Treat same as for mildew (listed above).</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">TAR</p>
                <p className="text-base">Scrape residue from fabric. Place stain face down on paper towels. Sponge with cleaning fluid. Replace towels frequently. Launder in hottest water safe for fabric.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">TOMATO</p>
                <p className="text-base">Rinse with cool water.</p>
              </div>
              
              <div>
                <p className="font-bold text-base mb-2">WHITE WINE</p>
                <p className="text-base">Use club soda.</p>
              </div>
            </div>
          </div>

          <hr className="my-12 border-grayscale-200" />
        </div>
      </LayoutColumn>
    </Layout>
  )
}
