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
                  if (session) {
                    session.auth_identity_id = decoded.auth_identity_id
                    session.actor_type = decoded.actor_type || "admin"
                    session.token = token
                    
                    if (decoded.actor_id) {
                      session.user_id = decoded.actor_id
                    }
                    
                    // Save the session and manually set the cookie
                    await new Promise<void>((resolveSession, rejectSession) => {
                      session.save((err: any) => {
                        if (err) {
                          console.error("[Auth Route] Error saving session:", err)
                          rejectSession(err)
                        } else {
                          console.log("[Auth Route] Session created during login:", {
                            sessionId: session.id?.substring(0, 30) + "...",
                            authIdentityId: decoded.auth_identity_id,
                          })
                          
                          // Manually set the session cookie since session.save() doesn't always set it
                          // Use the same cookie name that Express session uses (usually 'connect.sid')
                          const cookieName = 'connect.sid'
                          const cookieValue = session.id
                          
                          // Get the session store to sign the cookie if needed
                          // For now, set it directly - Medusa's session middleware should handle signing
                          res.cookie(cookieName, cookieValue, {
                            httpOnly: true,
                            secure: req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 24 * 60 * 60 * 1000, // 24 hours
                          })
                          
                          console.log("[Auth Route] Session cookie set manually:", cookieName)
                          
                          resolveSession()
                        }
                      })
                    })
                  }
                } catch (jwtError) {
                  console.error("[Auth Route] Error decoding JWT:", jwtError)
                }
              }
              
              // Forward response - but make sure we don't overwrite Set-Cookie from session
              res.status(proxyRes.statusCode || 500)
              
              // Get Set-Cookie from session first (if it exists)
              const sessionCookie = res.getHeader("Set-Cookie")
              
              // Forward other headers
              Object.keys(proxyRes.headers).forEach((key) => {
                const value = proxyRes.headers[key]
                // Don't overwrite Set-Cookie if we already have one from session
                if (value && key.toLowerCase() !== "set-cookie") {
                  res.setHeader(key, value)
                }
              })
              
              // Log final Set-Cookie header
              const finalSetCookie = res.getHeader("Set-Cookie")
              console.log("[Auth Route] Final Set-Cookie header:", finalSetCookie ? "present" : "missing")
              if (finalSetCookie) {
                console.log("[Auth Route] Final Set-Cookie value:", Array.isArray(finalSetCookie) ? finalSetCookie[0] : finalSetCookie)
              }
              
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
