// This file MUST be loaded - if you see this in compiled output, the route exists
console.log("[Admin Users Me Route] Custom /admin/users/me route file loaded")

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom /admin/users/me route to debug and handle session
 * This route SHOULD take precedence over Medusa's built-in route
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // CRITICAL: This log MUST appear if the route is being called
  console.log("=".repeat(80))
  console.log("[Admin Users Me Route] ===== CUSTOM ROUTE CALLED =====")
  console.log("[Admin Users Me Route] ===== IF YOU DON'T SEE THIS, THE ROUTE ISN'T BEING CALLED =====")
  console.log("[Admin Users Me Route] Request:", {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: (req as any).originalUrl,
    hasCookies: !!req.headers.cookie,
    cookieHeader: req.headers.cookie ? req.headers.cookie.substring(0, 200) + "..." : "NO COOKIES",
  })
  
  // Manually parse the cookie to see what's being sent
  const cookieHeader = req.headers.cookie || ""
  const connectSidMatch = cookieHeader.match(/connect\.sid=([^;]+)/)
  
  let session = (req as any).session
  let sessionID = (req as any).sessionID
  
  // If Express session middleware didn't parse the cookie, try to load it manually
  if (connectSidMatch && (!session || !session.auth_context?.auth_identity_id)) {
    const signedCookie = decodeURIComponent(connectSidMatch[1]) // URL decode first
    console.log("[Admin Users Me Route] Found connect.sid cookie (decoded):", signedCookie.substring(0, 50) + "...")
    
    // Try to unsign it to get the sessionID
    try {
      const cookieSignature = require("cookie-signature")
      
      // Try multiple cookie secrets (from env and config)
      let cookieSecret = process.env.COOKIE_SECRET || "supersecret"
      try {
        const configModule = req.scope.resolve("configModule")
        if (configModule?.projectConfig?.http?.cookieSecret) {
          cookieSecret = configModule.projectConfig.http.cookieSecret
        }
      } catch (e) {
        // Use env default
      }
      
      // Remove 's:' prefix if present
      const cookieValue = signedCookie.startsWith('s:') ? signedCookie.substring(2) : signedCookie
      let extractedSessionID = cookieSignature.unsign(cookieValue, cookieSecret)
      
      if (!extractedSessionID) {
        // Try with 's:' prefix removed differently
        const altCookieValue = signedCookie.replace(/^s:/, '')
        extractedSessionID = cookieSignature.unsign(altCookieValue, cookieSecret)
      }
      
      if (extractedSessionID) {
        console.log("[Admin Users Me Route] ✅ Extracted sessionID from cookie:", extractedSessionID.substring(0, 30) + "...")
        
        // Manually load the session from the store
        const sessionStore = (req as any).sessionStore
        if (sessionStore) {
          await new Promise<void>((resolve) => {
            sessionStore.get(extractedSessionID, (storeErr: any, storedSession: any) => {
              if (storeErr) {
                console.error("[Admin Users Me Route] Error getting session by extracted ID:", storeErr)
                resolve()
              } else if (storedSession) {
                console.log("[Admin Users Me Route] ✅ Session found in store by extracted ID:", {
                  sessionId: extractedSessionID.substring(0, 30) + "...",
                  hasAuthIdentityId: !!storedSession.auth_context?.auth_identity_id,
                  keys: Object.keys(storedSession),
                })
                
                // Manually attach the session to the request
                if (!session) {
                  session = storedSession
                  ;(req as any).session = session
                  ;(req as any).sessionID = extractedSessionID
                  sessionID = extractedSessionID
                  console.log("[Admin Users Me Route] ✅ Manually attached session to request")
                } else {
                  // Merge stored session data into existing session
                  Object.assign(session, storedSession)
                  console.log("[Admin Users Me Route] ✅ Merged stored session data into existing session")
                }
                resolve()
              } else {
                console.error("[Admin Users Me Route] ❌ Session NOT in store for extracted ID!")
                resolve()
              }
            })
          })
        }
      } else {
        console.error("[Admin Users Me Route] ❌ Failed to unsign cookie - invalid signature or wrong secret")
        console.error("[Admin Users Me Route] Cookie value (first 50 chars):", cookieValue.substring(0, 50))
        console.error("[Admin Users Me Route] Cookie secret (first 20 chars):", cookieSecret.substring(0, 20) + "...")
      }
    } catch (e) {
      console.error("[Admin Users Me Route] Error unsigning cookie:", e)
    }
  } else if (!connectSidMatch) {
    console.error("[Admin Users Me Route] ❌ No connect.sid cookie found in request!")
  }
  
  console.log("[Admin Users Me Route] Session check:", {
    hasSession: !!session,
    sessionID: sessionID?.substring(0, 30) + "...",
    authIdentityId: session?.auth_context?.auth_identity_id,
    actorType: session?.auth_context?.actor_type,
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
            hasAuthIdentityId: !!storedSession.auth_context?.auth_identity_id,
            keys: Object.keys(storedSession),
          })
        } else {
          console.error("[Admin Users Me Route] ❌ Session NOT in store!")
        }
      })
    }
  }
  
  // If we have a valid session, return user info
  if (session && session.auth_context?.auth_identity_id) {
    try {
      const authModuleService = req.scope.resolve(Modules.AUTH)
      const userModuleService = req.scope.resolve(Modules.USER)
      
      const authIdentities = await authModuleService.listAuthIdentities({
        id: session.auth_context.auth_identity_id
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
  console.log("[Admin Users Me Route] Session state:", {
    hasSession: !!session,
    sessionID: sessionID?.substring(0, 30) + "..." || "NO SESSION ID",
    sessionKeys: session ? Object.keys(session) : [],
    authIdentityId: session?.auth_context?.auth_identity_id,
  })
  res.status(401).json({ 
    message: "Unauthorized - CUSTOM ROUTE CALLED", 
    sessionState: {
      hasSession: !!session,
      hasSessionID: !!sessionID,
      hasAuthIdentityId: !!session?.auth_context?.auth_identity_id,
    }
  })
}
