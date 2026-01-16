import { ExecArgs } from "@medusajs/framework/types"

/**
 * Clean up stale links to deleted price sets
 * These can cause undefined prices errors
 */
export default async function cleanupStalePriceSetLinks({ container }: ExecArgs) {
  try {
    console.log("🧹 Cleaning up stale price set links...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Find stale links (links to deleted price sets)
    const staleLinks = await client.query(`
      SELECT 
        pvps.id as link_id,
        pvps.variant_id,
        pvps.price_set_id,
        pv.sku
      FROM product_variant_price_set pvps
      INNER JOIN product_variant pv ON pv.id = pvps.variant_id AND pv.deleted_at IS NULL
      LEFT JOIN price_set ps ON ps.id = pvps.price_set_id AND ps.deleted_at IS NULL
      WHERE pvps.deleted_at IS NULL
        AND (ps.id IS NULL OR ps.deleted_at IS NOT NULL)
    `)

    console.log(`\n📊 Found ${staleLinks.rows.length} stale links to deleted price sets`)

    if (staleLinks.rows.length === 0) {
      console.log("\n✅ No stale links found!")
      await client.end()
      return
    }

    // For each stale link, create a new price set and link
    let fixedCount = 0
    const errors: string[] = []

    for (const link of staleLinks.rows) {
      try {
        // Check if the price set exists (even if deleted)
        const existingPriceSet = await client.query(`
          SELECT id, deleted_at FROM price_set WHERE id = $1
        `, [link.price_set_id])

        let finalPriceSetId = link.price_set_id
        
        if (existingPriceSet.rows.length === 0) {
          // Price set doesn't exist at all, create new one
          const newPriceSetId = `pset_${link.variant_id.replace('variant_', '').slice(0, 27)}_${Date.now().toString().slice(-8)}`
          await client.query(`
            INSERT INTO price_set (id, created_at, updated_at)
            VALUES ($1, NOW(), NOW())
          `, [newPriceSetId])
          finalPriceSetId = newPriceSetId
        } else if (existingPriceSet.rows[0].deleted_at) {
          // Price set exists but is soft-deleted, restore it
          await client.query(`
            UPDATE price_set
            SET deleted_at = NULL, updated_at = NOW()
            WHERE id = $1
          `, [link.price_set_id])
        }

        // Soft delete the old stale link
        await client.query(`
          UPDATE product_variant_price_set
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [link.link_id])

        // Create new link
        const newLinkId = `pvps_${link.variant_id.replace('variant_', '').slice(0, 20)}_${finalPriceSetId.replace('pset_', '').slice(0, 10)}`
        
        // Check if new link already exists
        const existingLink = await client.query(`
          SELECT id FROM product_variant_price_set 
          WHERE variant_id = $1 AND price_set_id = $2 AND deleted_at IS NULL
        `, [link.variant_id, finalPriceSetId])

        if (existingLink.rows.length === 0) {
          await client.query(`
            INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [newLinkId, link.variant_id, finalPriceSetId])
        }

        fixedCount++
        
        if (fixedCount % 10 === 0) {
          console.log(`   Fixed ${fixedCount} stale links...`)
        }
      } catch (error: any) {
        errors.push(`Link ${link.link_id}: ${error.message}`)
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} stale links`)
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`)
      errors.slice(0, 5).forEach(err => console.log(`   ${err}`))
    }

    // Verify results
    const finalCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM product_variant_price_set pvps
      INNER JOIN product_variant pv ON pv.id = pvps.variant_id AND pv.deleted_at IS NULL
      LEFT JOIN price_set ps ON ps.id = pvps.price_set_id AND ps.deleted_at IS NULL
      WHERE pvps.deleted_at IS NULL
        AND (ps.id IS NULL OR ps.deleted_at IS NOT NULL)
    `)

    const remainingStale = finalCheck.rows[0]?.count || 0
    if (remainingStale === 0) {
      console.log("\n✅ All stale links cleaned up!")
    } else {
      console.log(`\n⚠️  ${remainingStale} stale links still remain`)
    }

    await client.end()

    console.log("\n💡 Note: New price sets were created for variants with stale links.")
    console.log("   You may need to add prices to these new price sets.")

  } catch (error: any) {
    console.error("❌ Error cleaning up stale links:", error.message)
    console.error(error.stack)
    throw error
  }
}
