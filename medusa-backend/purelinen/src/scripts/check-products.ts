export default async function checkProducts({ container }) {
  try {
    const productService = container.resolve("product")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get all products
    const products = await productService.listProducts()
    console.log(`🔍 Found ${products.length} products in database`)
    
    // Get sales channels
    const salesChannels = await salesChannelService.listSalesChannels()
    console.log(`🏪 Found ${salesChannels.length} sales channels`)
    
    // Check first few products
    if (products.length > 0) {
      console.log("\n📦 Sample Products:")
      products.slice(0, 3).forEach(product => {
        console.log(`  - ID: ${product.id}`)
        console.log(`    Title: ${product.title}`)
        console.log(`    Status: ${product.status}`)
        console.log(`    Sales Channels: ${product.sales_channels?.length || 0}`)
        if (product.sales_channels) {
          product.sales_channels.forEach(sc => {
            console.log(`      - ${sc.id}`)
          })
        }
        console.log("")
      })
    }
    
    // Check sales channels
    console.log("🏪 Sales Channels:")
    salesChannels.forEach(channel => {
      console.log(`  - ID: ${channel.id}`)
      console.log(`    Name: ${channel.name}`)
      console.log(`    Products: ${channel.products?.length || 0}`)
      console.log("")
    })
    
  } catch (error) {
    console.error("❌ Error checking products:", error)
  }
} 