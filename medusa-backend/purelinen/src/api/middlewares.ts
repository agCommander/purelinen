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
          session.auth_identity_id = decoded.auth_identity_id
          session.actor_type = decoded.actor_type || "admin"
          session.token = token
          
          if (decoded.actor_id) {
            session.user_id = decoded.actor_id
          }
          
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
              actor_type: decoded.actor_type || "admin",
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
      authIdentityId: session?.auth_identity_id,
    })
    console.log("=".repeat(60))
  }
  
  next()
}

// Log when middlewares are being registered
console.log("[Middlewares] ===== REGISTERING CUSTOM MIDDLEWARES =====")
console.log("[Middlewares] This file is being loaded")

export default defineMiddlewares({
  routes: [
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
      // Log ALL requests to /admin/users/me - this MUST run before Medusa's route
      // Try both regex and string matcher
      matcher: "/admin/users/me",
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          console.log("=".repeat(60))
          console.log("[Admin Users Me Middleware] ===== INTERCEPTED (BEFORE MEDUSA) =====")
          console.log("[Admin Users Me Middleware] Request:", {
            method: req.method,
            path: req.path,
            url: req.url,
            originalUrl: (req as any).originalUrl,
            hasCookies: !!req.headers.cookie,
            cookieHeader: req.headers.cookie || "NO COOKIES",
          })
          
          // Parse the cookie to see what sessionID is being sent
          const cookieHeader = req.headers.cookie || ""
          const connectSidMatch = cookieHeader.match(/connect\.sid=([^;]+)/)
          if (connectSidMatch) {
            const signedCookie = connectSidMatch[1]
            console.log("[Admin Users Me Middleware] Found connect.sid cookie:", signedCookie.substring(0, 50) + "...")
            
            // Try to unsign it to get the sessionID
            try {
              const cookieSignature = require("cookie-signature")
              const cookieSecret = process.env.COOKIE_SECRET || "supersecret"
              // Remove 's:' prefix if present
              const cookieValue = signedCookie.startsWith('s:') ? signedCookie.substring(2) : signedCookie
              const sessionID = cookieSignature.unsign(cookieValue, cookieSecret)
              if (sessionID) {
                console.log("[Admin Users Me Middleware] Extracted sessionID from cookie:", sessionID.substring(0, 30) + "...")
                
                // Check if this session exists in the store
                const sessionStore = (req as any).sessionStore
                if (sessionStore) {
                  sessionStore.get(sessionID, (storeErr: any, storedSession: any) => {
                    if (storeErr) {
                      console.error("[Admin Users Me Middleware] Error getting session:", storeErr)
                    } else if (storedSession) {
                      console.log("[Admin Users Me Middleware] ✅ Session found in store by extracted ID:", {
                        sessionId: sessionID.substring(0, 30) + "...",
                        hasAuthIdentityId: !!storedSession.auth_identity_id,
                        keys: Object.keys(storedSession),
                      })
                    } else {
                      console.error("[Admin Users Me Middleware] ❌ Session NOT in store for extracted ID!")
                    }
                  })
                }
              } else {
                console.error("[Admin Users Me Middleware] Failed to unsign cookie - invalid signature or wrong secret")
              }
            } catch (e) {
              console.error("[Admin Users Me Middleware] Error unsigning cookie:", e)
            }
          } else {
            console.error("[Admin Users Me Middleware] ❌ No connect.sid cookie found in request!")
          }
          
          const session = (req as any).session
          const sessionID = (req as any).sessionID
          
          console.log("[Admin Users Me Middleware] Express session state:", {
            hasSession: !!session,
            sessionID: sessionID?.substring(0, 30) + "..." || "NO SESSION ID",
            authIdentityId: session?.auth_identity_id,
            sessionKeys: session ? Object.keys(session) : [],
          })
          
          // Check if session store can find it using Express's sessionID
          if (sessionID) {
            const sessionStore = (req as any).sessionStore
            if (sessionStore) {
              sessionStore.get(sessionID, (storeErr: any, storedSession: any) => {
                if (storeErr) {
                  console.error("[Admin Users Me Middleware] Error getting session:", storeErr)
                } else if (storedSession) {
                  console.log("[Admin Users Me Middleware] ✅ Session found in store by Express sessionID:", {
                    sessionId: sessionID.substring(0, 30) + "...",
                    hasAuthIdentityId: !!storedSession.auth_identity_id,
                    keys: Object.keys(storedSession),
                  })
                } else {
                  console.error("[Admin Users Me Middleware] ❌ Session NOT in store for Express sessionID!")
                }
              })
            } else {
              console.error("[Admin Users Me Middleware] No session store available!")
            }
          } else {
            console.error("[Admin Users Me Middleware] No Express sessionID - cookie might not be parsed correctly")
          }
          
          console.log("=".repeat(60))
          next()
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
