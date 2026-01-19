import { ExecArgs } from "@medusajs/framework/types"

/**
 * Check where Price List pricing is stored
 */
export default async function checkPriceListStorage({ container }: ExecArgs) {
  try {
    console.log("🔍 Checking Price List pricing storage...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Check price table structure
    console.log("\n📊 Price table structure:")
    const priceColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'price'
        AND column_name IN ('id', 'price_set_id', 'price_list_id', 'amount', 'currency_code', 'raw_amount')
      ORDER BY ordinal_position
    `)
    priceColumns.rows.forEach((row: any) => {
      console.log(`   • ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })

    // Check price_list table
    console.log("\n📋 Price List table:")
    const priceListColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'price_list'
      ORDER BY ordinal_position
      LIMIT 15
    `)
    console.log(`   Columns: ${priceListColumns.rows.map((r: any) => r.column_name).join(', ')}`)

    // Count base prices vs Price List prices
    console.log("\n💰 Price storage breakdown:")
    const basePrices = await client.query(`
      SELECT COUNT(*) as count
      FROM price 
      WHERE deleted_at IS NULL 
        AND price_list_id IS NULL
    `)
    const priceListPrices = await client.query(`
      SELECT COUNT(*) as count
      FROM price 
      WHERE deleted_at IS NULL 
        AND price_list_id IS NOT NULL
    `)
    
    console.log(`   • Base prices (price_list_id IS NULL): ${basePrices.rows[0].count}`)
    console.log(`   • Price List prices (price_list_id IS NOT NULL): ${priceListPrices.rows[0].count}`)

    // Show how Price List prices are linked
    console.log("\n🔗 Price List pricing structure:")
    const priceListPriceSample = await client.query(`
      SELECT 
        p.id as price_id,
        p.price_list_id,
        pl.name as price_list_name,
        p.price_set_id,
        p.currency_code,
        p.amount,
        pvps.variant_id
      FROM price p
      LEFT JOIN price_list pl ON pl.id = p.price_list_id
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = p.price_set_id AND pvps.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
        AND p.price_list_id IS NOT NULL
      LIMIT 5
    `)

    if (priceListPriceSample.rows.length > 0) {
      console.log("\n   Sample Price List prices:")
      priceListPriceSample.rows.forEach((row: any) => {
        console.log(`\n   Price: ${row.price_id}`)
        console.log(`   • Price List: ${row.price_list_name} (${row.price_list_id})`)
        console.log(`   • Price Set: ${row.price_set_id}`)
        console.log(`   • Variant: ${row.variant_id || 'N/A'}`)
        console.log(`   • Amount: ${row.amount} ${row.currency_code}`)
      })
    } else {
      console.log("\n   No Price List prices found yet")
      console.log("   When you create Price Lists and add prices, they'll be stored here")
    }

    // Explain the relationship
    console.log("\n💡 How Price List pricing works:")
    console.log("\n   1. Base Prices:")
    console.log("      • Stored in: price table")
    console.log("      • price_list_id: NULL")
    console.log("      • Linked to variant via: price_set_id → product_variant_price_set → variant_id")
    console.log("\n   2. Price List Prices:")
    console.log("      • Stored in: price table (same table!)")
    console.log("      • price_list_id: [price_list_id]")
    console.log("      • Linked to variant via: price_set_id → product_variant_price_set → variant_id")
    console.log("      • Also linked to Price List via: price_list_id → price_list.id")
    console.log("\n   3. Price Resolution:")
    console.log("      • Medusa checks Price List prices first (if active)")
    console.log("      • Falls back to base prices if no Price List price exists")
    console.log("      • Multiple Price Lists can have prices for the same variant")

    await client.end()

  } catch (error: any) {
    console.error("❌ Error checking Price List storage:", error.message)
    console.error(error.stack)
    throw error
  }
}
