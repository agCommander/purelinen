export default async function fixApiKeyAssociation({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get the API key and sales channels
    const apiKeys = await apiKeyService.listApiKeys()
    const publishableKey = apiKeys.find(key => key.type === "publishable")
    const salesChannels = await salesChannelService.listSalesChannels()
    
    if (publishableKey && salesChannels.length > 0) {
      console.log(`🔧 Associating API key ${publishableKey.redacted} with ${salesChannels.length} sales channels`)
      
      // Try to update with sales channel IDs
      const salesChannelIds = salesChannels.map(channel => channel.id)
      
      await apiKeyService.updateApiKeys(publishableKey.id, {
        title: publishableKey.title,
        sales_channels: salesChannelIds
      })
      
      console.log("✅ API key association updated")
      
      // Verify the association
      const updatedKey = await apiKeyService.retrieveApiKey(publishableKey.id)
      console.log(`📊 Updated API key has ${updatedKey.sales_channels?.length || 0} sales channels`)
      
    } else {
      console.log("❌ No publishable key or sales channels found")
    }
    
  } catch (error) {
    console.error("❌ Error fixing API key association:", error)
  }
} 