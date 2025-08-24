export default async function fixProductAssociations({ container }) {
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
    
    console.log(`🏪 Will associate products with:`)
    console.log(`  - Pure Linen: ${purelinenChannel.id}`)
    console.log(`  - Linen Things: ${linenthingsChannel.id}`)
    
    // Associate all products with both channels using direct database insertion
    let updatedCount = 0
    for (const product of products) {
      try {
        // Add to Pure Linen channel
        await productService.updateProducts(product.id, {
          sales_channels: [{ id: purelinenChannel.id }]
        })
        
        // Add to Linen Things channel
        await productService.updateProducts(product.id, {
          sales_channels: [{ id: linenthingsChannel.id }]
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
    console.log(`📊 Expected rows in product_sales_channel: ${updatedCount * 2}`)
    
  } catch (error) {
    console.error("❌ Error fixing product associations:", error)
  }
} 