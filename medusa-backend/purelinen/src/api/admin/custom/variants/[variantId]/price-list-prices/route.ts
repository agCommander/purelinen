import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const updatePriceListPricesSchema = z.object({
  prices: z.array(
    z.object({
      price_list_id: z.string(),
      amount: z.number(),
      currency_code: z.string().default("aud"),
    })
  ),
})

/**
 * GET /admin/custom/variants/[variantId]/price-list-prices
 * Get Price List prices for a variant
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const variantId = req.params.variantId

    if (!variantId) {
      return res.status(400).json({ error: "Variant ID is required" })
    }

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL not set" })
    }

    const client = new Client({ connectionString })
    await client.connect()

    try {
      // Get variant's price_set_id
      const variantPriceSet = await client.query(`
        SELECT pvps.price_set_id
        FROM product_variant_price_set pvps
        WHERE pvps.variant_id = $1
          AND pvps.deleted_at IS NULL
        LIMIT 1
      `, [variantId])

      if (variantPriceSet.rows.length === 0) {
        return res.json({ prices: [] })
      }

      const priceSetId = variantPriceSet.rows[0].price_set_id

      // Get Price List prices for this price set
      const priceListPrices = await client.query(`
        SELECT 
          p.id,
          p.price_list_id,
          p.currency_code,
          p.amount,
          pl.title as price_list_title
        FROM price p
        LEFT JOIN price_list pl ON pl.id = p.price_list_id
        WHERE p.price_set_id = $1
          AND p.price_list_id IS NOT NULL
          AND p.deleted_at IS NULL
      `, [priceSetId])

      res.json({
        prices: priceListPrices.rows.map((row: any) => ({
          id: row.id,
          price_list_id: row.price_list_id,
          price_list_title: row.price_list_title,
          currency_code: row.currency_code,
          amount: row.amount,
        })),
      })
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

/**
 * POST /admin/custom/variants/[variantId]/price-list-prices
 * Update Price List prices for a variant
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const variantId = req.params.variantId
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { prices } = updatePriceListPricesSchema.parse(body)

    if (!variantId) {
      return res.status(400).json({ error: "Variant ID is required" })
    }

    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL not set" })
    }

    const client = new Client({ connectionString })
    await client.connect()

    try {
      // Get variant's price_set_id
      const variantPriceSet = await client.query(`
        SELECT pvps.price_set_id
        FROM product_variant_price_set pvps
        WHERE pvps.variant_id = $1
          AND pvps.deleted_at IS NULL
        LIMIT 1
      `, [variantId])

      if (variantPriceSet.rows.length === 0) {
        return res.status(404).json({ error: "Variant price set not found" })
      }

      const priceSetId = variantPriceSet.rows[0].price_set_id
      const updatedPrices: string[] = []

      // Update or create each Price List price
      for (const priceData of prices) {
        const priceId = `price_${variantId.replace('variant_', '').slice(0, 20)}_${priceData.price_list_id.replace('plist_', '').slice(0, 10)}_${priceData.currency_code}`
        const amountCents = Math.round(priceData.amount)

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
          priceData.price_list_id,
          priceData.currency_code.toLowerCase(),
          amountCents,
          JSON.stringify({
            value: amountCents.toString(),
            precision: 20
          })
        ])

        updatedPrices.push(priceId)
      }

      res.json({
        success: true,
        updated_prices: updatedPrices,
      })
    } finally {
      await client.end()
    }
  } catch (error: any) {
    console.error("Error updating Price List prices:", error)
    res.status(500).json({
      error: "Failed to update Price List prices",
      message: error.message,
    })
  }
}
