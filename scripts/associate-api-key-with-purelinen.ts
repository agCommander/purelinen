export default async function associateApiKeyWithPureLinen({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get the Pure Linen Store sales channel
    const salesChannels = await salesChannelService.listSalesChannels()
    const pureLinenChannel = salesChannels.find(sc => sc.name === "Pure Linen Store")
    
    // Get the API key
    const apiKeys = await apiKeyService.listApiKeys()
    const publishableKey = apiKeys.find(key => key.type === "publishable")
    
    if (!pureLinenChannel || !publishableKey) {
      console.error("❌ Could not find Pure Linen Store sales channel or publishable API key")
      if (!pureLinenChannel) {
        console.error("Available sales channels:")
        salesChannels.forEach(sc => console.error(`  - ${sc.name} (${sc.id})`))
      }
      return
    }
    
    console.log(`🔧 Associating API key ${publishableKey.redacted} with Pure Linen Store sales channel`)
    console.log(`   Sales Channel ID: ${pureLinenChannel.id}`)
    
    // Associate the API key with ONLY the Pure Linen Store channel
    await apiKeyService.updateApiKeys(publishableKey.id, {
      title: publishableKey.title,
      sales_channels: [{ id: pureLinenChannel.id }]
    })
    
    console.log("✅ API key associated with Pure Linen Store sales channel only")
    console.log("   This means you don't need to specify sales_channel_id in API requests")
    
  } catch (error) {
    console.error("❌ Error associating API key with Pure Linen Store channel:", error)
  }
}

