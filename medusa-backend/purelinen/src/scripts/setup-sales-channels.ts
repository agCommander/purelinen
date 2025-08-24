export default async function setupSalesChannels({ container }) {
  try {
    const salesChannelService = container.resolve("sales_channel")
    const apiKeyService = container.resolve("api_key")
    
    // Create sales channels for both stores
    const purelinenChannel = await salesChannelService.createSalesChannels({
      name: "Pure Linen Store",
      description: "Pure Linen bedding and home textiles",
      is_disabled: false,
    })
    
    const linenthingsChannel = await salesChannelService.createSalesChannels({
      name: "Linen Things Store", 
      description: "Linen Things home essentials",
      is_disabled: false,
    })
    
    console.log("✅ Sales channels created:")
    console.log(`  - Pure Linen: ${purelinenChannel.id}`)
    console.log(`  - Linen Things: ${linenthingsChannel.id}`)
    
    // Get the API key and associate it with both channels
    const apiKeys = await apiKeyService.listApiKeys()
    const publishableKey = apiKeys.find(key => key.type === "publishable")
    
    if (publishableKey) {
      await apiKeyService.updateApiKeys(publishableKey.id, {
        sales_channels: [
          { id: purelinenChannel.id },
          { id: linenthingsChannel.id }
        ]
      })
      
      console.log(`✅ API key ${publishableKey.redacted} associated with both sales channels`)
    }
    
  } catch (error) {
    console.error("❌ Error setting up sales channels:", error)
  }
} 