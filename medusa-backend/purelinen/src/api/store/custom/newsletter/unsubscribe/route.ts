import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

/**
 * Store API route to unsubscribe from newsletter
 * GET /store/custom/newsletter/unsubscribe?email=xxx
 * POST /store/custom/newsletter/unsubscribe
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  let dbClient: Client | null = null
  
  try {
    const email = req.query.email as string

    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" })
    }

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    dbClient = new Client({
      connectionString,
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
    })

    await dbClient.connect()

    // Unsubscribe
    await dbClient.query(
      `UPDATE newsletter_subscription 
       SET is_active = FALSE, 
           unsubscribed_at = NOW(),
           updated_at = NOW()
       WHERE email = $1`,
      [email.toLowerCase()]
    )

    await dbClient.end()

    // Return HTML page
    res.setHeader("Content-Type", "text/html")
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f6f9fc;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #333; margin-bottom: 1rem; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from our newsletter. You will no longer receive emails from us.</p>
            <p>If you change your mind, you can subscribe again anytime.</p>
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    console.error("Error unsubscribing:", error)
    res.status(500).json({
      error: "Failed to unsubscribe",
      message: error instanceof Error ? error.message : String(error),
    })
  } finally {
    if (dbClient) {
      try {
        await dbClient.end()
      } catch (closeError) {
        // Ignore
      }
    }
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let dbClient: Client | null = null
  
  try {
    const body = req.body as any
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    dbClient = new Client({
      connectionString,
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
    })

    await dbClient.connect()

    // Unsubscribe
    await dbClient.query(
      `UPDATE newsletter_subscription 
       SET is_active = FALSE, 
           unsubscribed_at = NOW(),
           updated_at = NOW()
       WHERE email = $1`,
      [email]
    )

    await dbClient.end()

    res.json({
      success: true,
      message: "Successfully unsubscribed",
    })
  } catch (error) {
    console.error("Error unsubscribing:", error)
    res.status(500).json({
      error: "Failed to unsubscribe",
      message: error instanceof Error ? error.message : String(error),
    })
  } finally {
    if (dbClient) {
      try {
        await dbClient.end()
      } catch (closeError) {
        // Ignore
      }
    }
  }
}
