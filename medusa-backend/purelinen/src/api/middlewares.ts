import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

/**
 * Middleware to ensure variant.prices is always an array
 * This fixes the "Cannot read properties of undefined (reading 'reduce')" error
 * in Medusa's core pricing component
 */
async function ensureVariantPrices(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Debug: log the request
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Intercepting:', req.method, req.url)
  }

  // Store original methods
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  // Helper to patch data
  const patchData = (data: any) => {
    // Debug: log what we're patching
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Response data structure:', {
        hasProduct: !!data?.product,
        hasProducts: Array.isArray(data?.products),
        productVariantsCount: data?.product?.variants?.length,
        firstVariantHasPrices: !!data?.product?.variants?.[0]?.prices,
      })
    }
    // Helper function to ensure prices array exists
    const ensurePrices = (variant: any) => {
      if (!variant) return variant
      if (!variant.prices || !Array.isArray(variant.prices)) {
        return {
          ...variant,
          prices: [],
        }
      }
      return variant
    }

    // Patch single product response
    if (data?.product) {
      if (Array.isArray(data.product.variants)) {
        data.product.variants = data.product.variants.map(ensurePrices)
      } else if (data.product.variants && typeof data.product.variants === 'object') {
        // Handle case where variants might be an object with array inside
        if (Array.isArray(data.product.variants.data)) {
          data.product.variants.data = data.product.variants.data.map(ensurePrices)
        }
      }
    }

    // Patch array of products response
    if (Array.isArray(data?.products)) {
      data.products = data.products.map((product: any) => {
        if (product?.variants && Array.isArray(product.variants)) {
          product.variants = product.variants.map(ensurePrices)
        }
        return product
      })
    }

    // Patch direct variant array (if variants are returned directly)
    if (Array.isArray(data?.variants)) {
      data.variants = data.variants.map(ensurePrices)
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development' && data?.product?.variants) {
      const hasMissingPrices = data.product.variants.some((v: any) => !v.prices || !Array.isArray(v.prices))
      if (hasMissingPrices) {
        console.log('[Middleware] Fixed missing prices in variants')
      }
    }

    return data
  }

  // Override json method to patch response
  res.json = function (data: any) {
    const patched = patchData(data)
    return originalJson(patched)
  }

  // Also override send method (some endpoints use send instead of json)
  res.send = function (data: any) {
    // Try to parse if it's a string
    let parsedData = data
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        // Not JSON, send as-is
        return originalSend(data)
      }
    }
    
    const patched = patchData(parsedData)
    return originalSend(typeof data === 'string' ? JSON.stringify(patched) : patched)
  }

  next()
}

async function handleAuthSession(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Log ALL requests to see what we're getting
  console.log("[Auth Session Middleware] Request:", {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: (req as any).originalUrl,
  })
  
  // Intercept POST /auth/session to handle JWT token and create session
  const isSessionPath = req.path === '/auth/session' || 
                       req.url?.includes('/auth/session') ||
                       (req as any).originalUrl?.includes('/auth/session')
  
  if (req.method === 'POST' && isSessionPath) {
    console.log("=".repeat(60))
    console.log("[Auth Session Middleware] Intercepting POST /auth/session")
    
    // Check for JWT token in Authorization header or cookies
    let token: string | null = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
      console.log("[Auth Session Middleware] Found JWT in Authorization header")
    } else {
      const cookies = req.headers.cookie || ""
      const jwtMatch = cookies.match(/_medusa_jwt=([^;]+)/)
      if (jwtMatch) {
        token = jwtMatch[1]
        console.log("[Auth Session Middleware] Found JWT in cookies")
      }
    }
    
    if (token) {
      try {
        // Decode JWT
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8')
        const decoded = JSON.parse(jsonPayload)
        
        console.log("[Auth Session Middleware] Decoded JWT:", {
          authIdentityId: decoded.auth_identity_id,
          actorType: decoded.actor_type,
        })
        
        // Create session from JWT
        const session = (req as any).session
        if (session) {
          session.auth_context = {
            actor_id: decoded.actor_id || "",
            actor_type: decoded.actor_type || "user",
            auth_identity_id: decoded.auth_identity_id || "",
            app_metadata: decoded.app_metadata || {},
            user_metadata: decoded.user_metadata || {},
          }
          session.token = token
          
          // Save session
          session.save((err: any) => {
            if (err) {
              console.error("[Auth Session Middleware] Error saving session:", err)
              res.status(500).json({ message: "Error saving session" })
              return
            }
            
            console.log("[Auth Session Middleware] ✅ Session created from JWT")
            res.status(200).json({
              auth_identity_id: decoded.auth_identity_id,
              actor_type: decoded.actor_type || "user",
            })
            // Don't call next() - we've handled the request
            return
          })
          return // Don't continue to next middleware
        }
      } catch (error) {
        console.error("[Auth Session Middleware] Error processing JWT:", error)
      }
    } else {
      console.log("[Auth Session Middleware] No JWT token found")
    }
  }
  
  // For GET /auth/session, just log and continue
  if (req.method === 'GET' && (req.path === '/auth/session' || req.url?.includes('/auth/session'))) {
    console.log("=".repeat(60))
    console.log("[Auth Session Middleware] Intercepting GET /auth/session")
    const session = (req as any).session
    const sessionID = (req as any).sessionID
    console.log("[Auth Session Middleware] Session check:", {
      hasSession: !!session,
      sessionID: sessionID?.substring(0, 30) + "...",
      authIdentityId: session?.auth_context?.auth_identity_id,
    })
    console.log("=".repeat(60))
  }
  
  next()
}

// Log when middlewares are being registered
console.log("=".repeat(80))
console.log("[Middlewares] ===== REGISTERING CUSTOM MIDDLEWARES =====")
console.log("[Middlewares] This file is being loaded")
console.log("[Middlewares] If you see this log, the middleware file is loaded")
console.log("=".repeat(80))

export default defineMiddlewares({
  routes: [
    {
      // CRITICAL: Catch-all middleware to verify middleware is working
      // This should log ALL requests to verify middleware is being called
      matcher: /.*/,
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          // Only log /admin/users/me to avoid spam
          if (req.path === '/admin/users/me' || req.url?.includes('/admin/users/me')) {
            console.log("=".repeat(80))
            console.log("[CATCH-ALL Middleware] ===== INTERCEPTED /admin/users/me =====")
            console.log("[CATCH-ALL Middleware] Method:", req.method)
            console.log("[CATCH-ALL Middleware] Path:", req.path)
            console.log("[CATCH-ALL Middleware] URL:", req.url)
            console.log("[CATCH-ALL Middleware] Original URL:", (req as any).originalUrl)
            console.log("=".repeat(80))
          }
          next()
        }
      ],
    },
    {
      // Match all admin product API routes (including nested routes)
      matcher: /\/admin\/products/,
      middlewares: [ensureVariantPrices],
    },
    {
      // Intercept auth/session to handle JWT and create session
      matcher: /\/auth\/session/,
      middlewares: [handleAuthSession],
    },
    {
      // Handle /admin/users/me requests - intercept and handle directly
      // This MUST run before Medusa's route and NOT call next() to prevent Medusa's route from running
      // Use a more flexible matcher to catch the request
      matcher: /\/admin\/users\/me/,
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          // Only handle GET requests
          if (req.method !== 'GET') {
            console.log("[Admin Users Me Middleware] Not a GET request, calling next()")
            next()
            return
          }

          console.log("=".repeat(80))
          console.log("[Admin Users Me Middleware] ===== INTERCEPTING /admin/users/me =====")
          console.log("[Admin Users Me Middleware] ===== HANDLING REQUEST DIRECTLY (NOT CALLING next()) =====")
          console.log("[Admin Users Me Middleware] Request details:", {
            method: req.method,
            path: req.path,
            url: req.url,
            originalUrl: (req as any).originalUrl,
          })
          
          const { Modules } = await import("@medusajs/framework/utils")
          
          // Parse the cookie to get sessionID
          const cookieHeader = req.headers.cookie || ""
          const connectSidMatch = cookieHeader.match(/connect\.sid=([^;]+)/)
          
          let session = (req as any).session
          let sessionID = (req as any).sessionID
          let storedSession: any = null
          
          // If Express session middleware didn't parse the cookie, try to load it manually
          if (connectSidMatch && (!session || !session.auth_context?.auth_identity_id)) {
            const signedCookie = decodeURIComponent(connectSidMatch[1]) // URL decode first
            console.log("[Admin Users Me Middleware] Found connect.sid cookie (decoded):", signedCookie.substring(0, 50) + "...")
            
            // Try to unsign it to get the sessionID
            try {
              const cookieSignature = require("cookie-signature")
              
              // Get cookie secret from config
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
                console.log("[Admin Users Me Middleware] ✅ Extracted sessionID from cookie:", extractedSessionID.substring(0, 30) + "...")
                
                // Manually load the session from the store
                const sessionStore = (req as any).sessionStore
                if (sessionStore) {
                  await new Promise<void>((resolve) => {
                    sessionStore.get(extractedSessionID, (storeErr: any, sess: any) => {
                      if (storeErr) {
                        console.error("[Admin Users Me Middleware] Error getting session:", storeErr)
                        resolve()
                      } else if (sess) {
                        console.log("[Admin Users Me Middleware] ✅ Session found in store:", {
                          sessionId: extractedSessionID.substring(0, 30) + "...",
                          hasAuthIdentityId: !!sess.auth_context?.auth_identity_id,
                          keys: Object.keys(sess),
                        })
                        storedSession = sess
                        sessionID = extractedSessionID
                        resolve()
                      } else {
                        console.error("[Admin Users Me Middleware] ❌ Session NOT in store!")
                        resolve()
                      }
                    })
                  })
                }
              } else {
                console.error("[Admin Users Me Middleware] ❌ Failed to unsign cookie")
              }
            } catch (e) {
              console.error("[Admin Users Me Middleware] Error unsigning cookie:", e)
            }
          }
          
          // Use stored session if we found it, otherwise use Express session
          const activeSession = storedSession || session
          const activeAuthIdentityId = activeSession?.auth_context?.auth_identity_id
          
          console.log("[Admin Users Me Middleware] Final session state:", {
            hasActiveSession: !!activeSession,
            hasStoredSession: !!storedSession,
            hasExpressSession: !!session,
            sessionID: sessionID?.substring(0, 30) + "..." || "NO SESSION ID",
            authIdentityId: activeAuthIdentityId,
          })
          
          // If we have a valid session, return user info
          if (activeSession && activeAuthIdentityId) {
            try {
              const authModuleService = req.scope.resolve(Modules.AUTH)
              const userModuleService = req.scope.resolve(Modules.USER)
              
              const authIdentities = await authModuleService.listAuthIdentities({
                id: activeAuthIdentityId
              })
              
              if (authIdentities && authIdentities.length > 0) {
                const authIdentity = authIdentities[0]
                const userId = authIdentity.app_metadata?.user_id
                
                if (userId && typeof userId === "string") {
                  const users = await userModuleService.listUsers({ id: userId })
                  if (users && users.length > 0) {
                    const user = users[0]
                    
                    console.log("[Admin Users Me Middleware] ✅ Returning user info")
                    res.json({
                      user: {
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                      },
                    })
                    return // Don't call next() - we've handled the request
                  }
                }
              }
            } catch (error) {
              console.error("[Admin Users Me Middleware] Error fetching user:", error)
            }
          }
          
          // No valid session
          console.log("[Admin Users Me Middleware] ❌ No valid session, returning 401")
          res.status(401).json({ 
            message: "Unauthorized - HANDLED BY MIDDLEWARE",
            sessionState: {
              hasActiveSession: !!activeSession,
              hasStoredSession: !!storedSession,
              hasExpressSession: !!session,
              hasAuthIdentityId: !!activeAuthIdentityId,
            }
          })
          // Don't call next() - we've handled the request
        }
      ],
    },
    {
      // Catch-all middleware to debug - log ALL admin requests
      matcher: /^\/admin/,
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          // Only log /admin/users/me to avoid spam
          if (req.path === '/admin/users/me' || req.url?.includes('/admin/users/me') || (req as any).originalUrl?.includes('/admin/users/me')) {
            console.log("=".repeat(60))
            console.log("[CATCH-ALL Admin Middleware] ===== INTERCEPTED =====")
            console.log("[CATCH-ALL Admin Middleware] Path:", req.path)
            console.log("[CATCH-ALL Admin Middleware] URL:", req.url)
            console.log("[CATCH-ALL Admin Middleware] Original URL:", (req as any).originalUrl)
            console.log("[CATCH-ALL Admin Middleware] Cookies:", req.headers.cookie || "NONE")
            console.log("=".repeat(60))
          }
          next()
        }
      ],
    },
  ],
})
