export default async function createSecretKey({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    const userService = container.resolve("user")
    
    // Get the first user to use as created_by
    const users = await userService.listUsers()
    const firstUser = users[0]
    
    if (!firstUser) {
      console.error("❌ No users found. Please create a user first.")
      return
    }
    
    console.log(`👤 Using user: ${firstUser.email} as created_by`)
    
    // Create a secret API key (might not require sales channels)
    const apiKey = await apiKeyService.createApiKeys({
      title: "Secret API Key for Testing",
      type: "secret",
      created_by: firstUser.id,
    })
    
    console.log("✅ Secret API Key created successfully!")
    console.log(`🔑 Key: ${apiKey.token}`)
    console.log("\n📝 Add this to your storefront .env files:")
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}`)
    
  } catch (error) {
    console.error("❌ Error creating secret API key:", error)
  }
} 