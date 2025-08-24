export default async function listServices({ container }) {
  try {
    console.log("🔍 Available services in container:")
    
    // Get all registered services
    const registrations = container.registrations
    Object.keys(registrations).forEach(key => {
      console.log(`  - ${key}`)
    })
    
  } catch (error) {
    console.error("❌ Error listing services:", error)
  }
} 