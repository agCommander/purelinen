export default async function associateApiKey({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get the API key and sales channels
    const apiKeys = await apiKeyService.listApiKeys()
    const publishableKey = apiKeys.find(key => key.type === "publishable")
    const salesChannels = await salesChannelService.listSalesChannels()
    
    if (publishableKey && salesChannels.length > 0) {
      await apiKeyService.updateApiKeys(publishableKey.id, {
        title: publishableKey.title, // Keep the existing title
        sales_channels: salesChannels.map(channel => ({ id: channel.id }))
      })
      
      console.log(`✅ API key ${publishableKey.redacted} associated with ${salesChannels.length} sales channels`)
    }
    
  } catch (error) {
    console.error("❌ Error associating API key:", error)
  }
} 