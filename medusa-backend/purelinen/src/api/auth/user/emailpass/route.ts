import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

interface AuthRequestBody {
  email: string
  password: string
}

/**
 * Route to handle /auth/user/emailpass requests from admin panel.
 * Since emailpass works for both customers and admin, we check if it's an admin request
 * and ensure the session is set up correctly for admin routes.
 */
export async function POST(
  req: MedusaRequest<AuthRequestBody>,
  res: MedusaResponse
): Promise<void> {
  // Check if request is from admin panel
  const referer = Array.isArray(req.headers.referer) 
    ? req.headers.referer[0] || "" 
    : req.headers.referer || ""
  const origin = Array.isArray(req.headers.origin)
    ? req.headers.origin[0] || ""
    : req.headers.origin || ""
  
  const isAdminRequest = 
    referer.includes("/app") || 
    origin.includes("/app") ||
    referer.includes("admin") ||
    origin.includes("admin")
  
  // If admin request, use Medusa's auth service with admin scope
  if (isAdminRequest) {
    try {
      const authModuleService = req.scope.resolve(Modules.AUTH)
      
      // Convert request to AuthenticationInput format
      const headers: Record<string, string> = {}
      Object.keys(req.headers).forEach((key) => {
        const value = req.headers[key]
        if (value) {
          headers[key] = Array.isArray(value) ? value[0] : value
        }
      })
      
      const query: Record<string, string> = {}
      Object.keys(req.query).forEach((key) => {
        const value = req.query[key]
        if (value) {
          query[key] = Array.isArray(value) 
            ? (typeof value[0] === "string" ? value[0] : String(value[0] || ""))
            : String(value)
        }
      })
      
      const body: Record<string, string> = {
        email: req.body.email,
        password: req.body.password,
      }
      
      // Use admin URL to ensure admin scope
      const adminUrl = "/auth/admin/emailpass"
      
      const { success, authIdentity, error } = await authModuleService.authenticate(
        "emailpass",
        {
          url: adminUrl,
          headers,
          query,
          body,
          protocol: req.protocol || "https",
        }
      )
      
      if (!success || !authIdentity) {
        res.status(401).json({ 
          message: error || "Authentication failed" 
        })
        return
      }
      
      // According to Medusa docs, we should return a JWT token here
      // The client will then call POST /auth/session with the token to create the session cookie
      // Let Medusa's default handler create the JWT token by proxying to the admin endpoint
      // For now, return what Medusa would return (JWT token)
      // The admin SDK will handle calling /auth/session with this token
      
      // Get JWT token from Medusa's auth response by calling admin endpoint
      const http = require("http")
      const postData = JSON.stringify(req.body)
      
      return new Promise<void>((resolve, reject) => {
        const proxyReq = http.request({
          hostname: "localhost",
          port: 9000,
          path: "/auth/admin/emailpass",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        }, async (proxyRes) => {
          let responseBody = ""
          
          proxyRes.on("data", (chunk) => {
            responseBody += chunk.toString()
          })
          
              proxyRes.on("end", async () => {
            try {
              // Parse the response to get JWT token
              const authResponse = JSON.parse(responseBody)
              
              // If we have a token, create session immediately
              if (authResponse.token) {
                const token = authResponse.token
                
                // Decode JWT to get auth info
                try {
                  const base64Url = token.split('.')[1]
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                  const jsonPayload = Buffer.from(base64, 'base64').toString('utf8')
                  const decoded = JSON.parse(jsonPayload)
                  
                  // Create session from JWT token
                  const session = (req as any).session
                  if (!session) {
                    console.error("[Auth Route] No session object - session middleware not initialized")
                    res.status(500).json({ message: "Session middleware not initialized" })
                    reject(new Error("Session middleware not initialized"))
                    return
                  }
                  
                  // Set session data
                  session.auth_identity_id = decoded.auth_identity_id
                  session.actor_type = decoded.actor_type || "admin"
                  session.token = token
                  
                  if (decoded.actor_id) {
                    session.user_id = decoded.actor_id
                  }
                  
                  // Log session info before saving
                  console.log("[Auth Route] Session before save:", {
                    sessionId: session.id?.substring(0, 30) + "...",
                    reqSessionID: (req as any).sessionID?.substring(0, 30) + "...",
                    hasAuthIdentityId: !!session.auth_identity_id,
                  })
                  
                  // Mark session as modified - Express session middleware will handle cookie setting
                  // Based on GitHub issue #11769, manually setting cookies can cause issues
                  // Let Express session middleware handle it automatically
                  session.touch()
                  
                  // Save the session - Express middleware will automatically set the cookie
                  session.save((err: any) => {
                    if (err) {
                      console.error("[Auth Route] Error saving session:", err)
                      res.status(500).json({ message: "Error saving session" })
                      reject(err)
                      return
                    }
                    
                    console.log("[Auth Route] Session saved:", {
                      sessionId: (req as any).sessionID?.substring(0, 30) + "...",
                      authIdentityId: decoded.auth_identity_id,
                      actorType: decoded.actor_type,
                    })
                    
                    // Forward response headers (Express session middleware should have set Set-Cookie)
                    res.status(proxyRes.statusCode || 500)
                    Object.keys(proxyRes.headers).forEach((key) => {
                      const value = proxyRes.headers[key]
                      if (value && key.toLowerCase() !== "set-cookie") {
                        res.setHeader(key, value)
                      }
                    })
                    
                    // Log Set-Cookie header (set by Express session middleware)
                    const setCookie = res.getHeader("Set-Cookie")
                    console.log("[Auth Route] Set-Cookie header:", setCookie ? "present" : "missing")
                    if (setCookie) {
                      console.log("[Auth Route] Set-Cookie value:", Array.isArray(setCookie) ? setCookie[0]?.substring(0, 100) + "..." : setCookie?.toString().substring(0, 100) + "...")
                    }
                    
                    // Send response
                    res.json(authResponse)
                    resolve()
                  })
                  return // Don't continue - response is sent in callback
                } catch (jwtError) {
                  console.error("[Auth Route] Error decoding JWT:", jwtError)
                  // Fall through to send response without session
                }
              }
              
              // If no token or error, send response without session
              res.status(proxyRes.statusCode || 500)
              Object.keys(proxyRes.headers).forEach((key) => {
                const value = proxyRes.headers[key]
                if (value) {
                  res.setHeader(key, value)
                }
              })
              res.json(authResponse)
              resolve()
            } catch (parseError) {
              console.error("[Auth Route] Error parsing response:", parseError)
              res.status(500).json({ message: "Internal server error" })
              reject(parseError)
            }
          })
        })
        
        proxyReq.on("error", (error) => {
          console.error("[Auth Route] Proxy error:", error)
          res.status(500).json({ message: "Internal server error" })
          reject(error)
        })
        
        proxyReq.write(postData)
        proxyReq.end()
      })
    } catch (error) {
      console.error("[Auth Route] Error:", error)
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Authentication failed" 
      })
      return
    }
  }
  
  // For customer requests, let Medusa handle it normally
  // We return 400 to indicate they should use the correct endpoint
  // In practice, you might want to let Medusa's default handler process this
  res.status(400).json({
    message: "Use /auth/admin/emailpass for admin authentication"
  })
}
