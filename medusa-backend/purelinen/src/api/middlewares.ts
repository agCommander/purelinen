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
console.log("[Middlewares] Registering custom middlewares")

export default defineMiddlewares({
  routes: [
    {
      // Match all admin product API routes (including nested routes)
      matcher: /\/admin\/products/,
      middlewares: [ensureVariantPrices],
    },
    {
      // Intercept auth/session to handle JWT and create session
      // Try multiple matcher patterns to ensure we catch it
      matcher: /\/auth\/session/,
      middlewares: [handleAuthSession],
    },
    {
      // Also try matching with a function for more control
      matcher: (path: string) => path.includes('/auth/session'),
      middlewares: [handleAuthSession],
    },
  ],
})
