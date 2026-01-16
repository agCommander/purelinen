import { ExecArgs } from "@medusajs/framework/types"
import * as fs from 'fs'
import * as path from 'path'
// Using simple CSV parsing (no external dependency needed)

/**
 * Import prices from CSV file
 * - Uses purelinen price as base price (AUD)
 * - Stores linenthings prices for later Price List use
 */
export default async function importPricesFromCsv({ container }: ExecArgs) {
  try {
    console.log("📥 Importing prices from CSV...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Check if price_sets need clearing
    console.log("\n🔍 Checking price_set table...")
    const priceSetCount = await client.query(`SELECT COUNT(*) FROM price_set WHERE deleted_at IS NULL`)
    const linkedPriceSets = await client.query(`
      SELECT COUNT(DISTINCT pvps.price_set_id) 
      FROM product_variant_price_set pvps 
      WHERE pvps.deleted_at IS NULL
    `)
    
    console.log(`   • Total price_sets: ${priceSetCount.rows[0].count}`)
    console.log(`   • Linked to variants: ${linkedPriceSets.rows[0].count}`)
    
    if (priceSetCount.rows[0].count > 0) {
      console.log("\n⚠️  Price sets exist. Options:")
      console.log("   1. Delete all price_sets (recommended if starting fresh)")
      console.log("   2. Keep existing and only update prices")
      console.log("\n   Deleting all price_sets and links...")
      
      // Delete links first
      await client.query(`UPDATE product_variant_price_set SET deleted_at = NOW() WHERE deleted_at IS NULL`)
      // Delete price_sets
      await client.query(`UPDATE price_set SET deleted_at = NOW() WHERE deleted_at IS NULL`)
      console.log("   ✅ Cleared price_sets and links")
    }

    // Read CSV file (from workspace root, go up from medusa-backend/purelinen)
    let csvPath = path.join(process.cwd(), '..', '..', 'migration-tools', 'catalog_product_index_price.csv')
    console.log(`\n📄 Reading CSV: ${csvPath}`)
    
    if (!fs.existsSync(csvPath)) {
      // Try alternative path (absolute from workspace root)
      const altPath = path.join(__dirname, '..', '..', '..', '..', 'migration-tools', 'catalog_product_index_price.csv')
      console.log(`   Trying alternative path: ${altPath}`)
      if (fs.existsSync(altPath)) {
        csvPath = altPath
      } else {
        throw new Error(`CSV file not found. Tried:\n  ${csvPath}\n  ${altPath}\n\nCurrent working directory: ${process.cwd()}`)
      }
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].replace(/"/g, '').split(',')
    
    const records = lines.slice(1).map(line => {
      // Simple CSV parsing (handles quoted values)
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Last value
      
      const record: any = {}
      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.replace(/^"|"$/g, '') || ''
      })
      return record
    }).filter(record => record.sku && record.sales_channel && record.amount)

    console.log(`   Found ${records.length} price records`)

    // Group by SKU to get both purelinen and linenthings prices
    const pricesBySku = new Map<string, { purelinen?: number, linenthings?: number }>()
    
    for (const record of records) {
      const sku = record.sku?.trim()
      const salesChannel = record.sales_channel?.trim().toLowerCase()
      const amount = parseFloat(record.amount?.trim() || '0')
      
      if (!sku || !salesChannel || isNaN(amount) || amount <= 0) {
        continue
      }

      if (!pricesBySku.has(sku)) {
        pricesBySku.set(sku, {})
      }

      const prices = pricesBySku.get(sku)!
      if (salesChannel === 'purelinen') {
        prices.purelinen = amount
      } else if (salesChannel === 'linenthings') {
        prices.linenthings = amount
      }
    }

    console.log(`\n📊 Grouped prices:`)
    console.log(`   • Unique SKUs: ${pricesBySku.size}`)
    const withPurelinen = Array.from(pricesBySku.values()).filter(p => p.purelinen).length
    const withLinenthings = Array.from(pricesBySku.values()).filter(p => p.linenthings).length
    console.log(`   • SKUs with purelinen price: ${withPurelinen}`)
    console.log(`   • SKUs with linenthings price: ${withLinenthings}`)

    // Get all variants by SKU
    console.log(`\n🔗 Finding variants...`)
    const variants = await client.query(`
      SELECT id, sku, product_id
      FROM product_variant
      WHERE deleted_at IS NULL
    `)

    const variantsBySku = new Map<string, any>()
    variants.rows.forEach((v: any) => {
      variantsBySku.set(v.sku, v)
    })

    console.log(`   • Found ${variants.rows.length} variants`)
    console.log(`   • SKUs with prices: ${pricesBySku.size}`)

    // Create price_sets and base prices
    console.log(`\n💰 Creating price_sets and base prices...`)
    
    let created = 0
    let skipped = 0
    let errors = 0
    const linenthingsPrices = new Map<string, number>() // Store for later Price List use

    for (const [sku, prices] of pricesBySku.entries()) {
      const variant = variantsBySku.get(sku)
      
      if (!variant) {
        skipped++
        continue
      }

      if (!prices.purelinen) {
        skipped++
        continue
      }

      try {
        await client.query('BEGIN')

        // Create price_set (check if exists first)
        const priceSetId = `pset_${variant.id.replace('variant_', '').slice(0, 27)}`
        const existingPriceSet = await client.query(`
          SELECT id FROM price_set WHERE id = $1
        `, [priceSetId])
        
        if (existingPriceSet.rows.length === 0) {
          await client.query(`
            INSERT INTO price_set (id, created_at, updated_at)
            VALUES ($1, NOW(), NOW())
          `, [priceSetId])
        }

        // Create base price (purelinen price in AUD, convert to cents)
        const amountInCents = Math.round(prices.purelinen * 100)
        const priceId = `price_${variant.id.replace('variant_', '').slice(0, 20)}_aud`
        
        // Check if price exists
        const existingPrice = await client.query(`
          SELECT id FROM price WHERE id = $1
        `, [priceId])
        
        if (existingPrice.rows.length === 0) {
          await client.query(`
            INSERT INTO price (
              id, price_set_id, currency_code, amount, raw_amount,
              rules_count, created_at, updated_at
            )
            VALUES (
              $1, $2, $3, $4, $5,
              0, NOW(), NOW()
            )
          `, [
            priceId,
            priceSetId,
            'aud',
            amountInCents,
            JSON.stringify({
              value: amountInCents.toString(),
              precision: 20
            })
          ])
        } else {
          // Update existing price
          await client.query(`
            UPDATE price SET
              amount = $1,
              raw_amount = $2,
              updated_at = NOW()
            WHERE id = $3
          `, [
            amountInCents,
            JSON.stringify({
              value: amountInCents.toString(),
              precision: 20
            }),
            priceId
          ])
        }

        // Link variant to price_set (check if exists first)
        const linkId = `pvps_${variant.id.replace('variant_', '').slice(0, 20)}_${priceSetId.replace('pset_', '').slice(0, 10)}`
        const existingLink = await client.query(`
          SELECT id FROM product_variant_price_set 
          WHERE variant_id = $1 AND deleted_at IS NULL
        `, [variant.id])
        
        if (existingLink.rows.length === 0) {
          await client.query(`
            INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [linkId, variant.id, priceSetId])
        } else {
          // Update existing link if pointing to different price_set
          await client.query(`
            UPDATE product_variant_price_set SET
              price_set_id = $1,
              updated_at = NOW()
            WHERE variant_id = $2 AND deleted_at IS NULL
          `, [priceSetId, variant.id])
        }

        // Store linenthings price for later (if exists)
        if (prices.linenthings) {
          linenthingsPrices.set(variant.id, prices.linenthings)
        }

        await client.query('COMMIT')
        created++

        if (created % 100 === 0) {
          console.log(`   Created ${created} price_sets and base prices...`)
        }
      } catch (error: any) {
        await client.query('ROLLBACK')
        errors++
        console.log(`   ⚠️  Error processing ${sku}: ${error.message}`)
      }
    }

    console.log(`\n✅ Import complete:`)
    console.log(`   • Created: ${created} price_sets and base prices`)
    console.log(`   • Skipped: ${skipped} SKUs (no variant or no purelinen price)`)
    console.log(`   • Errors: ${errors}`)
    console.log(`   • Linenthings prices stored: ${linenthingsPrices.size} (for Price List use)`)

    // Save linenthings prices to a file for later use
    const linenthingsData = Array.from(linenthingsPrices.entries()).map(([variantId, amount]) => ({
      variant_id: variantId,
      amount: amount,
      amount_cents: Math.round(amount * 100)
    }))

    const outputPath = path.join(process.cwd(), '..', '..', 'migration-tools', 'linenthings-prices.json')
    fs.writeFileSync(outputPath, JSON.stringify(linenthingsData, null, 2))
    console.log(`\n💾 Saved linenthings prices to: ${outputPath}`)
    console.log(`   Use this file when creating the Linen Things Price List`)

    await client.end()

    console.log(`\n💡 Next Steps:`)
    console.log(`   1. Verify prices in admin: Products → [Product] → Variants → [Variant] → Prices`)
    console.log(`   2. Create Price Lists:`)
    console.log(`      • Pure Linen Wholesale Pricing (will use base prices)`)
    console.log(`      • Linen Things Retail Pricing (use linenthings-prices.json)`)
    console.log(`   3. Add variants to Price Lists and set prices`)

  } catch (error: any) {
    console.error("❌ Error importing prices:", error.message)
    console.error(error.stack)
    throw error
  }
}
