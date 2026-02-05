import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom route handler for /auth/user/emailpass
 * If request is from admin panel, use admin auth instead
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Check if request is coming from admin panel
  // Check multiple sources since reverse proxy might modify headers
  const referer = (req.headers.referer || "").toLowerCase()
  const origin = (req.headers.origin || "").toLowerCase()
  const host = (req.headers.host || "").toLowerCase()
  const xForwardedHost = (req.headers["x-forwarded-host"] || "").toLowerCase()
  const userAgent = (req.headers["user-agent"] || "").toLowerCase()
  
  // Also check if there's a hint in the request body or query
  const isAdminRequest = 
    referer.includes("/app") || 
    origin.includes("/app") ||
    referer.includes("admin") ||
    origin.includes("admin") ||
    // Check if request comes from admin subdomain/domain
    (host.includes("api") && !host.includes("store")) ||
    // In production, admin panel is at /app, so any request to /auth/user/emailpass
    // from the API domain is likely admin (since customers use storefront)
    (host.includes("api-new.purelinen.com.au") || xForwardedHost.includes("api-new"))
  
  // Log for debugging
  console.log("[Auth Route] Detecting admin request:", {
    referer,
    origin,
    host,
    xForwardedHost,
    isAdminRequest,
    path: req.path,
    url: req.url
  })
  
  // If request is from admin panel, use admin auth
  if (isAdminRequest) {
    console.log("[Auth Route] Using admin authentication")
    // Call admin auth endpoint internally
    const { email, password } = req.body
    
    try {
      const authModuleService = req.scope.resolve(Modules.AUTH)
      
      // Authenticate as admin
      const result = await authModuleService.authenticate("admin", "emailpass", {
        email,
        password,
      })
      
      // Set session cookie
      req.session.actor_id = result.actor_id
      req.session.actor_type = "admin"
      req.session.auth_identity_id = result.auth_identity_id
      
      return res.json({
        token: result.token,
        user: result.user,
      })
    } catch (error) {
      console.error("Admin auth error:", error)
      return res.status(401).json({ 
        message: error instanceof Error ? error.message : "Authentication failed" 
      })
    }
  }
  
  // Otherwise, proceed with normal user auth
  console.log("[Auth Route] Using user authentication")
  try {
    const authModuleService = req.scope.resolve(Modules.AUTH)
    const { email, password } = req.body
    
    const result = await authModuleService.authenticate("user", "emailpass", {
      email,
      password,
    })
    
    req.session.actor_id = result.actor_id
    req.session.actor_type = "user"
    req.session.auth_identity_id = result.auth_identity_id
    
    return res.json({
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    return res.status(401).json({ 
      message: error instanceof Error ? error.message : "Authentication failed" 
    })
  }
}
