import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("👤 Creating admin user...")
  
  try {
    // Try to get the user service
    const userService = container.resolve("user")
    
    // Create admin user
    const adminUser = await userService.create({
      email: "admin@purelinen.com.au",
      password: "admin123",
      role: "admin",
      first_name: "Admin",
      last_name: "User"
    })
    
    logger.info("✅ Admin user created successfully!")
    logger.info(`📧 Email: admin@purelinen.com.au`)
    logger.info(`🔑 Password: admin123`)
    logger.info("🌐 You can now log in at: http://localhost:9000/app")
    
  } catch (error) {
    logger.error("❌ Error creating admin user:", error.message)
    
    // Try alternative approach - check if user already exists
    try {
      const userService = container.resolve("user")
      const existingUser = await userService.retrieveByEmail("admin@purelinen.com.au")
      
      if (existingUser) {
        logger.info("✅ Admin user already exists!")
        logger.info(`📧 Email: admin@purelinen.com.au`)
        logger.info(`🔑 Password: admin123`)
        logger.info("🌐 You can now log in at: http://localhost:9000/app")
      }
    } catch (retrieveError) {
      logger.error("❌ Could not retrieve existing user:", retrieveError.message)
    }
  }
}
