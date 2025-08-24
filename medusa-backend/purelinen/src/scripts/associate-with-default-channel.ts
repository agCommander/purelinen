export default async function associateWithDefaultChannel({ container }) {
  try {
    const productService = container.resolve("product")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get the default sales channel
    const salesChannels = await salesChannelService.listSalesChannels()
    const defaultChannel = salesChannels.find(sc => sc.name === "Default Sales Channel")
    
    if (!defaultChannel) {
      console.error("❌ Could not find Default Sales Channel")
      return
    }
    
    console.log(`🏪 Using Default Sales Channel: ${defaultChannel.id}`)
    
    // Get all products
    const products = await productService.listProducts()
    console.log(`🔍 Found ${products.length} products to associate`)
    
    // Associate all products with the default channel
    let updatedCount = 0
    for (const product of products) {
      try {
        await productService.updateProducts(product.id, {
          sales_channels: [{ id: defaultChannel.id }]
        })
        updatedCount++
        
        if (updatedCount % 100 === 0) {
          console.log(`✅ Updated ${updatedCount} products...`)
        }
      } catch (error) {
        console.error(`❌ Error updating product ${product.id}:`, error.message)
      }
    }
    
    console.log(`✅ Successfully associated ${updatedCount} products with Default Sales Channel`)
    
  } catch (error) {
    console.error("❌ Error associating products with default channel:", error)
  }
} 