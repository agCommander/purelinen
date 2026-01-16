import { ExecArgs } from "@medusajs/framework/types"

/**
 * Ensure all price sets have at least one price entry
 * This prevents "Cannot read properties of undefined (reading 'reduce')" errors
 * by ensuring variant.prices is always an array, never undefined
 */
export default async function ensureAllPriceSetsHavePrices({ container }: ExecArgs) {
  try {
    console.log("🔍 Ensuring all price sets have at least one price...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Find price sets with no prices that are linked to variants
    const emptyPriceSets = await client.query(`
      SELECT 
        ps.id as price_set_id,
        COUNT(DISTINCT pvps.variant_id) as variant_count
      FROM price_set ps
      INNER JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
      GROUP BY ps.id
      HAVING COUNT(p.id) = 0
    `)

    console.log(`\n📊 Found ${emptyPriceSets.rows.length} price sets with no prices (but linked to variants)`)

    if (emptyPriceSets.rows.length === 0) {
      console.log("\n✅ All price sets already have prices!")
      await client.end()
      return
    }

    // Get default currency (AUD)
    const currencyResult = await client.query(`
      SELECT currency_code 
      FROM store 
      WHERE deleted_at IS NULL 
      LIMIT 1
    `)
    
    const defaultCurrency = currencyResult.rows[0]?.currency_code || 'aud'
    console.log(`\n💰 Using default currency: ${defaultCurrency.toUpperCase()}`)

    // Add a placeholder price to each empty price set
    let addedCount = 0
    const errors: string[] = []

    for (const row of emptyPriceSets.rows) {
      try {
        // Generate a unique price ID
        const priceId = `price_${row.price_set_id.replace('pset_', '').slice(0, 20)}_${Date.now().toString().slice(-10)}`
        
        // Insert a placeholder price (0.01 = 1 cent, which is effectively $0.00)
        // This ensures prices array exists but won't affect actual pricing
        await client.query(`
          INSERT INTO price (
            id,
            price_set_id,
            currency_code,
            amount,
            min_quantity,
            max_quantity,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          priceId,
          row.price_set_id,
          defaultCurrency.toLowerCase(),
          1, // 1 cent = $0.01 (placeholder)
          null, // min_quantity
          null  // max_quantity
        ])

        addedCount++
        
        if (addedCount % 50 === 0) {
          console.log(`   Added prices to ${addedCount} price sets...`)
        }
      } catch (error: any) {
        // Check if it's a duplicate key error (price already exists)
        if (error.code === '23505') {
          // Price already exists, skip
          continue
        }
        errors.push(`Price Set ${row.price_set_id}: ${error.message}`)
      }
    }

    console.log(`\n✅ Added placeholder prices to ${addedCount} price sets`)
    
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
      FROM price_set ps
      INNER JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = ps.id AND p.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
      GROUP BY ps.id
      HAVING COUNT(p.id) = 0
    `)

    const remainingEmpty = finalCheck.rows.length
    if (remainingEmpty === 0) {
      console.log("\n✅ All price sets now have at least one price!")
    } else {
      console.log(`\n⚠️  ${remainingEmpty} price sets still have no prices`)
    }

    await client.end()

    console.log("\n💡 Note: Placeholder prices (1 cent) were added to prevent errors.")
    console.log("   You should update these to actual prices via the admin UI.")

  } catch (error: any) {
    console.error("❌ Error ensuring price sets have prices:", error.message)
    console.error(error.stack)
    throw error
  }
}
