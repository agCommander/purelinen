export default async function associateProductsWithChannels({ container }) {
  try {
    const productService = container.resolve("product")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get all products and sales channels
    const products = await productService.listProducts()
    const salesChannels = await salesChannelService.listSalesChannels()
    
    console.log(`🔍 Found ${products.length} products and ${salesChannels.length} sales channels`)
    
    // Get the Pure Linen and Linen Things channels
    const purelinenChannel = salesChannels.find(sc => sc.name === "Pure Linen Store")
    const linenthingsChannel = salesChannels.find(sc => sc.name === "Linen Things Store")
    
    if (!purelinenChannel || !linenthingsChannel) {
      console.error("❌ Could not find Pure Linen or Linen Things sales channels")
      return
    }
    
    console.log(`🏪 Associating products with channels:`)
    console.log(`  - Pure Linen: ${purelinenChannel.id}`)
    console.log(`  - Linen Things: ${linenthingsChannel.id}`)
    
    // Associate all products with both channels
    let updatedCount = 0
    for (const product of products) {
      try {
        await productService.updateProducts(product.id, {
          sales_channels: [
            { id: purelinenChannel.id },
            { id: linenthingsChannel.id }
          ]
        })
        updatedCount++
        
        if (updatedCount % 100 === 0) {
          console.log(`✅ Updated ${updatedCount} products...`)
        }
      } catch (error) {
        console.error(`❌ Error updating product ${product.id}:`, error.message)
      }
    }
    
    console.log(`✅ Successfully associated ${updatedCount} products with both sales channels`)
    
  } catch (error) {
    console.error("❌ Error associating products with channels:", error)
  }
} 