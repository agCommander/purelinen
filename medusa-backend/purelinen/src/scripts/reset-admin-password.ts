import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function resetAdminPassword({ container, args }: ExecArgs) {
  try {
    const userModuleService = container.resolve(Modules.USER)
    const authModuleService = container.resolve(Modules.AUTH)

    const email = args?.[0] || "admin@purelinen.com.au"
    const newPassword = args?.[1] || "Admin123!"

    console.log(`Resetting password for ${email}...`)

    // Hash password using scrypt with the same parameters Medusa uses
    // Based on existing hashes (starting with c2NyeXB0AA8), Medusa uses logN=15, r=8, p=1
    // Use require for scrypt-kdf as it doesn't work with ES6 imports
    const scrypt = require("scrypt-kdf")
    const passwordHashBuffer = await scrypt.kdf(newPassword, {
      logN: 15,
      r: 8,
      p: 1
    })
    // Convert to base64 string (same format as Medusa stores)
    const passwordHash = passwordHashBuffer.toString("base64")
    
    console.log(`Password hash generated (first 50 chars): ${passwordHash.substring(0, 50)}...`)

    // Find user
    const users = await userModuleService.listUsers({ email })
    if (!users || users.length === 0) {
      console.error(`User ${email} not found`)
      return
    }

    const user = users[0]
    console.log(`Found user: ${user.id}`)

    // Find or create auth identity
    let authIdentity
    try {
      const authIdentities = await authModuleService.listAuthIdentities({
        app_metadata: { user_id: user.id }
      })
      
      if (authIdentities && authIdentities.length > 0) {
        authIdentity = authIdentities[0]
        console.log(`Found auth identity: ${authIdentity.id}`)
      } else {
        // Create auth identity
        authIdentity = await authModuleService.createAuthIdentities({
          app_metadata: { user_id: user.id }
        })
        console.log(`Created auth identity: ${authIdentity.id}`)
      }
    } catch (error) {
      console.error("Error with auth identity:", error)
      throw error
    }

    // Find existing provider identity
    const providerIdentities = await authModuleService.listProviderIdentities({
      entity_id: email,
      provider: "emailpass"
    })

    if (providerIdentities && providerIdentities.length > 0) {
      // Update password with pre-hashed scrypt value
      await authModuleService.updateProviderIdentities({
        id: providerIdentities[0].id,
        provider_metadata: {
          password: passwordHash
        }
      })
      console.log(`Updated password for provider identity with scrypt hash`)
    } else {
      // Create provider identity with pre-hashed scrypt value
      await authModuleService.createProviderIdentities({
        entity_id: email,
        provider: "emailpass",
        auth_identity_id: authIdentity.id,
        provider_metadata: {
          password: passwordHash
        }
      })
      console.log(`Created provider identity with scrypt hashed password`)
    }

    console.log(`✅ Password reset successful for ${email}`)
    console.log(`New password: ${newPassword}`)
    console.log(`\n⚠️  Note: If login still fails, Medusa may not hash passwords automatically.`)
    console.log(`   You may need to use the admin UI or API to reset the password.`)
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}
