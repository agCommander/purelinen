import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function resetAdminPassword({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🔑 Resetting admin password...")
  
  try {
    // Try to get the auth service
    const authService = container.resolve("auth")
    
    logger.info("Available auth service methods:", Object.getOwnPropertyNames(authService))
    logger.info("Available auth service prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(authService)))
    
    // Try to reset password for existing user
    const email = "admin@purelinen.com.au"
    const newPassword = "admin123"
    
    logger.info(`Attempting to reset password for: ${email}`)
    
    // This might not work, but let's try different approaches
    if (authService.updateAuthUser) {
      const result = await authService.updateAuthUser(email, { password: newPassword })
      logger.info("✅ Password reset successful!")
    } else if (authService.resetPassword) {
      const result = await authService.resetPassword(email, newPassword)
      logger.info("✅ Password reset successful!")
    } else {
      logger.info("⚠️ No password reset method found on auth service")
    }
    
  } catch (error) {
    logger.error("❌ Error resetting password:", error.message)
    
    // Try alternative approach
    try {
      logger.info("🔍 Trying alternative approach...")
      
      // Try to access the auth service differently
      const allServices = Object.keys(container.registrations)
      logger.info("Available services containing 'auth':", allServices.filter(s => s.includes('auth')))
      
    } catch (altError) {
      logger.error("❌ Alternative approach failed:", altError.message)
    }
  }
}
