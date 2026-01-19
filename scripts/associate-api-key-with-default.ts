export default async function associateApiKeyWithDefault({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get the default sales channel
    const salesChannels = await salesChannelService.listSalesChannels()
    const defaultChannel = salesChannels.find(sc => sc.name === "Default Sales Channel")
    
    // Get the API key
    const apiKeys = await apiKeyService.listApiKeys()
    const publishableKey = apiKeys.find(key => key.type === "publishable")
    
    if (!defaultChannel || !publishableKey) {
      console.error("❌ Could not find Default Sales Channel or publishable API key")
      return
    }
    
    console.log(`🔧 Associating API key ${publishableKey.redacted} with Default Sales Channel`)
    
    // Associate the API key with the default channel
    await apiKeyService.updateApiKeys(publishableKey.id, {
      title: publishableKey.title,
      sales_channels: [{ id: defaultChannel.id }]
    })
    
    console.log("✅ API key associated with Default Sales Channel")
    
  } catch (error) {
    console.error("❌ Error associating API key with default channel:", error)
  }
} 