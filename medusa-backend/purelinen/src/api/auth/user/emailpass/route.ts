import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface AuthRequestBody {
  email: string
  password: string
}

/**
 * Custom route handler for /auth/user/emailpass
 * If request is from admin panel, proxy to admin auth endpoint
 */
export async function POST(
  req: MedusaRequest<AuthRequestBody>,
  res: MedusaResponse
): Promise<void> {
  // Check if request is coming from admin panel
  // Check multiple sources since reverse proxy might modify headers
  const referer = Array.isArray(req.headers.referer) 
    ? req.headers.referer[0] || "" 
    : req.headers.referer || ""
  const origin = Array.isArray(req.headers.origin)
    ? req.headers.origin[0] || ""
    : req.headers.origin || ""
  const host = Array.isArray(req.headers.host)
    ? req.headers.host[0] || ""
    : req.headers.host || ""
  const xForwardedHost = Array.isArray(req.headers["x-forwarded-host"])
    ? req.headers["x-forwarded-host"][0] || ""
    : req.headers["x-forwarded-host"] || ""
  
  const refererLower = referer.toLowerCase()
  const originLower = origin.toLowerCase()
  const hostLower = host.toLowerCase()
  const xForwardedHostLower = xForwardedHost.toLowerCase()
  
  // Check if request is from admin panel
  const isAdminRequest = 
    refererLower.includes("/app") || 
    originLower.includes("/app") ||
    refererLower.includes("admin") ||
    originLower.includes("admin") ||
    // Check if request comes from admin subdomain/domain
    (hostLower.includes("api") && !hostLower.includes("store")) ||
    // In production, admin panel is at /app, so any request to /auth/user/emailpass
    // from the API domain is likely admin (since customers use storefront)
    (hostLower.includes("api-new.purelinen.com.au") || xForwardedHostLower.includes("api-new"))
  
  // Log for debugging
  console.log("[Auth Route] Detecting admin request:", {
    referer: refererLower,
    origin: originLower,
    host: hostLower,
    xForwardedHost: xForwardedHostLower,
    isAdminRequest,
    path: req.path,
    url: req.url
  })
  
  // If request is from admin panel, proxy to admin auth endpoint
  if (isAdminRequest) {
    console.log("[Auth Route] Proxying to admin authentication")
    
    try {
      // Make internal HTTP request to admin auth endpoint
      const adminAuthUrl = `http://localhost:${process.env.PORT || 9000}/auth/admin/emailpass`
      const response = await fetch(adminAuthUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        res.status(response.status).json(data)
        return
      }
      
      // Copy response headers (especially Set-Cookie for session)
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          res.setHeader(key, value)
        }
      })
      
      res.status(response.status).json(data)
      return
    } catch (error) {
      console.error("Admin auth proxy error:", error)
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Authentication failed" 
      })
      return
    }
  }
  
  // Otherwise, let Medusa handle it normally (for customer auth)
  // We'll return 400 to indicate they should use the correct endpoint
  // In practice, Medusa will handle this route, but since we've overridden it,
  // we need to handle it ourselves or let it fall through
  console.log("[Auth Route] User authentication - letting Medusa handle")
  
  // For now, return error suggesting to use customer auth endpoint
  // Actually, we should let Medusa's default handler process this
  // But since we've created this route, it will intercept
  // The best solution is to not create this route and instead use middleware
  // But for now, let's just proxy to the user endpoint
  try {
    const userAuthUrl = `http://localhost:${process.env.PORT || 9000}/auth/user/emailpass`
    const response = await fetch(userAuthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })
    
    const data = await response.json()
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        res.setHeader(key, value)
      }
    })
    
    res.status(response.status).json(data)
    return
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Authentication failed" 
    })
    return
  }
}
