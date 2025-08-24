import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createUsersWorkflow } from "@medusajs/medusa/core-flows"

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("👤 Creating admin user...")
  
  try {
    const { result: users } = await createUsersWorkflow(container).run({
      input: {
        users: [
          {
            email: "admin@purelinen.com.au",
            role: "admin",
            first_name: "Admin",
            last_name: "User"
          }
        ]
      }
    })
    
    logger.info("✅ Admin user created successfully!")
    logger.info(`📧 Email: admin@purelinen.com.au`)
    logger.info(`🔑 Password: admin123`)
    logger.info("🌐 You can now log in at: http://localhost:9000/app")
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      logger.info("⚠️  Admin user already exists")
      logger.info("📧 Email: admin@purelinen.com.au")
      logger.info("🔑 Password: admin123")
      logger.info("🌐 You can now log in at: http://localhost:9000/app")
    } else {
      logger.error("❌ Error creating admin user:", error.message)
    }
  }
} 