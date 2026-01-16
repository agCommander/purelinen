import { ExecArgs } from "@medusajs/framework/types"

/**
 * Fix variant to price_set links
 * This script attempts to link variants to price sets based on creation order
 * or creates new price sets for variants that don't have them
 */
export default async function fixVariantPriceSetLinks({ container }: ExecArgs) {
  try {
    console.log("🔗 Fixing variant to price_set links...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Get all variants without price sets, ordered by creation
    const variantsWithoutPriceSets = await client.query(`
      SELECT pv.id, pv.sku, pv.created_at, pv.product_id
      FROM product_variant pv
      LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
        AND pvps.id IS NULL
      ORDER BY pv.created_at ASC
    `)

    // Get all price sets without variants, ordered by creation
    const priceSetsWithoutVariants = await client.query(`
      SELECT ps.id, ps.created_at
      FROM price_set ps
      LEFT JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
        AND pvps.id IS NULL
      ORDER BY ps.created_at ASC
    `)

    console.log(`\n📊 Found:`)
    console.log(`   • ${variantsWithoutPriceSets.rows.length} variants without price sets`)
    console.log(`   • ${priceSetsWithoutVariants.rows.length} price sets without variants`)

    if (variantsWithoutPriceSets.rows.length === 0) {
      console.log("\n✅ All variants already have price sets!")
      await client.end()
      return
    }

    // Strategy 1: Try to match by creation order (if counts are similar)
    if (Math.abs(variantsWithoutPriceSets.rows.length - priceSetsWithoutVariants.rows.length) < 100) {
      console.log("\n🔄 Attempting to link by creation order...")
      
      const linksToCreate: Array<{ variant_id: string, price_set_id: string }> = []
      const minCount = Math.min(variantsWithoutPriceSets.rows.length, priceSetsWithoutVariants.rows.length)
      
      for (let i = 0; i < minCount; i++) {
        linksToCreate.push({
          variant_id: variantsWithoutPriceSets.rows[i].id,
          price_set_id: priceSetsWithoutVariants.rows[i].id,
        })
      }

      console.log(`   Will create ${linksToCreate.length} links...`)

      // Create links
      let created = 0
      for (const link of linksToCreate) {
        try {
          // Check if link already exists
          const existingLink = await client.query(`
            SELECT id FROM product_variant_price_set 
            WHERE variant_id = $1 AND deleted_at IS NULL
          `, [link.variant_id])

          if (existingLink.rows.length > 0) {
            // Link already exists, skip
            continue
          }

          const linkId = `pvps_${link.variant_id.replace('variant_', '').slice(0, 20)}_${link.price_set_id.replace('pset_', '').slice(0, 10)}`
          await client.query(`
            INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [linkId, link.variant_id, link.price_set_id])
          created++
          
          if (created % 100 === 0) {
            console.log(`   Created ${created} links...`)
          }
        } catch (error: any) {
          console.log(`   ⚠️  Error linking ${link.variant_id}: ${error.message}`)
        }
      }

      console.log(`\n✅ Created ${created} links`)
    } else {
      console.log("\n⚠️  Count mismatch - cannot link by creation order")
      console.log("   Creating new price sets for remaining variants...")
      
      // Strategy 2: Create new price sets for variants
      const variantsNeedingPriceSets = variantsWithoutPriceSets.rows // Process all variants
      
      console.log(`   Creating price sets for ${variantsNeedingPriceSets.length} variants...`)
      
      let created = 0
      for (const variant of variantsNeedingPriceSets) {
        try {
          // Generate a unique price set ID
          const priceSetId = `pset_${variant.id.replace('variant_', '').slice(0, 27)}`
          
          // Check if price set already exists
          const existingPriceSet = await client.query(`
            SELECT id FROM price_set WHERE id = $1
          `, [priceSetId])

          let finalPriceSetId = priceSetId
          if (existingPriceSet.rows.length === 0) {
            // Create a new price set
            await client.query(`
              INSERT INTO price_set (id, created_at, updated_at)
              VALUES ($1, NOW(), NOW())
            `, [priceSetId])
          } else {
            // Use existing price set
            finalPriceSetId = existingPriceSet.rows[0].id
          }

          // Check if link already exists
          const existingLink = await client.query(`
            SELECT id FROM product_variant_price_set 
            WHERE variant_id = $1 AND deleted_at IS NULL
          `, [variant.id])

          if (existingLink.rows.length === 0) {
            // Create link
            const linkId = `pvps_${variant.id.replace('variant_', '').slice(0, 20)}_${finalPriceSetId.replace('pset_', '').slice(0, 10)}`
            await client.query(`
              INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
              VALUES ($1, $2, $3, NOW(), NOW())
            `, [linkId, variant.id, finalPriceSetId])
            created++
          } else {
            // Link already exists, skip
            continue
          }
          
          if (created % 50 === 0) {
            console.log(`   Created ${created} price sets and links...`)
          }
        } catch (error: any) {
          console.log(`   ⚠️  Error creating price set for ${variant.id}: ${error.message}`)
        }
      }

      console.log(`\n✅ Created ${created} new price sets and links`)
    }

    // Verify results
    const finalCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM product_variant_price_set 
      WHERE deleted_at IS NULL
    `)
    console.log(`\n📊 Final count: ${finalCount.rows[0].count} variant-price_set links`)

    await client.end()

    console.log("\n💡 Next Steps:")
    console.log("   1. Verify links in admin panel")
    console.log("   2. Add prices to price sets if needed")
    console.log("   3. Test Price Lists functionality")

  } catch (error: any) {
    console.error("❌ Error fixing variant-price_set links:", error.message)
    console.error(error.stack)
    throw error
  }
}
