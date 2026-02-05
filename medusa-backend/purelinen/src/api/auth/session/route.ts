import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom /auth/session handler for admin panel
 * Reads session and returns user info if authenticated
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Check for session
    const session = (req as any).session
    
    if (session && (session.auth_identity_id || session.token)) {
      // Session exists - get user info
      const authIdentityId = session.auth_identity_id
      const token = session.token
      const actorType = session.actor_type || "admin"
      
      if (authIdentityId) {
        // Get user from auth identity
        const authModuleService = req.scope.resolve(Modules.AUTH)
        const userModuleService = req.scope.resolve(Modules.USER)
        
        try {
          const authIdentities = await authModuleService.listAuthIdentities({
            id: authIdentityId
          })
          
          if (authIdentities && authIdentities.length > 0) {
            const authIdentity = authIdentities[0]
            const userId = authIdentity.app_metadata?.user_id
            
            if (userId && typeof userId === "string") {
              const users = await userModuleService.listUsers({ id: userId })
              if (users && users.length > 0) {
                const user = users[0]
                
                // Return session info
                res.json({
                  user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                  },
                  auth_identity_id: authIdentityId,
                  actor_type: actorType,
                })
                return
              }
            }
          }
        } catch (error) {
          console.error("[Session Route] Error fetching user:", error)
        }
      }
      
      // If we have a token but no user, return token info
      if (token) {
        res.json({
          token: token,
          actor_type: actorType,
        })
        return
      }
    }
    
    // No valid session
    res.status(401).json({ message: "Unauthorized" })
  } catch (error) {
    console.error("[Session Route] Error:", error)
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Internal server error" 
    })
  }
}
