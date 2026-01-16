import { ExecArgs } from "@medusajs/framework/types"
import * as fs from 'fs'
import * as path from 'path'

/**
 * Add prices to Price Lists
 * - LINENTHINGS Price List: Uses linenthings prices from JSON
 * - PURELINEN Price List: Uses purelinen prices from CSV
 */
export default async function addPricesToPriceLists({ container }: ExecArgs) {
  try {
    console.log("💰 Adding prices to Price Lists...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Price List IDs
    const PURELINEN_PRICE_LIST_ID = 'plist_01KF2PEZ7CJWA5FYXTRCKY6NKS'
    const LINENTHINGS_PRICE_LIST_ID = 'plist_01KF2RYC38M6705Z363HC4T9Y6'

    // Verify Price Lists exist
    console.log("\n🔍 Verifying Price Lists...")
    const priceLists = await client.query(`
      SELECT id, title, status
      FROM price_list
      WHERE id IN ($1, $2)
        AND deleted_at IS NULL
    `, [PURELINEN_PRICE_LIST_ID, LINENTHINGS_PRICE_LIST_ID])

    if (priceLists.rows.length !== 2) {
      throw new Error(`Expected 2 Price Lists, found ${priceLists.rows.length}`)
    }

    priceLists.rows.forEach((pl: any) => {
      console.log(`   ✅ ${pl.title || pl.id}: ${pl.id} (${pl.status})`)
    })

    // 1. Add LINENTHINGS prices
    console.log("\n📥 Adding LINENTHINGS prices...")
    let linenthingsJsonPath = path.join(process.cwd(), '..', '..', 'migration-tools', 'linenthings-prices.json')
    if (!fs.existsSync(linenthingsJsonPath)) {
      linenthingsJsonPath = path.join(__dirname, '..', '..', '..', '..', 'migration-tools', 'linenthings-prices.json')
    }

    if (!fs.existsSync(linenthingsJsonPath)) {
      throw new Error(`linenthings-prices.json not found. Tried:\n  ${linenthingsJsonPath}`)
    }

    const linenthingsPrices = JSON.parse(fs.readFileSync(linenthingsJsonPath, 'utf-8'))
    console.log(`   Found ${linenthingsPrices.length} linenthings prices`)

    let linenthingsAdded = 0
    let linenthingsErrors = 0

    for (const priceData of linenthingsPrices) {
      const variantId = priceData.variant_id
      const amountCents = priceData.amount_cents || Math.round(priceData.amount * 100)

      try {
        // Get variant's price_set_id
        const variantPriceSet = await client.query(`
          SELECT pvps.price_set_id
          FROM product_variant_price_set pvps
          WHERE pvps.variant_id = $1
            AND pvps.deleted_at IS NULL
        `, [variantId])

        if (variantPriceSet.rows.length === 0) {
          linenthingsErrors++
          continue
        }

        const priceSetId = variantPriceSet.rows[0].price_set_id

        // Create price in Price List
        const priceId = `price_${variantId.replace('variant_', '').slice(0, 20)}_linenthings_aud`
        
        await client.query(`
          INSERT INTO price (
            id, price_set_id, price_list_id, currency_code, amount, raw_amount,
            rules_count, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            0, NOW(), NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            amount = EXCLUDED.amount,
            raw_amount = EXCLUDED.raw_amount,
            updated_at = NOW()
        `, [
          priceId,
          priceSetId,
          LINENTHINGS_PRICE_LIST_ID,
          'aud',
          amountCents,
          JSON.stringify({
            value: amountCents.toString(),
            precision: 20
          })
        ])

        linenthingsAdded++

        if (linenthingsAdded % 100 === 0) {
          console.log(`   Added ${linenthingsAdded} LINENTHINGS prices...`)
        }
      } catch (error: any) {
        linenthingsErrors++
        if (linenthingsErrors <= 5) {
          console.log(`   ⚠️  Error adding price for ${variantId}: ${error.message}`)
        }
      }
    }

    console.log(`\n✅ LINENTHINGS: Added ${linenthingsAdded} prices, ${linenthingsErrors} errors`)

    // 2. Add PURELINEN prices (from CSV)
    console.log("\n📥 Adding PURELINEN prices...")
    
    // Read CSV to get purelinen prices
    let csvPath = path.join(process.cwd(), '..', '..', 'migration-tools', 'catalog_product_index_price.csv')
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '..', '..', '..', '..', 'migration-tools', 'catalog_product_index_price.csv')
    }

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`)
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    // Parse CSV
    const purelinenPrices = new Map<string, number>() // SKU -> amount
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      if (values.length >= 3) {
        const sku = values[0]?.replace(/^"|"$/g, '') || ''
        const salesChannel = values[1]?.replace(/^"|"$/g, '').toLowerCase() || ''
        const amount = parseFloat(values[2]?.replace(/^"|"$/g, '') || '0')
        
        if (sku && salesChannel === 'purelinen' && !isNaN(amount) && amount > 0) {
          purelinenPrices.set(sku, amount)
        }
      }
    }

    console.log(`   Found ${purelinenPrices.size} purelinen prices in CSV`)

    // Get all variants with their SKUs
    const variants = await client.query(`
      SELECT id, sku
      FROM product_variant
      WHERE deleted_at IS NULL
    `)

    const variantsBySku = new Map<string, string>() // SKU -> variant_id
    variants.rows.forEach((v: any) => {
      variantsBySku.set(v.sku, v.id)
    })

    let purelinenAdded = 0
    let purelinenErrors = 0

    for (const [sku, amount] of purelinenPrices.entries()) {
      const variantId = variantsBySku.get(sku)
      
      if (!variantId) {
        purelinenErrors++
        continue
      }

      try {
        // Get variant's price_set_id
        const variantPriceSet = await client.query(`
          SELECT pvps.price_set_id
          FROM product_variant_price_set pvps
          WHERE pvps.variant_id = $1
            AND pvps.deleted_at IS NULL
        `, [variantId])

        if (variantPriceSet.rows.length === 0) {
          purelinenErrors++
          continue
        }

        const priceSetId = variantPriceSet.rows[0].price_set_id
        const amountCents = Math.round(amount * 100)

        // Create price in Price List
        const priceId = `price_${variantId.replace('variant_', '').slice(0, 20)}_purelinen_aud`
        
        await client.query(`
          INSERT INTO price (
            id, price_set_id, price_list_id, currency_code, amount, raw_amount,
            rules_count, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            0, NOW(), NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            amount = EXCLUDED.amount,
            raw_amount = EXCLUDED.raw_amount,
            updated_at = NOW()
        `, [
          priceId,
          priceSetId,
          PURELINEN_PRICE_LIST_ID,
          'aud',
          amountCents,
          JSON.stringify({
            value: amountCents.toString(),
            precision: 20
          })
        ])

        purelinenAdded++

        if (purelinenAdded % 100 === 0) {
          console.log(`   Added ${purelinenAdded} PURELINEN prices...`)
        }
      } catch (error: any) {
        purelinenErrors++
        if (purelinenErrors <= 5) {
          console.log(`   ⚠️  Error adding price for ${sku}: ${error.message}`)
        }
      }
    }

    console.log(`\n✅ PURELINEN: Added ${purelinenAdded} prices, ${purelinenErrors} errors`)

    // Verify results
    const linenthingsCount = await client.query(`
      SELECT COUNT(*) FROM price
      WHERE price_list_id = $1 AND deleted_at IS NULL
    `, [LINENTHINGS_PRICE_LIST_ID])

    const purelinenCount = await client.query(`
      SELECT COUNT(*) FROM price
      WHERE price_list_id = $1 AND deleted_at IS NULL
    `, [PURELINEN_PRICE_LIST_ID])

    console.log(`\n📊 Final counts:`)
    console.log(`   • LINENTHINGS Price List: ${linenthingsCount.rows[0].count} prices`)
    console.log(`   • PURELINEN Price List: ${purelinenCount.rows[0].count} prices`)

    await client.end()

    console.log(`\n💡 Next Steps:`)
    console.log(`   1. Verify prices in Admin → Pricing → Price Lists`)
    console.log(`   2. Test pricing on storefronts`)
    console.log(`   3. Configure Sales Channels if needed`)

  } catch (error: any) {
    console.error("❌ Error adding prices to Price Lists:", error.message)
    console.error(error.stack)
    throw error
  }
}
