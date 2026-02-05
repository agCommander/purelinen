import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }

    const userModuleService = req.scope.resolve(Modules.USER)
    const authModuleService = req.scope.resolve(Modules.AUTH)

    // Find user
    const users = await userModuleService.listUsers({ email })
    if (!users || users.length === 0) {
      res.status(404).json({ error: `User ${email} not found` })
      return
    }

    const user = users[0]

    // Find or create auth identity
    let authIdentity
    const authIdentities = await authModuleService.listAuthIdentities({
      app_metadata: { user_id: user.id }
    })
    
    if (authIdentities && authIdentities.length > 0) {
      authIdentity = authIdentities[0]
    } else {
      authIdentity = await authModuleService.createAuthIdentities({
        app_metadata: { user_id: user.id }
      })
    }

    // Find existing provider identity
    const providerIdentities = await authModuleService.listProviderIdentities({
      entity_id: email,
      provider: "emailpass"
    })

    if (providerIdentities && providerIdentities.length > 0) {
      // Update password - pass plain password, Medusa's auth API should hash it
      await authModuleService.updateProviderIdentities({
        id: providerIdentities[0].id,
        provider_metadata: {
          password: password
        }
      })
    } else {
      // Create provider identity
      await authModuleService.createProviderIdentities({
        entity_id: email,
        provider: "emailpass",
        auth_identity_id: authIdentity.id,
        provider_metadata: {
          password: password
        }
      })
    }

    res.json({ 
      success: true, 
      message: `Password reset successful for ${email}` 
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    res.status(500).json({ 
      error: "Failed to reset password",
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
