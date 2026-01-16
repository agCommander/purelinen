import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom API route to fetch product with variants and ensure prices are always loaded
 * This fixes the issue where variant.prices is undefined in Medusa's core pricing component
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const productId = req.params.id

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" })
    }

    // Resolve product service
    const productService = req.scope.resolve(Modules.PRODUCT) as any
    const pricingModuleService = req.scope.resolve(Modules.PRICING) as any

    // Fetch product with variants
    const product = await productService.retrieveProduct(productId, {
      relations: [
        "options",
        "options.values",
        "variants",
        "variants.options",
      ],
    })

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Fetch price sets for all variants
    const variantIds = product.variants?.map((v: any) => v.id) || []
    
    if (variantIds.length === 0) {
      return res.json({ product })
    }

    // Get price_set_id for each variant from junction table
    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL
    const client = new Client({ connectionString })
    await client.connect()

    const priceSetMap = new Map<string, string>()
    const priceSetIds: string[] = []

    for (const variantId of variantIds) {
      const result = await client.query(`
        SELECT price_set_id
        FROM product_variant_price_set
        WHERE variant_id = $1 AND deleted_at IS NULL
        LIMIT 1
      `, [variantId])

      if (result.rows.length > 0) {
        const priceSetId = result.rows[0].price_set_id
        priceSetMap.set(variantId, priceSetId)
        if (!priceSetIds.includes(priceSetId)) {
          priceSetIds.push(priceSetId)
        }
      }
    }

    await client.end()

    // Fetch prices for all price sets
    const pricesMap = new Map<string, any[]>()
    
    if (priceSetIds.length > 0) {
      const prices = await pricingModuleService.listPrices({
        price_set_id: priceSetIds,
      })

      // Group prices by price_set_id
      for (const price of prices || []) {
        const priceSetId = price.price_set_id
        if (!pricesMap.has(priceSetId)) {
          pricesMap.set(priceSetId, [])
        }
        pricesMap.get(priceSetId)!.push(price)
      }
    }

    // Attach prices to variants
    const variantsWithPrices = product.variants.map((variant: any) => {
      const priceSetId = priceSetMap.get(variant.id)
      const prices = priceSetId ? (pricesMap.get(priceSetId) || []) : []
      
      return {
        ...variant,
        prices: prices.map((p: any) => ({
          id: p.id,
          amount: p.amount,
          currency_code: p.currency_code,
          rules: p.rules || {},
        })),
      }
    })

    // Return product with variants that have prices
    return res.json({
      product: {
        ...product,
        variants: variantsWithPrices,
      },
    })
  } catch (error: any) {
    console.error("Error fetching product with prices:", error)
    return res.status(500).json({
      error: "Failed to fetch product",
      message: error.message,
    })
  }
}
