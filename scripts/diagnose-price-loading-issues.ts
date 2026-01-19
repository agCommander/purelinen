import { ExecArgs } from "@medusajs/framework/types"

/**
 * Diagnose potential price loading issues that could cause undefined prices
 */
export default async function diagnosePriceLoadingIssues({ container }: ExecArgs) {
  try {
    console.log("🔍 Diagnosing price loading issues...")

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("❌ DATABASE_URL not set")
      return
    }

    const client = new Client({ connectionString })
    await client.connect()

    // Check 1: Variants with price sets but no prices in default currency
    console.log("\n1️⃣ Checking variants with price sets but no prices in AUD...")
    const variantsWithoutAudPrices = await client.query(`
      SELECT 
        pv.id as variant_id,
        pv.sku,
        pvps.price_set_id,
        COUNT(CASE WHEN p.currency_code = 'aud' THEN 1 END) as aud_price_count,
        COUNT(p.id) as total_price_count
      FROM product_variant pv
      INNER JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id AND pvps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = pvps.price_set_id AND p.deleted_at IS NULL
      WHERE pv.deleted_at IS NULL
      GROUP BY pv.id, pv.sku, pvps.price_set_id
      HAVING COUNT(CASE WHEN p.currency_code = 'aud' THEN 1 END) = 0
        AND COUNT(p.id) > 0
      LIMIT 20
    `)

    console.log(`   Found ${variantsWithoutAudPrices.rows.length} variants with prices but none in AUD`)
    if (variantsWithoutAudPrices.rows.length > 0) {
      console.log("   Sample variants:")
      variantsWithoutAudPrices.rows.slice(0, 5).forEach((row: any) => {
        console.log(`     • ${row.sku || row.variant_id}: ${row.total_price_count} price(s), 0 in AUD`)
      })
    }

    // Check 2: Price sets with prices but in unexpected currencies
    console.log("\n2️⃣ Checking currency distribution in prices...")
    const currencyDistribution = await client.query(`
      SELECT 
        currency_code,
        COUNT(*) as count
      FROM price
      WHERE deleted_at IS NULL
      GROUP BY currency_code
      ORDER BY count DESC
    `)

    console.log("   Currency distribution:")
    currencyDistribution.rows.forEach((row: any) => {
      console.log(`     • ${row.currency_code.toUpperCase()}: ${row.count} prices`)
    })

    // Check 3: Variants that might have stale price_set links
    console.log("\n3️⃣ Checking for potential stale links...")
    const staleLinks = await client.query(`
      SELECT 
        pvps.variant_id,
        pvps.price_set_id,
        COUNT(p.id) as price_count
      FROM product_variant_price_set pvps
      INNER JOIN product_variant pv ON pv.id = pvps.variant_id AND pv.deleted_at IS NULL
      LEFT JOIN price_set ps ON ps.id = pvps.price_set_id AND ps.deleted_at IS NULL
      LEFT JOIN price p ON p.price_set_id = pvps.price_set_id AND p.deleted_at IS NULL
      WHERE pvps.deleted_at IS NULL
        AND (ps.id IS NULL OR ps.deleted_at IS NOT NULL)
      GROUP BY pvps.variant_id, pvps.price_set_id
      LIMIT 10
    `)

    console.log(`   Found ${staleLinks.rows.length} links to deleted price sets`)
    if (staleLinks.rows.length > 0) {
      console.log("   These need to be cleaned up!")
    }

    // Check 4: Price sets with multiple variants (should be 1:1)
    console.log("\n4️⃣ Checking price set to variant ratio...")
    const priceSetVariantCounts = await client.query(`
      SELECT 
        ps.id as price_set_id,
        COUNT(DISTINCT pvps.variant_id) as variant_count
      FROM price_set ps
      INNER JOIN product_variant_price_set pvps ON pvps.price_set_id = ps.id AND pvps.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL
      GROUP BY ps.id
      HAVING COUNT(DISTINCT pvps.variant_id) > 1
      LIMIT 10
    `)

    console.log(`   Found ${priceSetVariantCounts.rows.length} price sets shared by multiple variants`)
    if (priceSetVariantCounts.rows.length > 0) {
      console.log("   This is unusual - each variant should have its own price set")
    }

    await client.end()

    console.log("\n💡 Recommendations:")
    if (variantsWithoutAudPrices.rows.length > 0) {
      console.log("   • Add AUD prices to variants that only have other currencies")
    }
    if (staleLinks.rows.length > 0) {
      console.log("   • Clean up links to deleted price sets")
    }
    if (priceSetVariantCounts.rows.length > 0) {
      console.log("   • Consider creating separate price sets for each variant")
    }
    console.log("   • The random errors might be due to Medusa not loading prices relation")
    console.log("   • Try refreshing the admin page when errors occur")
    console.log("   • Consider reporting this as a Medusa bug if it persists")

  } catch (error: any) {
    console.error("❌ Error diagnosing price issues:", error.message)
    console.error(error.stack)
    throw error
  }
}
