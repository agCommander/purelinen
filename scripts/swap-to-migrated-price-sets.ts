import { ExecArgs } from "@medusajs/framework/types"

/**
 * Swap variant links from empty price sets to migrated price sets (that have prices)
 * This preserves the migrated prices and links them to variants
 */
export default async function swapToMigratedPriceSets({ container }: ExecArgs) {
  try {
    console.log("🔄 Swapping variant links to migrated price sets (with prices)...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Get variants linked to empty price sets (no prices)
    const variantsWithEmptyPriceSets = await client.query(`
      SELECT pv.id, pv.sku, pv.created_at, pvps.price_set_id as current_price_set_id
      FROM product_variant pv
      INNER JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = pvps.price_set_id AND p.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND p.id IS NULL  -- Price set has no prices
      ORDER BY pv.created_at ASC
    `)

    // Get migrated price sets with prices that aren't linked to variants
    const migratedPriceSetsWithPrices = await client.query(`
      SELECT ps.id, ps.created_at, COUNT(p.id) as price_count,
             STRING_AGG(DISTINCT p.currency_code, ', ') as currencies
      FROM price_set ps
      INNER JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
        AND pvps.id IS NULL  -- Not linked to any variant
      GROUP BY ps.id, ps.created_at
      ORDER BY ps.created_at ASC
    `)

    console.log(`\n📊 Found:`)
    console.log(`   • ${variantsWithEmptyPriceSets.rows.length} variants linked to empty price sets`)
    console.log(`   • ${migratedPriceSetsWithPrices.rows.length} migrated price sets with prices (not linked)`)

    if (variantsWithEmptyPriceSets.rows.length === 0) {
      console.log("\n✅ No variants with empty price sets to swap!")
      await client.end()
      return
    }

    if (migratedPriceSetsWithPrices.rows.length === 0) {
      console.log("\n⚠️  No migrated price sets with prices available!")
      await client.end()
      return
    }

    const minCount = Math.min(variantsWithEmptyPriceSets.rows.length, migratedPriceSetsWithPrices.rows.length)
    console.log(`\n🔄 Swapping ${minCount} links...`)

    let swapped = 0
    let errors = 0

    for (let i = 0; i < minCount; i++) {
      const variant = variantsWithEmptyPriceSets.rows[i]
      const migratedPriceSet = migratedPriceSetsWithPrices.rows[i]

      try {
        // Start transaction
        await client.query('BEGIN')

        // 1. Delete the old link (to empty price set)
        await client.query(`
          UPDATE product_variant_price_set
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE variant_id = $1 AND deleted_at IS NULL
        `, [variant.id])

        // 2. Create new link (to migrated price set with prices)
        const newLinkId = `pvps_${variant.id.replace('variant_', '').slice(0, 20)}_${migratedPriceSet.id.replace('pset_', '').slice(0, 10)}`
        await client.query(`
          INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [newLinkId, variant.id, migratedPriceSet.id])

        await client.query('COMMIT')
        swapped++

        if (swapped % 100 === 0) {
          console.log(`   Swapped ${swapped} links...`)
        }
      } catch (error: any) {
        await client.query('ROLLBACK')
        errors++
        console.log(`   ⚠️  Error swapping ${variant.id}: ${error.message}`)
      }
    }

    console.log(`\n✅ Swapped ${swapped} links successfully`)
    if (errors > 0) {
      console.log(`   ⚠️  ${errors} errors occurred`)
    }

    // Verify results
    const variantsWithPrices = await client.query(`
      SELECT COUNT(DISTINCT pv.id) as count
      FROM product_variant pv
      INNER JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      INNER JOIN price p ON p.price_set_id = pvps.price_set_id AND p.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
    `)

    const remainingEmpty = await client.query(`
      SELECT COUNT(DISTINCT pv.id) as count
      FROM product_variant pv
      INNER JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = pvps.price_set_id AND p.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND p.id IS NULL
    `)

    console.log(`\n📊 Results:`)
    console.log(`   • Variants with prices: ${variantsWithPrices.rows[0].count}`)
    console.log(`   • Variants still with empty price sets: ${remainingEmpty.rows[0].count}`)

    await client.end()

    console.log(`\n💡 Next Steps:`)
    console.log(`   1. Check variants in admin - they should now show migrated prices!`)
    console.log(`   2. Go to Products → [Product] → Variants → [Variant] → Edit → Prices`)
    console.log(`   3. You should see the migrated prices (AUD and USD)`)

  } catch (error: any) {
    console.error("❌ Error swapping price set links:", error.message)
    console.error(error.stack)
    throw error
  }
}
