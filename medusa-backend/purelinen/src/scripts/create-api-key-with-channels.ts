export default async function createApiKeyWithChannels({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    const userService = container.resolve("user")
    const salesChannelService = container.resolve("sales_channel")
    
    // Get the first user to use as created_by
    const users = await userService.listUsers()
    const firstUser = users[0]
    
    // Get all sales channels
    const salesChannels = await salesChannelService.listSalesChannels()
    
    if (!firstUser) {
      console.error("❌ No users found. Please create a user first.")
      return
    }
    
    console.log(`👤 Using user: ${firstUser.email} as created_by`)
    console.log(`🏪 Found ${salesChannels.length} sales channels`)
    
    // Create a publishable API key with sales channels
    const apiKey = await apiKeyService.createApiKeys({
      title: "Storefront API Key with Channels",
      type: "publishable",
      created_by: firstUser.id,
      sales_channels: salesChannels.map(channel => ({ id: channel.id }))
    })
    
    console.log("✅ Publishable API Key created successfully!")
    console.log(`🔑 Key: ${apiKey.token}`)
    console.log(`📊 Associated with ${apiKey.sales_channels?.length || 0} sales channels`)
    console.log("\n📝 Add this to your storefront .env files:")
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}`)
    
  } catch (error) {
    console.error("❌ Error creating API key:", error)
  }
} 