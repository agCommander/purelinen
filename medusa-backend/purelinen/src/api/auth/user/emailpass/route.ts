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
      
      // Medusa's authenticate should handle session creation automatically
      // Return the response that Medusa would normally return
      res.status(200).json({
        auth_identity_id: authIdentity.id,
        actor_type: "admin",
      })
      return
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
