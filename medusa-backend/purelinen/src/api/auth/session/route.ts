// This file MUST be loaded - if you see this in compiled output, the route exists
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { verify } from "jsonwebtoken"

const debug = process.env.DEBUG_AUTH_SESSION === "true"
debug && console.log("[Session Route] Custom /auth/session route file loaded")

/**
 * Session endpoint:
 * - POST: Creates a session cookie from a JWT token (Authorization: Bearer {jwt_token})
 * - GET: Returns session info if authenticated
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const ensureActorId = async (
    authIdentityId?: string,
    currentActorId?: string
  ): Promise<string> => {
    if (currentActorId) {
      return currentActorId
    }

    if (!authIdentityId) {
      return ""
    }

    try {
      const authModuleService = req.scope.resolve(Modules.AUTH)
      const authIdentities = await authModuleService.listAuthIdentities({
        id: [authIdentityId],
      })
      const authIdentity = authIdentities?.[0]
      const userId = authIdentity?.app_metadata?.user_id
      return typeof userId === "string" ? userId : ""
    } catch (error) {
      console.error("[Session Route POST] Failed to resolve actor_id:", error)
      return ""
    }
  }

  debug && console.log("=".repeat(50))
  debug && console.log("[Session Route POST] CUSTOM ROUTE CALLED!")
  debug && console.log("[Session Route POST] Request headers:", {
    authorization: req.headers.authorization ? "present" : "missing",
    cookie: req.headers.cookie ? "present" : "missing",
  })
  debug && console.log("=".repeat(50))
  
  // First, check if session already exists (created during login)
  const session = (req as any).session
  if (session && session.auth_context?.auth_identity_id) {
    debug && console.log("[Session Route POST] Session already exists, returning success")
    
    // Ensure admin actor_type matches Medusa's expected "user"
    if (session.auth_context.actor_type !== "user") {
      session.auth_context.actor_type = "user"
    }
    if (!session.auth_context.actor_id) {
      session.auth_context.actor_id = await ensureActorId(
        session.auth_context.auth_identity_id
      )
    }
    debug && console.log("[Session Route POST] Existing session auth_context:", {
      actorId: session.auth_context.actor_id,
      actorType: session.auth_context.actor_type,
      authIdentityId: session.auth_context.auth_identity_id,
    })

    // Persist any updates to auth_context before responding
    await new Promise<void>((resolve, reject) => {
      session.save((saveErr: any) => {
        if (saveErr) {
          console.error("[Session Route POST] Error saving existing session:", saveErr)
          reject(saveErr)
          return
        }
        resolve()
      })
    })

    // IMPORTANT: Even if session exists, we need to ensure the cookie is set!
    // Check if Set-Cookie header is present
    let setCookie = res.getHeader("Set-Cookie")
    if (!setCookie) {
      const sessionID = (req as any).sessionID
      if (sessionID) {
        const cookieName = (session as any).cookie?.name || 'connect.sid'
        const cookieOptions = (session as any).cookie || {}
        
        // Get cookie secret
        let cookieSecret = process.env.COOKIE_SECRET || "supersecret"
        try {
          const configModule = req.scope.resolve("configModule")
          if (configModule?.projectConfig?.http?.cookieSecret) {
            cookieSecret = configModule.projectConfig.http.cookieSecret
          }
        } catch (e) {
          // Use env default
        }
        
        const cookieSignature = require("cookie-signature")
        const signedValue = "s:" + cookieSignature.sign(sessionID, cookieSecret)
        
        const isSecure = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https'
        const useSecure = cookieOptions.secure !== undefined ? cookieOptions.secure : isSecure
        
        res.cookie(cookieName, signedValue, {
          httpOnly: cookieOptions.httpOnly !== false,
          secure: useSecure,
          sameSite: 'lax',
          path: cookieOptions.path || '/',
          maxAge: cookieOptions.maxAge || (24 * 60 * 60 * 1000),
        })
        
        debug && console.log("[Session Route POST] ✅ Cookie set for existing session")
        setCookie = res.getHeader("Set-Cookie")
      }
    }
    
    res.status(200).json({
      auth_identity_id: session.auth_context?.auth_identity_id,
      actor_type: "user",
    })
    return
  }
  
  // According to Medusa docs, POST /auth/session creates a session cookie from a JWT token
  // Check for JWT token in Authorization header or cookies
  let token: string | null = null
  
  // First, try Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7) // Remove "Bearer "
    debug && console.log("[Session Route POST] Found JWT in Authorization header")
  } else {
    // Try cookies (admin SDK might store JWT in cookies)
    const cookies = req.headers.cookie || ""
    const jwtMatch = cookies.match(/_medusa_jwt=([^;]+)/)
    if (jwtMatch) {
      token = jwtMatch[1]
      debug && console.log("[Session Route POST] Found JWT in cookies")
    }
  }
  
  if (!token) {
    debug && console.log("[Session Route POST] No JWT token found. Headers:", {
      authorization: req.headers.authorization ? "present" : "missing",
      cookie: req.headers.cookie ? "present" : "missing",
    })
    res.status(401).json({ message: "JWT token required in Authorization header or _medusa_jwt cookie" })
    return
  }
  
  // Verify JWT to get auth info
  try {
    const configModule = req.scope.resolve("configModule")
    const httpConfig = configModule?.projectConfig?.http || {}
    const jwtSecret = httpConfig.jwtSecret || process.env.JWT_SECRET || "supersecret"
    const jwtPublicKey = httpConfig.jwtPublicKey
    const jwtVerifyOptions = httpConfig.jwtVerifyOptions ?? httpConfig.jwtOptions

    const decoded = verify(token, jwtPublicKey ?? jwtSecret, jwtVerifyOptions) as {
      actor_id?: string
      actor_type?: string
      auth_identity_id?: string
      app_metadata?: Record<string, unknown>
      user_metadata?: Record<string, unknown>
      [key: string]: unknown
    }
    
    // Create session from JWT token
    const session = (req as any).session
    if (session) {
      // Check if session already exists with correct data (from login route)
      const existingSessionID = (req as any).sessionID
      if (existingSessionID && session.auth_context?.auth_identity_id === decoded.auth_identity_id) {
        debug && console.log("[Session Route POST] Session already exists with correct auth data")
        if (session.auth_context?.actor_type !== "user") {
          session.auth_context.actor_type = "user"
        }
        if (!session.auth_context.actor_id) {
          session.auth_context.actor_id = await ensureActorId(
            session.auth_context.auth_identity_id
          )
        }
        // Session already exists, just ensure cookie is set by touching and saving
        if (typeof (session as any).touch === 'function') {
          (session as any).touch()
        }
        
        await new Promise<void>((resolve, reject) => {
          session.save((saveErr: any) => {
            if (saveErr) {
              console.error("[Session Route POST] Error saving existing session:", saveErr)
              reject(saveErr)
              return
            }
            
            debug && console.log("[Session Route POST] Existing session saved, cookie should be set")
            res.status(200).json({
              auth_identity_id: decoded.auth_identity_id,
              actor_type: "user",
            })
            resolve()
          })
        })
        return
      }
      
      // Session doesn't exist or has wrong data - modify existing session
      // DON'T use regenerate() - it creates a new session that doesn't save custom properties
      debug && console.log("[Session Route POST] Modifying existing session (NOT regenerating)")
      
      // Set the session data in the shape Medusa expects
      const resolvedActorId = await ensureActorId(
        decoded.auth_identity_id,
        decoded.actor_id
      )

      session.auth_context = {
        actor_id: resolvedActorId,
        actor_type: "user",
        auth_identity_id: decoded.auth_identity_id || "",
        app_metadata: decoded.app_metadata || {},
        user_metadata: decoded.user_metadata || {},
      }
      session.token = token
      
      debug && console.log("[Session Route POST] Session data set:", {
        authIdentityId: session.auth_context?.auth_identity_id,
        actorType: session.auth_context?.actor_type,
        hasToken: !!session.token,
        sessionID: (req as any).sessionID?.substring(0, 30) + "...",
      })
      
      // Mark session as modified to ensure it's saved
      if (typeof (session as any).touch === 'function') {
        (session as any).touch()
      }
      
      // Save the session (this should set the cookie automatically)
      await new Promise<void>((resolve, reject) => {
        session.save((saveErr: any) => {
            if (saveErr) {
              console.error("[Session Route POST] Error saving session:", saveErr)
              reject(saveErr)
              return
            }
            
            const sessionID = (req as any).sessionID
            debug && console.log("[Session Route POST] Session saved, verifying data was persisted:", {
              sessionId: sessionID?.substring(0, 30) + "...",
              authIdentityId: session.auth_context?.auth_identity_id,
              actorType: session.auth_context?.actor_type,
            })
            
            // Check if Set-Cookie header was set by Express session middleware
            let setCookie = res.getHeader("Set-Cookie")
            debug && console.log("[Session Route POST] Set-Cookie header after save:", setCookie ? "present" : "missing")
            
            // If Express session middleware set the cookie, use it and don't set manually
            if (setCookie) {
              debug && console.log("[Session Route POST] ✅ Express session middleware set the cookie automatically!")
              debug && console.log("[Session Route POST] Set-Cookie value (first 100 chars):", 
                (Array.isArray(setCookie) ? setCookie[0] : setCookie?.toString())?.substring(0, 100) + "...")
              
              // Return response - cookie is already set by Express session middleware
              res.status(200).json({
                auth_identity_id: decoded.auth_identity_id,
                actor_type: "user",
              })
              resolve()
              return
            }
            
            // If Express session middleware didn't set the cookie, set it manually
            // Use cookieOptions from projectConfig to ensure consistency
            if (!setCookie && sessionID) {
              // Get the actual cookie name from Express session middleware
              // This is critical - if the name doesn't match, Express won't find the cookie
              const sessionCookie = (session as any).cookie
              const cookieName = sessionCookie?.name || 'connect.sid'
              
              debug && console.log("[Session Route POST] Cookie name check:", {
                fromSessionCookie: sessionCookie?.name,
                using: cookieName,
                default: 'connect.sid',
              })
              
              // Get cookie options from projectConfig (set in medusa-config.ts)
              let cookieOptions: any = {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
              }
              
              try {
                const configModule = req.scope.resolve("configModule")
                if (configModule?.projectConfig?.cookieOptions) {
                  // Merge projectConfig cookieOptions with defaults
                  cookieOptions = {
                    ...cookieOptions,
                    ...configModule.projectConfig.cookieOptions,
                  }
                }
              } catch (e) {
                console.warn("[Session Route POST] Could not read cookieOptions from config, using defaults")
              }
              
              // Get cookie secret from Medusa's config
              let cookieSecret = process.env.COOKIE_SECRET || "supersecret"
              let cookieSecretSource = "process.env.COOKIE_SECRET"
              try {
                const configModule = req.scope.resolve("configModule")
                if (configModule?.projectConfig?.http?.cookieSecret) {
                  cookieSecret = configModule.projectConfig.http.cookieSecret
                  cookieSecretSource = "configModule.projectConfig.http.cookieSecret"
                }
                debug && console.log("[Session Route POST] Cookie secret from configModule:", {
                  source: cookieSecretSource,
                  value: cookieSecret.substring(0, 20) + "...",
                  length: cookieSecret.length,
                })
              } catch (e) {
                console.warn("[Session Route POST] Could not read cookieSecret from configModule:", e)
                debug && console.log("[Session Route POST] Using cookie secret from process.env:", {
                  value: cookieSecret.substring(0, 20) + "...",
                  length: cookieSecret.length,
                })
              }
              
              // Also check what Express session middleware is using
              // Express session stores the secret in the session store or cookie options
              const expressSessionCookie = (session as any).cookie
              if (expressSessionCookie) {
                debug && console.log("[Session Route POST] Express session cookie config:", {
                  name: expressSessionCookie.name || "undefined (using default 'connect.sid')",
                  httpOnly: expressSessionCookie.httpOnly,
                  secure: expressSessionCookie.secure,
                  sameSite: expressSessionCookie.sameSite,
                  path: expressSessionCookie.path,
                  maxAge: expressSessionCookie.maxAge,
                  domain: expressSessionCookie.domain,
                })
              } else {
                console.warn("[Session Route POST] ⚠️  No session.cookie found!")
              }
              
              // Check if we can access the session store's secret
              const sessionStore = (req as any).sessionStore
              if (sessionStore) {
                debug && console.log("[Session Route POST] Session store type:", sessionStore.constructor?.name || "unknown")
                // Some session stores expose the secret, but MemoryStore doesn't
              }
              
              // IMPORTANT: Check what cookie name Express session middleware is actually using
              // It might be different from 'connect.sid'
              const actualCookieName = expressSessionCookie?.name || 'connect.sid'
              debug && console.log("[Session Route POST] Using cookie name:", actualCookieName)
              
              // Verify we're using the same cookie name
              if (cookieName !== actualCookieName) {
                console.error("[Session Route POST] ⚠️  WARNING: Cookie name mismatch!")
                console.error("[Session Route POST] We're using:", cookieName)
                console.error("[Session Route POST] Express session expects:", actualCookieName)
              }
              
              const cookieSignature = require("cookie-signature")
              const signedValue = "s:" + cookieSignature.sign(sessionID, cookieSecret)
              
              // Verify we can unsign it with the same secret (for debugging)
              const cookieValueToVerify = signedValue.startsWith('s:') ? signedValue.substring(2) : signedValue
              const verifiedSessionID = cookieSignature.unsign(cookieValueToVerify, cookieSecret)
              if (verifiedSessionID === sessionID) {
                debug && console.log("[Session Route POST] ✅ Cookie signature verified - can be unsigned correctly")
              } else {
                console.error("[Session Route POST] ❌ Cookie signature verification FAILED!")
                console.error("[Session Route POST] Expected sessionID:", sessionID?.substring(0, 30) + "...")
                console.error("[Session Route POST] Verified sessionID:", verifiedSessionID?.substring(0, 30) + "..." || "null")
              }
              
              debug && console.log("[Session Route POST] Using cookieSecret (first 20 chars):", cookieSecret.substring(0, 20) + "...")
              
              // Set cookie using options from projectConfig
              // IMPORTANT: Don't set domain - let browser use default (current domain)
              // Setting domain can cause issues with subdomains
              res.cookie(cookieName, signedValue, {
                ...cookieOptions,
                domain: undefined, // Explicitly don't set domain
              })
              
              debug && console.log("[Session Route POST] Cookie set manually using projectConfig.cookieOptions:", cookieOptions)
              
              setCookie = res.getHeader("Set-Cookie")
            }
            
            if (setCookie) {
              const cookieValue = Array.isArray(setCookie) ? setCookie[0] : setCookie?.toString()
              debug && console.log("[Session Route POST] Set-Cookie value (full):", cookieValue)
              debug && console.log("[Session Route POST] Set-Cookie value (first 200 chars):", cookieValue?.substring(0, 200) + "...")
              
              // Check if cookie has all required attributes
              if (cookieValue) {
                const hasSecure = cookieValue.includes('Secure')
                const hasHttpOnly = cookieValue.includes('HttpOnly')
                const hasSameSite = cookieValue.includes('SameSite')
                const hasPath = cookieValue.includes('Path=')
                debug && console.log("[Session Route POST] Cookie attributes check:", {
                  hasSecure,
                  hasHttpOnly,
                  hasSameSite,
                  hasPath,
                })
              }
            } else {
              console.error("[Session Route POST] ⚠️  WARNING: Set-Cookie header still missing after manual set!")
            }
            
            // Verify session is actually stored in the session store with the correct data
            // Wait for the store to be updated (give it a moment)
            const sessionStore = (req as any).sessionStore
            if (sessionStore && sessionID) {
              // Wait a bit for the store to be updated, then check
              setTimeout(() => {
                sessionStore.get(sessionID, (storeErr: any, storedSession: any) => {
                  if (storeErr) {
                    console.error("[Session Route POST] Error retrieving session from store:", storeErr)
                  } else if (storedSession) {
                    debug && console.log("[Session Route POST] ✅ Session verified in store:", {
                      sessionId: sessionID?.substring(0, 30) + "...",
                      hasAuthIdentityId: !!storedSession.auth_context?.auth_identity_id,
                      authIdentityId: storedSession.auth_context?.auth_identity_id,
                      actorType: storedSession.auth_context?.actor_type,
                      sessionKeys: Object.keys(storedSession),
                    })
                    
                    // CRITICAL: If session data is missing, log a warning
                    if (!storedSession.auth_context?.auth_identity_id) {
                      console.error("[Session Route POST] ❌ WARNING: Session data NOT persisted to store!")
                      console.error("[Session Route POST] Session object has:", Object.keys(storedSession))
                      console.error("[Session Route POST] Expected auth_identity_id:", decoded.auth_identity_id)
                    }
                  } else {
                    console.error("[Session Route POST] ❌ Session NOT found in store after save!")
                    console.error("[Session Route POST] This might be a timing issue - session might be saved but not yet readable")
                  }
                })
              }, 200) // Wait 200ms for store to update (increased from 100ms)
            }
            
            // Return response inside the Promise callback
              res.status(200).json({
                auth_identity_id: decoded.auth_identity_id,
                actor_type: "user",
              })
            resolve()
          }) // closes session.save
        }) // closes Promise
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
  debug && console.log("=".repeat(60))
  debug && console.log("[Session Route GET] ===== CUSTOM ROUTE CALLED =====")
  debug && console.log("[Session Route GET] Request details:", {
    method: req.method,
    path: req.path,
    url: req.url,
    cookies: req.headers.cookie ? "present" : "missing",
    cookieHeader: req.headers.cookie?.substring(0, 200) + "...",
  })
  debug && console.log("=".repeat(60))
  
  try {
    // Check for session
    const session = (req as any).session
    const sessionID = (req as any).sessionID
    
    debug && console.log("[Session Route GET] Session check:", {
      hasSession: !!session,
      sessionID: sessionID?.substring(0, 30) + "...",
      sessionKeys: session ? Object.keys(session) : [],
      authIdentityId: session?.auth_context?.auth_identity_id,
      actorType: session?.auth_context?.actor_type,
      cookies: req.headers.cookie ? "present" : "missing",
    })
    
    // Check if cookie is being sent
    const cookieHeader = req.headers.cookie || ""
    const connectSidMatch = cookieHeader.match(/connect\.sid=([^;]+)/)
    if (connectSidMatch) {
      debug && console.log("[Session Route GET] Found connect.sid cookie:", connectSidMatch[1].substring(0, 50) + "...")
      
      // Try to verify the session store can find it
      const sessionStore = (req as any).sessionStore
      if (sessionStore && sessionID) {
        sessionStore.get(sessionID, (storeErr: any, storedSession: any) => {
          if (storeErr) {
            console.error("[Session Route GET] Error retrieving session from store:", storeErr)
          } else if (storedSession) {
            debug && console.log("[Session Route GET] ✅ Session found in store:", {
              sessionId: sessionID?.substring(0, 30) + "...",
              hasAuthIdentityId: !!storedSession.auth_context?.auth_identity_id,
              keys: Object.keys(storedSession),
            })
          } else {
            console.error("[Session Route GET] ❌ Session NOT found in store, even though cookie exists!")
          }
        })
      }
    } else {
      debug && console.log("[Session Route GET] No connect.sid cookie found in request")
    }
    
    if (session && (session.auth_context?.auth_identity_id || session.token)) {
      const authIdentityId = session.auth_context?.auth_identity_id
      const token = session.token
      const actorType = session.auth_context?.actor_type || "user"
      
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
    const cookieHeaderForJWT = req.headers.cookie || ""
    const jwtMatch = cookieHeaderForJWT.match(/_medusa_jwt=([^;]+)/)
    
    if (jwtMatch) {
      const jwtToken = jwtMatch[1]
      debug && console.log("[Session Route GET] Found JWT in cookies, but no session. Session needs to be created via POST /auth/session first.")
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
