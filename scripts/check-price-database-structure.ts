import { ExecArgs } from "@medusajs/framework/types"

/**
 * Check the actual database structure to understand how prices are linked to variants
 */
export default async function checkPriceDatabaseStructure({ container }: ExecArgs) {
  try {
    console.log("🔍 Checking database structure for price relationships...")

    // Get database connection
    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    console.log("\n📊 Checking table structures...\n")

    // Check product_variant table structure
    console.log("1. Product Variant table columns:")
    const variantColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product_variant'
      ORDER BY ordinal_position
    `)
    variantColumns.rows.forEach((row: any) => {
      console.log(`   • ${row.column_name} (${row.data_type})`)
    })

    // Check price_set table structure
    console.log("\n2. Price Set table columns:")
    const priceSetColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'price_set'
      ORDER BY ordinal_position
    `)
    priceSetColumns.rows.forEach((row: any) => {
      console.log(`   • ${row.column_name} (${row.data_type})`)
    })

    // Check price table structure
    console.log("\n3. Price table columns:")
    const priceColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'price'
      ORDER BY ordinal_position
    `)
    priceColumns.rows.forEach((row: any) => {
      console.log(`   • ${row.column_name} (${row.data_type})`)
    })

    // Check for junction tables
    console.log("\n4. Looking for junction tables linking variants to price_sets:")
    const junctionTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%variant%price%'
        OR table_name LIKE '%price%variant%'
      ORDER BY table_name
    `)
    if (junctionTables.rows.length > 0) {
      junctionTables.rows.forEach((row: any) => {
        console.log(`   • Found: ${row.table_name}`)
      })
    } else {
      console.log("   • No obvious junction tables found")
    }

    // Check how prices link to variants
    console.log("\n5. Checking price table for variant references:")
    const priceVariantLink = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'price' 
        AND (column_name LIKE '%variant%' OR column_name LIKE '%entity%')
    `)
    if (priceVariantLink.rows.length > 0) {
      priceVariantLink.rows.forEach((row: any) => {
        console.log(`   • Price table has: ${row.column_name}`)
      })
    } else {
      console.log("   • Price table doesn't have variant columns")
    }

    // Check sample data
    console.log("\n6. Sample data:")
    const samplePrices = await client.query(`
      SELECT * FROM price LIMIT 3
    `)
    if (samplePrices.rows.length > 0) {
      console.log("   Sample price record:")
      console.log(JSON.stringify(samplePrices.rows[0], null, 2))
    }

    const samplePriceSets = await client.query(`
      SELECT * FROM price_set LIMIT 3
    `)
    if (samplePriceSets.rows.length > 0) {
      console.log("\n   Sample price_set record:")
      console.log(JSON.stringify(samplePriceSets.rows[0], null, 2))
    }

    // Check if price_set has variant_id
    console.log("\n7. Checking price_set for variant references:")
    const priceSetVariantLink = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'price_set' 
        AND (column_name LIKE '%variant%' OR column_name LIKE '%entity%')
    `)
    if (priceSetVariantLink.rows.length > 0) {
      priceSetVariantLink.rows.forEach((row: any) => {
        console.log(`   • Price Set table has: ${row.column_name}`)
      })
    } else {
      console.log("   • Price Set table doesn't have variant columns")
    }

    // Count records
    console.log("\n8. Record counts:")
    const variantCount = await client.query(`SELECT COUNT(*) FROM product_variant`)
    const priceCount = await client.query(`SELECT COUNT(*) FROM price`)
    const priceSetCount = await client.query(`SELECT COUNT(*) FROM price_set`)
    
    console.log(`   • Variants: ${variantCount.rows[0].count}`)
    console.log(`   • Prices: ${priceCount.rows[0].count}`)
    console.log(`   • Price Sets: ${priceSetCount.rows[0].count}`)

    await client.end()

    console.log("\n💡 Next Steps:")
    console.log("   Based on the structure above, we can determine how to link variants to price_sets")

  } catch (error: any) {
    console.error("❌ Error checking database structure:", error.message)
    console.error(error.stack)
    throw error
  }
}
