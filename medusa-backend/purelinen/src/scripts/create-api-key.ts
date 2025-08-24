export default async function createApiKey({ container }) {
  try {
    // Create a publishable API key
    const apiKeyService = container.resolve("api_key")
    
    const apiKey = await apiKeyService.createApiKeys({
      title: "Storefront API Key",
      type: "publishable",
    })
    
    console.log("✅ Publishable API Key created successfully!")
    console.log(`🔑 Key: ${apiKey.token}`)
    console.log("\n📝 Add this to your storefront .env files:")
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}`)
    
  } catch (error) {
    console.error("❌ Error creating API key:", error)
  }
} 