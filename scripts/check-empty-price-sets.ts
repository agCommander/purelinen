import { ExecArgs } from "@medusajs/framework/types"

/**
 * Check for price sets that have no prices
 * These can cause "Cannot read properties of undefined (reading 'reduce')" errors
 */
export default async function checkEmptyPriceSets({ container }: ExecArgs) {
  try {
    console.log("🔍 Checking for empty price sets...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Find price sets with no prices
    const emptyPriceSets = await client.query(`
      SELECT 
        ps.id as price_set_id,
        COUNT(pvps.variant_id) as variant_count,
        COUNT(p.id) as price_count
      FROM price_set ps
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
      GROUP BY ps.id
      HAVING COUNT(p.id) = 0
      ORDER BY COUNT(pvps.variant_id) DESC
      LIMIT 50
    `)

    console.log(`\n📊 Found ${emptyPriceSets.rows.length} price sets with no prices`)
    
    if (emptyPriceSets.rows.length > 0) {
      console.log("\n⚠️  These price sets are linked to variants but have no prices:")
      emptyPriceSets.rows.slice(0, 10).forEach((row: any) => {
        console.log(`   • Price Set ${row.price_set_id}: ${row.variant_count} variant(s), 0 prices`)
      })
      if (emptyPriceSets.rows.length > 10) {
        console.log(`   ... and ${emptyPriceSets.rows.length - 10} more`)
      }
      
      console.log("\n💡 To fix this:")
      console.log("   1. Add at least one price to each price set via the admin UI")
      console.log("   2. Or run a script to add default prices to empty price sets")
    } else {
      console.log("\n✅ All price sets have at least one price!")
    }

    await client.end()

  } catch (error: any) {
    console.error("❌ Error checking empty price sets:", error.message)
    console.error(error.stack)
    throw error
  }
}
