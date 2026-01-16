import { ExecArgs } from "@medusajs/framework/types"

/**
 * Link existing price sets (that have prices) to variants
 * This preserves the migrated prices instead of creating empty price sets
 */
export default async function linkExistingPriceSetsToVariants({ container }: ExecArgs) {
  try {
    console.log("🔗 Linking existing price sets (with prices) to variants...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Get variants without price sets
    const variantsWithoutPriceSets = await client.query(`
      SELECT pv.id, pv.sku, pv.created_at
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND pvps.id IS NULL
      ORDER BY pv.created_at ASC
    `)

    // Get price sets with prices that aren't linked to variants
    const priceSetsWithPrices = await client.query(`
      SELECT ps.id, ps.created_at, COUNT(p.id) as price_count
      FROM price_set ps
      INNER JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
        AND pvps.id IS NULL
      GROUP BY ps.id, ps.created_at
      ORDER BY ps.created_at ASC
    `)

    console.log(`\n📊 Found:`)
    console.log(`   • ${variantsWithoutPriceSets.rows.length} variants without price sets`)
    console.log(`   • ${priceSetsWithPrices.rows.length} price sets with prices but not linked`)

    if (priceSetsWithPrices.rows.length === 0) {
      console.log("\n✅ All price sets with prices are already linked!")
      await client.end()
      return
    }

    // Link by creation order
    const minCount = Math.min(variantsWithoutPriceSets.rows.length, priceSetsWithPrices.rows.length)
    console.log(`\n🔄 Linking ${minCount} variants to existing price sets (with prices)...`)

    let linked = 0
    let skipped = 0

    for (let i = 0; i < minCount; i++) {
      const variant = variantsWithoutPriceSets.rows[i]
      const priceSet = priceSetsWithPrices.rows[i]

      try {
        // Check if variant already has a link (double-check)
        const existingLink = await client.query(`
          SELECT id FROM product_variant_price_set 
          WHERE variant_id = $1 AND deleted_at IS NULL
        `, [variant.id])

        if (existingLink.rows.length > 0) {
          skipped++
          continue
        }

        // Create link
        const linkId = `pvps_${variant.id.replace('variant_', '').slice(0, 20)}_${priceSet.id.replace('pset_', '').slice(0, 10)}`
        await client.query(`
          INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [linkId, variant.id, priceSet.id])

        linked++

        if (linked % 100 === 0) {
          console.log(`   Linked ${linked} variants to price sets with prices...`)
        }
      } catch (error: any) {
        console.log(`   ⚠️  Error linking ${variant.id}: ${error.message}`)
      }
    }

    console.log(`\n✅ Linked ${linked} variants to existing price sets (with prices)`)
    if (skipped > 0) {
      console.log(`   Skipped ${skipped} variants (already had links)`)
    }

    // Check remaining
    const remainingVariants = await client.query(`
      SELECT COUNT(*) 
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND pvps.id IS NULL
    `)
    const remainingPriceSets = await client.query(`
      SELECT COUNT(DISTINCT ps.id)
      FROM price_set ps
      INNER JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
        AND pvps.id IS NULL
    `)

    console.log(`\n📊 Remaining:`)
    console.log(`   • Variants without price sets: ${remainingVariants.rows[0].count}`)
    console.log(`   • Price sets with prices but not linked: ${remainingPriceSets.rows[0].count}`)

    await client.end()

    console.log(`\n💡 Next Steps:`)
    console.log(`   1. Check variants in admin - they should now show prices!`)
    console.log(`   2. Go to Products → [Product] → Variants → [Variant] → Edit → Prices`)
    console.log(`   3. You should see the migrated prices (AUD and USD)`)

  } catch (error: any) {
    console.error("❌ Error linking existing price sets:", error.message)
    console.error(error.stack)
    throw error
  }
}
