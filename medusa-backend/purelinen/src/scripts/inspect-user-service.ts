export default async function inspectUserService({ container }) {
  try {
    console.log("🔍 Inspecting user service...")
    
    const userService = container.resolve("user")
    console.log("User service:", userService)
    console.log("User service type:", typeof userService)
    console.log("User service methods:", Object.getOwnPropertyNames(userService))
    console.log("User service prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(userService)))
    
    // Try to see if it's a class or object
    if (typeof userService === 'function') {
      console.log("User service is a function/class")
    } else if (typeof userService === 'object') {
      console.log("User service is an object")
      console.log("Available keys:", Object.keys(userService))
    }
    
  } catch (error) {
    console.error("❌ Error inspecting user service:", error)
  }
}
