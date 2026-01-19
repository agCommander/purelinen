import { ExecArgs } from "@medusajs/framework/types"

/**
 * Check where the 2334 migrated prices are located
 */
export default async function checkMigratedPrices({ container }: ExecArgs) {
  try {
    console.log("🔍 Checking migrated prices...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Count prices
    const totalPrices = await client.query(`SELECT COUNT(*) FROM price WHERE deleted_at IS NULL`)
    console.log(`\n📊 Total prices: ${totalPrices.rows[0].count}`)

    // Check how many are base prices vs Price List prices
    const basePrices = await client.query(`
      SELECT COUNT(*) 
      FROM price 
      WHERE deleted_at IS NULL 
        AND price_list_id IS NULL
    `)
    const priceListPrices = await client.query(`
      SELECT COUNT(*) 
      FROM price 
      WHERE deleted_at IS NULL 
        AND price_list_id IS NOT NULL
    `)
    
    console.log(`   • Base prices (no price_list_id): ${basePrices.rows[0].count}`)
    console.log(`   • Price List prices: ${priceListPrices.rows[0].count}`)

    // Check which price_sets have prices
    const priceSetsWithPrices = await client.query(`
      SELECT ps.id, COUNT(p.id) as price_count,
             STRING_AGG(DISTINCT p.currency_code, ', ') as currencies,
             STRING_AGG(DISTINCT p.price_list_id::text, ', ') FILTER (WHERE p.price_list_id IS NOT NULL) as price_list_ids
      FROM price_set ps
      LEFT JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
      GROUP BY ps.id
      HAVING COUNT(p.id) > 0
      ORDER BY price_count DESC
      LIMIT 10
    `)
    
    console.log(`\n💰 Sample price sets with prices:`)
    priceSetsWithPrices.rows.forEach((row: any) => {
      const isBasePrice = !row.price_list_ids || row.price_list_ids === ''
      console.log(`   • ${row.id}:`)
      console.log(`     - ${row.price_count} prices`)
      console.log(`     - Currencies: ${row.currencies || 'none'}`)
      console.log(`     - Type: ${isBasePrice ? 'Base Price' : 'Price List Price'}`)
      if (!isBasePrice) {
        console.log(`     - Price List IDs: ${row.price_list_ids}`)
      }
    })

    // Check how many price_sets with prices are linked to variants
    const priceSetsLinkedToVariants = await client.query(`
      SELECT COUNT(DISTINCT pvps.price_set_id) as linked_count
      FROM product_variant_price_set pvps
      INNER JOIN price_set ps ON ps.id = pvps.price_set_id
      INNER JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      WHERE pvps.deleted_at IS NULL
        AND ps.deleted_at IS NULL
    `)
    
    const priceSetsNotLinked = await client.query(`
      SELECT COUNT(DISTINCT ps.id) as unlinked_count
      FROM price_set ps
      INNER JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
        AND pvps.id IS NULL
    `)

    console.log(`\n🔗 Price Set Links:`)
    console.log(`   • Price sets with prices AND linked to variants: ${priceSetsLinkedToVariants.rows[0].linked_count}`)
    console.log(`   • Price sets with prices but NOT linked to variants: ${priceSetsNotLinked.rows[0].unlinked_count}`)

    // Check sample prices
    console.log(`\n📋 Sample price records:`)
    const samplePrices = await client.query(`
      SELECT p.id, p.currency_code, p.amount, p.price_set_id, p.price_list_id,
             ps.id as price_set_exists,
             pvps.variant_id
      FROM price p
      LEFT JOIN price_set ps ON ps.id = p.price_set_id
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = p.price_set_id AND pvps.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT 5
    `)
    
    samplePrices.rows.forEach((row: any) => {
      console.log(`\n   Price: ${row.id}`)
      console.log(`   • Amount: ${row.amount} ${row.currency_code}`)
      console.log(`   • Price Set: ${row.price_set_id}`)
      console.log(`   • Price List: ${row.price_list_id || 'None (Base Price)'}`)
      console.log(`   • Linked to Variant: ${row.variant_id || 'No'}`)
    })

    // Check if prices are visible in admin
    console.log(`\n💡 Where to find prices in Admin:`)
    console.log(`   1. Base Prices (no price_list_id):`)
    console.log(`      • Go to Products → [Product] → Variants → [Variant] → Edit`)
    console.log(`      • Click on "Prices" tab`)
    console.log(`      • These are the base prices for the variant`)
    console.log(`\n   2. Price List Prices:`)
    console.log(`      • Go to Pricing → Price Lists → [Price List]`)
    console.log(`      • Click on "Prices" tab`)
    console.log(`      • These override base prices when the Price List is active`)

    await client.end()

  } catch (error: any) {
    console.error("❌ Error checking migrated prices:", error.message)
    console.error(error.stack)
    throw error
  }
}
