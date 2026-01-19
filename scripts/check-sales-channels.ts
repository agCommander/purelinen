export default async function checkSalesChannels({ container }) {
  try {
    const salesChannelService = container.resolve("sales_channel")
    const apiKeyService = container.resolve("api_key")
    
    // Get sales channels
    const salesChannels = await salesChannelService.listSalesChannels()
    console.log("🔍 Sales Channels:")
    salesChannels.forEach(channel => {
      console.log(`  - ID: ${channel.id}`)
      console.log(`    Name: ${channel.name}`)
      console.log(`    Description: ${channel.description}`)
      console.log("")
    })
    
    // Get API keys
    const apiKeys = await apiKeyService.listApiKeys()
    console.log("🔍 API Keys:")
    apiKeys.forEach(key => {
      console.log(`  - ID: ${key.id}`)
      console.log(`    Title: ${key.title}`)
      console.log(`    Type: ${key.type}`)
      console.log(`    Token: ${key.token}`)
      console.log(`    Sales Channels: ${key.sales_channels?.length || 0}`)
      if (key.sales_channels) {
        key.sales_channels.forEach(sc => {
          console.log(`      - ${sc.id}`)
        })
      }
      console.log("")
    })
    
  } catch (error) {
    console.error("❌ Error checking sales channels:", error)
  }
} 