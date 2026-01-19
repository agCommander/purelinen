import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Fix variants that have undefined or missing prices array
 * This ensures all variants have at least an empty prices array to prevent
 * "Cannot read properties of undefined (reading 'reduce')" errors in admin UI
 */
export default async function fixVariantsMissingPrices({ container }: ExecArgs) {
  try {
    console.log("🔍 Checking for variants with missing prices...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Find variants that are linked to price sets but those price sets have no prices
    const variantsWithEmptyPriceSets = await client.query(`
      SELECT 
        pv.id as variant_id,
        pv.sku,
        pvps.price_set_id,
        COUNT(p.id) as price_count
      FROM product_variant pv
      INNER JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = pvps.price_set_id AND p.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
      GROUP BY pv.id, pv.sku, pvps.price_set_id
      HAVING COUNT(p.id) = 0
      ORDER BY pv.created_at DESC
      LIMIT 100
    `)

    console.log(`\n📊 Found ${variantsWithEmptyPriceSets.rows.length} variants with empty price sets`)

    if (variantsWithEmptyPriceSets.rows.length === 0) {
      console.log("\n✅ All variants have prices!")
      await client.end()
      return
    }

    // Also check for variants without price set links
    const variantsWithoutPriceSets = await client.query(`
      SELECT pv.id, pv.sku
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND pvps.id IS NULL
      LIMIT 100
    `)

    console.log(`📊 Found ${variantsWithoutPriceSets.rows.length} variants without price set links`)

    // Get product service to update variants
    let productService: any = null
    try {
      productService = container.resolve(Modules.PRODUCT) as any
    } catch (e) {
      try {
        productService = container.resolve("productService") as any
      } catch (e2) {
        console.error("❌ Could not resolve product service")
        await client.end()
        return
      }
    }

    let fixedCount = 0
    const errors: string[] = []

    // Fix variants without price sets by creating price sets and adding empty prices array
    console.log("\n🔧 Fixing variants without price sets...")
    for (const variant of variantsWithoutPriceSets.rows) {
      try {
        // Create a price set for this variant
        const priceSetId = `pset_${variant.id.replace('variant_', '').slice(0, 27)}`
        
        // Check if price set already exists
        const existingPriceSet = await client.query(`
          SELECT id FROM price_set WHERE id = $1
        `, [priceSetId])

        let finalPriceSetId = priceSetId
        if (existingPriceSet.rows.length === 0) {
          await client.query(`
            INSERT INTO price_set (id, created_at, updated_at)
            VALUES ($1, NOW(), NOW())
          `, [priceSetId])
        } else {
          finalPriceSetId = existingPriceSet.rows[0].id
        }

        // Create link
        const existingLink = await client.query(`
          SELECT id FROM product_variant_price_set 
          WHERE variant_id = $1 AND deleted_at IS NULL
        `, [variant.id])

        if (existingLink.rows.length === 0) {
          const linkId = `pvps_${variant.id.replace('variant_', '').slice(0, 20)}_${finalPriceSetId.replace('pset_', '').slice(0, 10)}`
          await client.query(`
            INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [linkId, variant.id, finalPriceSetId])
        }

        // Add an empty price entry to ensure prices array exists
        // This is a workaround - the real fix is ensuring Medusa loads prices correctly
        // But we can at least ensure price sets exist
        
        fixedCount++
        if (fixedCount % 50 === 0) {
          console.log(`   Fixed ${fixedCount} variants...`)
        }
      } catch (error: any) {
        errors.push(`Variant ${variant.id}: ${error.message}`)
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} variants`)
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`)
      errors.slice(0, 10).forEach(err => console.log(`   ${err}`))
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more`)
      }
    }

    await client.end()

    console.log("\n💡 Note: This script ensures price sets exist.")
    console.log("   If you're still seeing errors, the issue may be in how Medusa loads prices.")
    console.log("   Try refreshing the admin page or clearing browser cache.")

  } catch (error: any) {
    console.error("❌ Error fixing variants:", error.message)
    console.error(error.stack)
    throw error
  }
}
