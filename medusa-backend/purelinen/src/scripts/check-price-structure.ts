import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Diagnostic script to check price data structure after Magento migration
 * This helps identify why the admin UI might be failing
 */
export default async function checkPriceStructure({ container }: ExecArgs) {
  try {
    console.log("🔍 Checking price data structure...")

    // Try different service names
    let productService: any = null
    try {
      productService = container.resolve(Modules.PRODUCT) as any
    } catch (e) {
      try {
        productService = container.resolve("product") as any
      } catch (e2) {
        productService = container.resolve("productService") as any
      }
    }

    // Get pricing module service to query prices
    const pricingModuleService = container.resolve(Modules.PRICING) as any

    // Get a sample of products with variants
    // Note: In Medusa v2, prices are linked via price_set_id, not directly on variants
    let products: any[] = []
    if (typeof productService.listProducts === 'function') {
      products = await productService.listProducts({}, {
        relations: ["variants"],
        take: 10,
      })
    } else if (typeof productService.list === 'function') {
      products = await productService.list({}, {
        relations: ["variants"],
        take: 10,
      })
    } else {
      throw new Error("Product service doesn't have list or listProducts method")
    }

    // Fetch price_set_id from junction table
    const variantIds = products.flatMap(p => p.variants?.map(v => v.id) || [])
    const priceSetMap = new Map<string, string>() // variant_id -> price_set_id
    
    if (variantIds.length > 0) {
      const { Client } = require('pg')
      const connectionString = process.env.DATABASE_URL
      if (connectionString) {
        try {
          const client = new Client({ connectionString })
          await client.connect()
          
          // Get price_set_id for each variant from junction table
          const links = await client.query(`
            SELECT variant_id, price_set_id
            FROM product_variant_price_set
            WHERE variant_id = ANY($1::text[])
              AND deleted_at IS NULL
          `, [variantIds])
          
          links.rows.forEach((row: any) => {
            priceSetMap.set(row.variant_id, row.price_set_id)
          })
          
          await client.end()
        } catch (e) {
          console.log("⚠️  Could not check junction table:", (e as Error).message)
        }
      }
    }

    // Fetch prices separately using price_set_id from junction table
    const priceSetIds = new Set<string>()
    for (const product of products) {
      for (const variant of product.variants || []) {
        const priceSetId = priceSetMap.get(variant.id)
        if (priceSetId) {
          priceSetIds.add(priceSetId)
        }
      }
    }

    // Get prices for all price sets
    const pricesMap = new Map<string, any[]>()
    if (priceSetIds.size > 0 && pricingModuleService) {
      try {
        const priceSets = await pricingModuleService.listPriceSets({
          id: Array.from(priceSetIds),
        }, {
          relations: ["prices"],
        })
        
        for (const priceSet of priceSets || []) {
          pricesMap.set(priceSet.id, priceSet.prices || [])
        }
      } catch (e) {
        console.log("⚠️  Could not fetch prices from pricing module:", (e as Error).message)
      }
    }

    console.log(`\n📦 Found ${products.length} products to check\n`)

    let variantsWithPrices = 0
    let variantsWithoutPrices = 0
    const priceStructureIssues: string[] = []

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) {
        continue
      }

      for (const variant of product.variants) {
        // Get price_set_id from junction table map
        const priceSetId = priceSetMap.get(variant.id)
        const prices = priceSetId ? pricesMap.get(priceSetId) : []
        
        if (prices && prices.length > 0) {
          variantsWithPrices++
          
          // Check price structure
          for (const price of prices) {
            // Check for required fields
            if (!price.amount && price.amount !== 0) {
              priceStructureIssues.push(
                `Variant ${variant.id} (${variant.sku || 'no SKU'}): Price missing 'amount' field`
              )
            }
            if (!price.currency_code) {
              priceStructureIssues.push(
                `Variant ${variant.id} (${variant.sku || 'no SKU'}): Price missing 'currency_code' field`
              )
            }
            
            // Log price structure for first few
            if (variantsWithPrices <= 3) {
              console.log(`\n💰 Variant: ${variant.id} (${variant.sku || 'no SKU'})`)
              console.log(`   Price Set ID: ${priceSetId}`)
              console.log(`   Price structure:`, JSON.stringify(price, null, 2))
            }
          }
        } else {
          variantsWithoutPrices++
          if (!priceSetId) {
            console.log(`⚠️  Variant ${variant.id} (${variant.sku || 'no SKU'}) has no price_set_id link`)
          } else {
            console.log(`⚠️  Variant ${variant.id} (${variant.sku || 'no SKU'}) has price_set_id (${priceSetId}) but no prices`)
          }
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   • Variants with prices: ${variantsWithPrices}`)
    console.log(`   • Variants without prices: ${variantsWithoutPrices}`)
    
    if (priceStructureIssues.length > 0) {
      console.log(`\n⚠️  Found ${priceStructureIssues.length} price structure issues:`)
      priceStructureIssues.slice(0, 10).forEach(issue => console.log(`   • ${issue}`))
      if (priceStructureIssues.length > 10) {
        console.log(`   ... and ${priceStructureIssues.length - 10} more issues`)
      }
    } else {
      console.log(`\n✅ All checked prices have required fields`)
    }

    // Check price_set relationship
    console.log(`\n🔗 Checking price_set relationships...`)
    const sampleVariant = products[0]?.variants?.[0]
    if (sampleVariant) {
      const samplePriceSetId = priceSetMap.get(sampleVariant.id)
      const samplePrices = samplePriceSetId ? pricesMap.get(samplePriceSetId) : []
      console.log(`   Sample variant ID: ${sampleVariant.id}`)
      console.log(`   Has price_set_id link: ${!!samplePriceSetId}`)
      console.log(`   Price set ID: ${samplePriceSetId || 'N/A'}`)
      console.log(`   Number of prices: ${samplePrices?.length || 0}`)
    }

    console.log(`\n💡 Next Steps:`)
    console.log(`   1. If prices are missing required fields, they may need to be migrated`)
    console.log(`   2. The admin UI error might be due to missing price_set_id on variants`)
    console.log(`   3. Check if variants are properly linked to price_sets`)

  } catch (error: any) {
    console.error("❌ Error checking price structure:", error.message)
    console.error(error.stack)
    throw error
  }
}
