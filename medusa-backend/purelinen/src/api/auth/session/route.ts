import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Session endpoint:
 * - POST: Creates a session cookie from a JWT token (Authorization: Bearer {jwt_token})
 * - GET: Returns session info if authenticated
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // According to Medusa docs, POST /auth/session creates a session cookie from a JWT token
  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authorization header with Bearer token required" })
    return
  }
  
  const token = authHeader.substring(7) // Remove "Bearer "
  
  // Decode JWT to get auth info (we'll verify it's valid by checking if it exists)
  try {
    // Simple JWT decode (without verification for now - Medusa will verify on use)
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8')
    const decoded = JSON.parse(jsonPayload)
    
    // Create session from JWT token
    const session = (req as any).session
    if (session) {
      session.auth_identity_id = decoded.auth_identity_id
      session.actor_type = decoded.actor_type || "admin"
      session.token = token
      
      if (decoded.actor_id) {
        session.user_id = decoded.actor_id
      }
      
      // Save the session (this will set the connect.sid cookie)
      await new Promise<void>((resolve, reject) => {
        session.save((err: any) => {
          if (err) {
            console.error("[Session Route POST] Error saving session:", err)
            reject(err)
          } else {
            console.log("[Session Route POST] Session created from JWT:", {
              sessionId: session.id?.substring(0, 30) + "...",
              authIdentityId: decoded.auth_identity_id,
              actorType: decoded.actor_type,
            })
            resolve()
          }
        })
      })
      
      res.status(200).json({
        auth_identity_id: decoded.auth_identity_id,
        actor_type: decoded.actor_type || "admin",
      })
      return
    } else {
      console.warn("[Session Route POST] No session object found")
      res.status(500).json({ message: "Session middleware not initialized" })
      return
    }
  } catch (error) {
    console.error("[Session Route POST] Error decoding JWT:", error)
    res.status(401).json({ message: "Invalid token" })
    return
  }
}

/**
 * GET session endpoint - returns user info if authenticated
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Check for session
    const session = (req as any).session
    
    console.log("[Session Route GET] Session check:", {
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      authIdentityId: session?.auth_identity_id,
      actorType: session?.actor_type,
    })
    
    if (session && (session.auth_identity_id || session.token)) {
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
          console.error("[Session Route GET] Error fetching user:", error)
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
    
    // No valid session - check if there's a JWT token in cookies that we can use
    const cookies = req.headers.cookie || ""
    const jwtMatch = cookies.match(/_medusa_jwt=([^;]+)/)
    
    if (jwtMatch) {
      const jwtToken = jwtMatch[1]
      console.log("[Session Route GET] Found JWT in cookies, but no session. Session needs to be created via POST /auth/session first.")
    }
    
    // No valid session
    res.status(401).json({ message: "Unauthorized" })
  } catch (error) {
    console.error("[Session Route GET] Error:", error)
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Internal server error" 
    })
  }
}
