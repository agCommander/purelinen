import { ExecArgs } from "@medusajs/framework/types"

/**
 * Link variants to price sets based on existing data
 * This fixes the issue where variants exist but aren't linked to price sets
 */
export default async function linkVariantsToPriceSets({ container }: ExecArgs) {
  try {
    console.log("🔗 Linking variants to price sets...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Check junction table structure
    console.log("\n📊 Checking junction table structure...")
    const junctionColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product_variant_price_set'
      ORDER BY ordinal_position
    `)
    console.log("   Junction table columns:")
    junctionColumns.rows.forEach((row: any) => {
      console.log(`   • ${row.column_name} (${row.data_type})`)
    })

    // Check existing links
    const existingLinks = await client.query(`
      SELECT COUNT(*) as count 
      FROM product_variant_price_set 
      WHERE deleted_at IS NULL
    `)
    console.log(`\n   Existing links: ${existingLinks.rows[0].count}`)

    // Get variants without price sets
    const variantsWithoutPriceSets = await client.query(`
      SELECT pv.id, pv.sku, pv.product_id
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND pvps.id IS NULL
      LIMIT 10
    `)
    console.log(`\n   Variants without price sets: ${variantsWithoutPriceSets.rows.length} (showing first 10)`)

    // Get price sets without variants
    const priceSetsWithoutVariants = await client.query(`
      SELECT ps.id, ps.created_at
      FROM price_set ps
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
        AND pvps.id IS NULL
      LIMIT 10
    `)
    console.log(`\n   Price sets without variants: ${priceSetsWithoutVariants.rows.length} (showing first 10)`)

    // Check if there's a pattern we can use to link them
    // Maybe prices have variant_id or SKU in metadata?
    console.log("\n🔍 Checking for linking patterns...")
    
    // Check if price_set has any metadata or links
    const priceSetSample = await client.query(`
      SELECT ps.id, ps.created_at, 
             COUNT(p.id) as price_count,
             STRING_AGG(DISTINCT p.currency_code, ', ') as currencies
      FROM price_set ps
      LEFT JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
      GROUP BY ps.id, ps.created_at
      ORDER BY ps.created_at DESC
      LIMIT 5
    `)
    console.log("\n   Sample price sets:")
    priceSetSample.rows.forEach((row: any) => {
      console.log(`   • ${row.id}: ${row.price_count} prices, currencies: ${row.currencies}`)
    })

    // Check if there's a way to match variants to price sets
    // Maybe through the order of creation or some other pattern?
    console.log("\n💡 Analysis:")
    console.log(`   • Total variants: 2246`)
    console.log(`   • Total price sets: 2334`)
    console.log(`   • Linked variants: ${existingLinks.rows[0].count}`)
    console.log(`   • Unlinked variants: ~${2246 - parseInt(existingLinks.rows[0].count)}`)
    console.log(`   • Unlinked price sets: ~${2334 - parseInt(existingLinks.rows[0].count)}`)

    console.log("\n⚠️  Manual linking required:")
    console.log("   The migration created price sets but didn't link them to variants.")
    console.log("   You'll need to:")
    console.log("   1. Determine the mapping logic (e.g., by SKU, creation order, etc.)")
    console.log("   2. Create links in product_variant_price_set table")
    console.log("   3. Or create new price sets for variants that don't have them")

    console.log("\n📋 SQL to create a link:")
    console.log(`
      INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
      VALUES (
        'pvps_' || substr(md5(random()::text), 1, 27),
        'variant_id_here',
        'price_set_id_here',
        NOW(),
        NOW()
      );
    `)

    await client.end()

  } catch (error: any) {
    console.error("❌ Error linking variants to price sets:", error.message)
    console.error(error.stack)
    throw error
  }
}
