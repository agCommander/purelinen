export default async function listApiKeys({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    
    const apiKeys = await apiKeyService.listApiKeys()
    
    console.log("🔍 Existing API Keys:")
    apiKeys.forEach(key => {
      console.log(`  - ID: ${key.id}`)
      console.log(`    Title: ${key.title}`)
      console.log(`    Type: ${key.type}`)
      console.log(`    Token: ${key.token}`)
      console.log(`    Redacted: ${key.redacted}`)
      console.log(`    Created: ${key.created_at}`)
      console.log("")
    })
    
  } catch (error) {
    console.error("❌ Error listing API keys:", error)
  }
} 