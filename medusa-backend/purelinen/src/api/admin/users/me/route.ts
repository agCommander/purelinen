// This file MUST be loaded - if you see this in compiled output, the route exists
console.log("[Admin Users Me Route] Custom /admin/users/me route file loaded")

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom /admin/users/me route to debug and handle session
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  console.log("=".repeat(60))
  console.log("[Admin Users Me Route] ===== CUSTOM ROUTE CALLED =====")
  console.log("[Admin Users Me Route] Request:", {
    method: req.method,
    path: req.path,
    hasCookies: !!req.headers.cookie,
    cookieHeader: req.headers.cookie?.substring(0, 200) + "...",
  })
  
  const session = (req as any).session
  const sessionID = (req as any).sessionID
  
  console.log("[Admin Users Me Route] Session check:", {
    hasSession: !!session,
    sessionID: sessionID?.substring(0, 30) + "...",
    authIdentityId: session?.auth_identity_id,
    actorType: session?.actor_type,
    sessionKeys: session ? Object.keys(session) : [],
  })
  
  // Check if session store can find it
  if (sessionID) {
    const sessionStore = (req as any).sessionStore
    if (sessionStore) {
      sessionStore.get(sessionID, (storeErr: any, storedSession: any) => {
        if (storeErr) {
          console.error("[Admin Users Me Route] Error getting session:", storeErr)
        } else if (storedSession) {
          console.log("[Admin Users Me Route] ✅ Session found in store:", {
            sessionId: sessionID?.substring(0, 30) + "...",
            hasAuthIdentityId: !!storedSession.auth_identity_id,
            keys: Object.keys(storedSession),
          })
        } else {
          console.error("[Admin Users Me Route] ❌ Session NOT in store!")
        }
      })
    }
  }
  
  // If we have a valid session, return user info
  if (session && session.auth_identity_id) {
    try {
      const authModuleService = req.scope.resolve(Modules.AUTH)
      const userModuleService = req.scope.resolve(Modules.USER)
      
      const authIdentities = await authModuleService.listAuthIdentities({
        id: session.auth_identity_id
      })
      
      if (authIdentities && authIdentities.length > 0) {
        const authIdentity = authIdentities[0]
        const userId = authIdentity.app_metadata?.user_id
        
        if (userId && typeof userId === "string") {
          const users = await userModuleService.listUsers({ id: userId })
          if (users && users.length > 0) {
            const user = users[0]
            
            console.log("[Admin Users Me Route] ✅ Returning user info")
            res.json({
              user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
              },
            })
            return
          }
        }
      }
    } catch (error) {
      console.error("[Admin Users Me Route] Error fetching user:", error)
    }
  }
  
  // No valid session
  console.log("[Admin Users Me Route] ❌ No valid session, returning 401")
  res.status(401).json({ message: "Unauthorized" })
}
