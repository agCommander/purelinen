import { ExecArgs } from "@medusajs/framework/types"

/**
 * Script to remove duplicate Price List prices
 * Keeps the price with the simpler ID format (without price_list_id embedded)
 * and removes duplicates that have the same price_list_id, currency_code, and price_set_id
 */
export default async function removeDuplicatePriceListPrices({ container }: ExecArgs) {
  try {
    console.log("🔍 Finding duplicate Price List prices...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error("DATABASE_URL not set")
    }

    const client = new Client({ connectionString })
    await client.connect()

    try {
      // Find duplicates: same price_set_id, price_list_id, currency_code
      // but different IDs
      const duplicatesQuery = await client.query(`
        SELECT 
          price_set_id,
          price_list_id,
          currency_code,
          COUNT(*) as count,
          array_agg(id ORDER BY id) as price_ids,
          array_agg(amount ORDER BY id) as amounts
        FROM price
        WHERE price_list_id IS NOT NULL
          AND deleted_at IS NULL
        GROUP BY price_set_id, price_list_id, currency_code
        HAVING COUNT(*) > 1
      `)

      console.log(`Found ${duplicatesQuery.rows.length} groups of duplicates`)

      let totalRemoved = 0
      let totalKept = 0

      for (const duplicate of duplicatesQuery.rows) {
        const priceIds = duplicate.price_ids as string[]
        const amounts = duplicate.amounts as string[]

        // Strategy: Keep the price with the simpler ID (doesn't contain the price_list_id)
        // If both have complex IDs, keep the one with fewer decimals in amount
        let keepId: string | null = null
        let removeIds: string[] = []

        // Check if any ID is simpler (doesn't contain the price_list_id substring)
        const priceListIdShort = duplicate.price_list_id.replace('plist_', '').substring(0, 12)
        
        const simpleIds = priceIds.filter(id => !id.includes(priceListIdShort))
        const complexIds = priceIds.filter(id => id.includes(priceListIdShort))

        if (simpleIds.length > 0) {
          // Keep the first simple ID
          keepId = simpleIds[0]
          removeIds = [...simpleIds.slice(1), ...complexIds]
        } else {
          // All IDs are complex, keep the one with simpler amount (fewer decimals)
          // Find the amount with fewer decimal places
          let simplestAmount = amounts[0]
          let simplestIndex = 0
          
          for (let i = 1; i < amounts.length; i++) {
            const currentDecimals = (amounts[i].split('.')[1] || '').replace(/0+$/, '').length
            const simplestDecimals = (simplestAmount.split('.')[1] || '').replace(/0+$/, '').length
            
            if (currentDecimals < simplestDecimals) {
              simplestAmount = amounts[i]
              simplestIndex = i
            }
          }
          
          keepId = priceIds[simplestIndex]
          removeIds = priceIds.filter((_, i) => i !== simplestIndex)
        }

        if (keepId && removeIds.length > 0) {
          // Soft delete the duplicates
          const result = await client.query(`
            UPDATE price
            SET deleted_at = NOW(),
                updated_at = NOW()
            WHERE id = ANY($1::text[])
              AND deleted_at IS NULL
          `, [removeIds])

          totalRemoved += result.rowCount || 0
          totalKept += 1

          console.log(`  ✓ Kept: ${keepId}, Removed: ${removeIds.join(', ')}`)
        }
      }

      console.log(`\n✅ Cleanup complete!`)
      console.log(`   Kept: ${totalKept} prices`)
      console.log(`   Removed: ${totalRemoved} duplicate prices`)

    } finally {
      await client.end()
    }
  } catch (error: any) {
    console.error("❌ Error removing duplicate prices:", error.message)
    console.error(error.stack)
    throw error
  }
}
