import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/custom/products/[productId]/price-list-prices
 * Get Price List prices for all variants of a product in one batch request
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const productId = req.params.productId

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" })
    }

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL not set" })
    }

    const client = new Client({ connectionString })
    await client.connect()

    try {
      // Get all variants for this product
      const variantsResult = await client.query(`
        SELECT id
        FROM product_variant
        WHERE product_id = $1
          AND deleted_at IS NULL
      `, [productId])

      if (variantsResult.rows.length === 0) {
        return res.json({ pricesByVariant: {} })
      }

      const variantIds = variantsResult.rows.map((row: any) => row.id)

      // Get price_set_id for each variant
      const priceSetMap = new Map<string, string>() // variant_id -> price_set_id
      const priceSetIds: string[] = []

      const priceSetResult = await client.query(`
        SELECT variant_id, price_set_id
        FROM product_variant_price_set
        WHERE variant_id = ANY($1::text[])
          AND deleted_at IS NULL
      `, [variantIds])

      for (const row of priceSetResult.rows) {
        priceSetMap.set(row.variant_id, row.price_set_id)
        if (!priceSetIds.includes(row.price_set_id)) {
          priceSetIds.push(row.price_set_id)
        }
      }

      if (priceSetIds.length === 0) {
        return res.json({ pricesByVariant: {} })
      }

      // Get all Price List prices for all price sets in one query
      const priceListPrices = await client.query(`
        SELECT 
          p.id,
          p.price_set_id,
          p.price_list_id,
          p.currency_code,
          p.amount,
          pl.title as price_list_title
        FROM price p
        LEFT JOIN price_list pl ON pl.id = p.price_list_id
        WHERE p.price_set_id = ANY($1::text[])
          AND p.price_list_id IS NOT NULL
          AND p.deleted_at IS NULL
      `, [priceSetIds])

      // Group prices by variant_id (via price_set_id)
      const pricesByVariant: Record<string, any[]> = {}
      
      // Initialize empty arrays for all variants
      for (const variantId of variantIds) {
        pricesByVariant[variantId] = []
      }

      // Map prices to variants, filtering duplicates
      // Group by (price_set_id, price_list_id, currency_code) and keep only one
      const seenPrices = new Map<string, any>() // key: `${price_set_id}_${price_list_id}_${currency_code}`
      
      for (const price of priceListPrices.rows) {
        const key = `${price.price_set_id}_${price.price_list_id}_${price.currency_code}`
        
        // If we've seen this combination before, prefer the simpler ID (doesn't contain price_list_id substring)
        if (seenPrices.has(key)) {
          const existing = seenPrices.get(key)!
          const priceListIdShort = price.price_list_id.replace('plist_', '').substring(0, 12)
          
          // Prefer ID that doesn't contain the price_list_id substring (simpler format)
          if (!price.id.includes(priceListIdShort) && existing.id.includes(priceListIdShort)) {
            seenPrices.set(key, price)
          }
          // Otherwise keep existing
        } else {
          seenPrices.set(key, price)
        }
      }

      // Now map the deduplicated prices to variants
      for (const price of seenPrices.values()) {
        // Find all variants that use this price_set_id
        for (const [variantId, priceSetId] of priceSetMap.entries()) {
          if (priceSetId === price.price_set_id) {
            pricesByVariant[variantId].push({
              id: price.id,
              price_list_id: price.price_list_id,
              price_list_title: price.price_list_title,
              currency_code: price.currency_code,
              amount: price.amount,
            })
          }
        }
      }

      res.json({ pricesByVariant })
    } finally {
      await client.end()
    }
  } catch (error: any) {
    console.error("Error fetching Price List prices:", error)
    res.status(500).json({
      error: "Failed to fetch Price List prices",
      message: error.message,
    })
  }
}
