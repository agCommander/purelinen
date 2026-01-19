import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * This script ensures all product variants have base prices set.
 * Base prices are required before variants can be added to Price Lists.
 * 
 * Run this BEFORE creating Price Lists or adding variants to Price Lists.
 */
export default async function setBasePricesForVariants({ container }: ExecArgs) {
  try {
    console.log("🚀 Setting base prices for all variants...")

    // Try different service names
    let productService: any = null
    try {
      productService = container.resolve(Modules.PRODUCT) as any
    } catch (e) {
      try {
        productService = container.resolve("product") as any
      } catch (e2) {
        productService = container.resolve("productService") as any
      }
    }

    // Get all products with variants
    // Try different method names depending on which service was resolved
    let products: any[] = []
    if (typeof productService.listProducts === 'function') {
      products = await productService.listProducts({}, {
        relations: ["variants", "variants.prices"],
        take: 1000,
      })
    } else if (typeof productService.list === 'function') {
      products = await productService.list({}, {
        relations: ["variants", "variants.prices"],
        take: 1000,
      })
    } else {
      throw new Error("Product service doesn't have list or listProducts method")
    }

    console.log(`📦 Found ${products.length} products to check`)

    let updatedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) {
        skippedCount++
        continue
      }

      for (const variant of product.variants) {
        try {
          // Check if variant already has prices
          // Also check if prices array exists and has valid entries
          const hasPrices = variant.prices && 
                           Array.isArray(variant.prices) && 
                           variant.prices.length > 0 &&
                           variant.prices.some((p: any) => p.amount !== undefined && p.currency_code)

          if (hasPrices) {
            // Variant already has prices, skip
            skippedCount++
            continue
          }

          // Also check if variant has price_set_id (from Magento migration)
          // If it has price_set_id but no prices array, that's a data structure issue
          if (variant.price_set_id && (!variant.prices || variant.prices.length === 0)) {
            console.log(`⚠️  Variant ${variant.id} (${variant.sku || 'no SKU'}) has price_set_id but no prices array`)
            errors.push(`Variant ${variant.id}: Has price_set_id (${variant.price_set_id}) but no prices array - may need manual fix`)
            skippedCount++
            continue
          }

          // Set a default price (you can adjust this logic)
          // For now, we'll set a placeholder price that you can update later
          const defaultPrice = 10000 // $100.00 in cents

          // Update variant with prices
          // Note: This uses the same pattern as the auto-gen-variants widget
          await productService.updateVariants([{
            id: variant.id,
            prices: [{
              currency_code: "usd", // Default currency - adjust if needed
              amount: defaultPrice,
            }],
          }])

          updatedCount++
          
          if (updatedCount % 50 === 0) {
            console.log(`✅ Updated ${updatedCount} variants...`)
          }

        } catch (error: any) {
          errors.push(`Variant ${variant.id} (${variant.sku || 'no SKU'}): ${error.message}`)
        }
      }
    }

    console.log(`\n🎉 Base prices setup complete!`)
    console.log(`   • Updated: ${updatedCount} variants`)
    console.log(`   • Skipped: ${skippedCount} variants (already had prices)`)
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} errors occurred:`)
      errors.slice(0, 10).forEach(err => console.log(`   • ${err}`))
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`)
      }
    }

    console.log(`\n📋 Next Steps:`)
    console.log(`1. Review variant prices in Admin → Products → [Product] → Variants`)
    console.log(`2. Update prices as needed`)
    console.log(`3. Now you can create Price Lists and add variants to them`)

  } catch (error: any) {
    console.error("❌ Error setting base prices:", error.message)
    throw error
  }
}
