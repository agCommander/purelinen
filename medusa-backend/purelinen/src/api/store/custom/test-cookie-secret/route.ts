import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Test endpoint to verify cookie secret (public, no auth required)
 * Call: GET /store/custom/test-cookie-secret
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const cookieHeader = req.headers.cookie || ""
  const connectSidMatch = cookieHeader.match(/connect\.sid=([^;]+)/)
  
  // Get cookie secret from different sources
  const envSecret = process.env.COOKIE_SECRET || "supersecret"
  
  let configSecret = "not found"
  try {
    const configModule = req.scope.resolve("configModule")
    if (configModule?.projectConfig?.http?.cookieSecret) {
      configSecret = configModule.projectConfig.http.cookieSecret
    }
  } catch (e) {
    configSecret = "error: " + (e instanceof Error ? e.message : String(e))
  }
  
  // Try to unsign the cookie with both secrets
  let envResult = null
  let configResult = null
  
  if (connectSidMatch) {
    const signedCookie = connectSidMatch[1]
    const cookieSignature = require("cookie-signature")
    const cookieValue = signedCookie.startsWith('s:') ? signedCookie.substring(2) : signedCookie
    
    try {
      envResult = cookieSignature.unsign(cookieValue, envSecret)
    } catch (e) {
      envResult = "error: " + (e instanceof Error ? e.message : String(e))
    }
    
    try {
      configResult = cookieSignature.unsign(cookieValue, configSecret)
    } catch (e) {
      configResult = "error: " + (e instanceof Error ? e.message : String(e))
    }
  }
  
  // Also check Express session's view
  const session = (req as any).session
  const sessionID = (req as any).sessionID
  
  res.json({
    cookie: {
      found: !!connectSidMatch,
      value: connectSidMatch ? connectSidMatch[1].substring(0, 50) + "..." : "not found",
    },
    secrets: {
      env: {
        value: envSecret.substring(0, 20) + "...",
        length: envSecret.length,
      },
      config: {
        value: typeof configSecret === "string" && configSecret.length > 20 
          ? configSecret.substring(0, 20) + "..." 
          : configSecret,
        length: typeof configSecret === "string" ? configSecret.length : 0,
      },
      match: envSecret === configSecret,
    },
    unsignResults: {
      withEnvSecret: envResult ? (typeof envResult === "string" ? envResult.substring(0, 30) + "..." : "success") : "failed",
      withConfigSecret: configResult ? (typeof configResult === "string" ? configResult.substring(0, 30) + "..." : "success") : "failed",
    },
    expressSession: {
      hasSession: !!session,
      sessionID: sessionID ? sessionID.substring(0, 30) + "..." : "none",
      authIdentityId: session?.auth_identity_id,
      cookieName: (session as any)?.cookie?.name,
    },
  })
}
