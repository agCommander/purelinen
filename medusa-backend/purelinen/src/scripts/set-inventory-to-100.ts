import { ExecArgs } from "@medusajs/framework"

export default async function setInventoryTo100({ container }: ExecArgs) {
  const inventoryService = container.resolve("inventoryService")
  const productService = container.resolve("productService")
  const stockLocationService = container.resolve("stockLocationService")

  try {
    console.log("🚀 Setting inventory to 100 for all product variants...")

    // Get or create default location
    let defaultLocation
    try {
      const locations = await stockLocationService.list({})
      defaultLocation = locations.find(loc => loc.id === "loc_default" || loc.name === "Default Location")
      
      if (!defaultLocation) {
        defaultLocation = locations[0] || await stockLocationService.create({
          id: "loc_default",
          name: "Default Location"
        })
      }
    } catch (error) {
      console.log("⚠️ Could not get locations, trying to create default...")
      defaultLocation = await stockLocationService.create({
        id: "loc_default",
        name: "Default Location"
      })
    }

    console.log(`📍 Using location: ${defaultLocation.id} (${defaultLocation.name})`)

    // Get all products with their variants
    const products = await productService.list({}, { 
      relations: ["variants"],
      take: 10000 
    })

    console.log(`📦 Found ${products.length} products to process`)

    let updatedCount = 0
    let errorCount = 0

    for (const product of products) {
      for (const variant of product.variants || []) {
        try {
          if (!variant.inventory_item_id) {
            console.log(`⚠️ Variant ${variant.id} (${variant.sku || 'no SKU'}) has no inventory_item_id, skipping...`)
            continue
          }

          // Check if inventory level exists
          const existingLevel = await inventoryService.retrieveInventoryLevel(
            variant.inventory_item_id,
            defaultLocation.id
          ).catch(() => null)

          if (existingLevel) {
            // Update existing inventory level
            await inventoryService.updateInventoryLevels({
              inventory_item_id: variant.inventory_item_id,
              location_id: defaultLocation.id,
              stocked_quantity: 100
            })
          } else {
            // Create new inventory level
            await inventoryService.createInventoryLevel({
              inventory_item_id: variant.inventory_item_id,
              location_id: defaultLocation.id,
              stocked_quantity: 100
            })
          }

          updatedCount++
          
          if (updatedCount % 50 === 0) {
            console.log(`✅ Updated ${updatedCount} variants...`)
          }
        } catch (error) {
          errorCount++
          console.log(`⚠️ Error updating variant ${variant.id}:`, error.message)
        }
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} variants!`)
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} variants had errors`)
    }
    console.log(`\n📋 Next steps:`)
    console.log(`1. Refresh your storefront`)
    console.log(`2. Products should now appear in category pages`)

  } catch (error) {
    console.error("❌ Error setting inventory:", error)
    throw error
  }
}

