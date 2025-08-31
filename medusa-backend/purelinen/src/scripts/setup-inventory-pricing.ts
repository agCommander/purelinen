export default async function setupInventoryPricing() {
  const container = global.__MEDUSA_CONTAINER__
  const productService = container.resolve("productService")
  const inventoryService = container.resolve("inventoryService")
  const priceListService = container.resolve("priceListService")

  try {
    console.log("🚀 Setting up inventory and pricing...")

    // Get all products
    const products = await productService.list({}, { take: 1000 })
    console.log(`📦 Found ${products.length} products to update`)

    // Create price lists for B2B and Retail
    console.log("💰 Creating price lists...")
    
    const retailPriceList = await priceListService.create({
      name: "Retail Pricing",
      description: "Standard retail pricing for Linen Things",
      type: "sale",
      status: "active"
    })
    console.log("✅ Created Retail Price List:", retailPriceList.id)

    const b2bPriceList = await priceListService.create({
      name: "B2B Wholesale Pricing", 
      description: "Wholesale pricing for Pure Linen B2B",
      type: "sale",
      status: "active"
    })
    console.log("✅ Created B2B Price List:", b2bPriceList.id)

    // Update each product with inventory and pricing
    let updatedCount = 0
    for (const product of products) {
      try {
        // Set inventory (random stock between 10-100)
        const stockQuantity = Math.floor(Math.random() * 91) + 10
        
        // Update inventory for each variant
        for (const variant of product.variants) {
          await inventoryService.createInventoryLevel({
            inventory_item_id: variant.inventory_item_id,
            location_id: "loc_default", // Default location
            stocked_quantity: stockQuantity
          })
        }

        // Set retail pricing (random price between $20-200)
        const retailPrice = Math.floor(Math.random() * 181) + 20
        
        // Set B2B pricing (60% of retail price for wholesale)
        const b2bPrice = Math.floor(retailPrice * 0.6)

        // Add prices to price lists
        await priceListService.addPrices(retailPriceList.id, [{
          variant_id: product.variants[0].id,
          amount: retailPrice * 100, // Amount in cents
          currency_code: "usd"
        }])

        await priceListService.addPrices(b2bPriceList.id, [{
          variant_id: product.variants[0].id,
          amount: b2bPrice * 100, // Amount in cents
          currency_code: "usd"
        }])

        updatedCount++
        if (updatedCount % 100 === 0) {
          console.log(`✅ Updated ${updatedCount} products...`)
        }

      } catch (error) {
        console.log(`⚠️ Error updating product ${product.title}:`, error.message)
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products!`)
    console.log(`📊 Retail Price List ID: ${retailPriceList.id}`)
    console.log(`📊 B2B Price List ID: ${b2bPriceList.id}`)
    console.log("\n📋 Next Steps:")
    console.log("1. Assign price lists to sales channels")
    console.log("2. Test your storefronts")
    console.log("3. Pure Linen should show B2B pricing")
    console.log("4. Linen Things should show retail pricing")

  } catch (error) {
    console.error("❌ Error setting up inventory and pricing:", error)
  }
}
