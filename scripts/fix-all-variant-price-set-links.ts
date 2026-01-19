import { ExecArgs } from "@medusajs/framework/types"

/**
 * Fix ALL variants to ensure they have active price set links
 * This is critical - variants without price set links won't have prices loaded
 */
export default async function fixAllVariantPriceSetLinks({ container }: ExecArgs) {
  try {
    console.log("🔗 Fixing ALL variant to price_set links...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Get ALL active variants
    const allVariants = await client.query(`
      SELECT id, sku, created_at
      FROM product_variant
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `)

    console.log(`\n📊 Found ${allVariants.rows.length} total active variants`)

    // Get variants that already have active price set links
    const variantsWithLinks = await client.query(`
      SELECT DISTINCT pvps.variant_id
      FROM product_variant_price_set pvps
      WHERE pvps.deleted_at IS NULL
    `)

    const linkedVariantIds = new Set(variantsWithLinks.rows.map((r: any) => r.variant_id))
    console.log(`📊 Found ${linkedVariantIds.size} variants with active links`)

    // Find variants that need links
    const variantsNeedingLinks = allVariants.rows.filter((v: any) => !linkedVariantIds.has(v.id))
    console.log(`📊 Found ${variantsNeedingLinks.length} variants WITHOUT active links`)

    if (variantsNeedingLinks.length === 0) {
      console.log("\n✅ All variants already have active price set links!")
      await client.end()
      return
    }

    console.log(`\n🔧 Creating price sets and links for ${variantsNeedingLinks.length} variants...`)

    let createdPriceSets = 0
    let createdLinks = 0
    const errors: string[] = []

    for (const variant of variantsNeedingLinks) {
      try {
        // Generate a unique price set ID
        const priceSetId = `pset_${variant.id.replace('variant_', '').slice(0, 27)}`
        
        // Check if price set exists (even if deleted)
        const existingPriceSet = await client.query(`
          SELECT id, deleted_at FROM price_set WHERE id = $1
        `, [priceSetId])

        let finalPriceSetId = priceSetId
        
        if (existingPriceSet.rows.length === 0) {
          // Create new price set
          await client.query(`
            INSERT INTO price_set (id, created_at, updated_at)
            VALUES ($1, NOW(), NOW())
          `, [priceSetId])
          createdPriceSets++
        } else if (existingPriceSet.rows[0].deleted_at) {
          // Restore deleted price set
          await client.query(`
            UPDATE price_set
            SET deleted_at = NULL, updated_at = NOW()
            WHERE id = $1
          `, [priceSetId])
        }

        // Check if link already exists (even if deleted)
        const existingLink = await client.query(`
          SELECT id, deleted_at FROM product_variant_price_set 
          WHERE variant_id = $1 AND price_set_id = $2
        `, [variant.id, finalPriceSetId])

        if (existingLink.rows.length === 0) {
          // Create new link
          const linkId = `pvps_${variant.id.replace('variant_', '').slice(0, 20)}_${finalPriceSetId.replace('pset_', '').slice(0, 10)}`
          await client.query(`
            INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [linkId, variant.id, finalPriceSetId])
          createdLinks++
        } else if (existingLink.rows[0].deleted_at) {
          // Restore deleted link
          await client.query(`
            UPDATE product_variant_price_set
            SET deleted_at = NULL, updated_at = NOW()
            WHERE variant_id = $1 AND price_set_id = $2
          `, [variant.id, finalPriceSetId])
          createdLinks++
        }
        
        if ((createdPriceSets + createdLinks) % 100 === 0) {
          console.log(`   Processed ${createdPriceSets + createdLinks} variants...`)
        }
      } catch (error: any) {
        // Check if it's a duplicate key error (shouldn't happen but handle it)
        if (error.code === '23505') {
          // Link already exists, skip
          continue
        }
        errors.push(`Variant ${variant.id} (${variant.sku || 'no SKU'}): ${error.message}`)
      }
    }

    console.log(`\n✅ Created ${createdPriceSets} new price sets`)
    console.log(`✅ Created/restored ${createdLinks} price set links`)

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`)
      errors.slice(0, 10).forEach(err => console.log(`   ${err}`))
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more`)
      }
    }

    // Verify results
    const finalCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM product_variant_price_set
      WHERE deleted_at IS NULL
    `)

    const totalActiveLinks = finalCheck.rows[0]?.count || 0
    console.log(`\n📊 Final count: ${totalActiveLinks} active variant-price_set links`)

    // Check how many variants still don't have links
    const stillMissing = await client.query(`
      SELECT COUNT(*) as count
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND pvps.id IS NULL
    `)

    const stillMissingCount = stillMissing.rows[0]?.count || 0
    if (stillMissingCount > 0) {
      console.log(`\n⚠️  ${stillMissingCount} variants still don't have active links`)
    } else {
      console.log(`\n✅ All variants now have active price set links!`)
    }

    await client.end()

    console.log("\n💡 Next Steps:")
    console.log("   1. Variants now have price sets linked")
    console.log("   2. Add prices to price sets via admin UI or scripts")
    console.log("   3. The middleware will ensure prices array exists even if empty")

  } catch (error: any) {
    console.error("❌ Error fixing variant-price_set links:", error.message)
    console.error(error.stack)
    throw error
  }
}
