export default async function inspectApiKeyService({ container }) {
  try {
    const apiKeyService = container.resolve("api_key")
    
    console.log("🔍 API Key Service methods:")
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(apiKeyService)))
    
    console.log("\n🔍 API Key Service properties:")
    console.log(Object.keys(apiKeyService))
    
  } catch (error) {
    console.error("❌ Error inspecting API key service:", error)
  }
} 