import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

/**
 * Store API route to handle newsletter subscriptions
 * POST /store/custom/newsletter/subscribe
 * Stores email address for newsletter subscription
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let dbClient: Client | null = null
  
  try {
    // Handle body parsing
    let body: any = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch (parseError) {
        return res.status(400).json({
          error: "Invalid JSON in request body",
          message: parseError instanceof Error ? parseError.message : String(parseError)
        })
      }
    }
    
    const email = body?.email?.trim().toLowerCase()
    
    if (!email) {
      return res.status(400).json({
        error: "Email is required"
      })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      })
    }
    
    // Connect to database
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    
    dbClient = new Client({
      connectionString: connectionString,
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
    })
    
    await dbClient.connect()
    
    // Check if table exists, create if it doesn't
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS newsletter_subscription (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    await dbClient.query(createTableQuery)
    
    // Check if email already exists
    const checkQuery = `
      SELECT id, is_active FROM newsletter_subscription 
      WHERE email = $1
    `
    const existing = await dbClient.query(checkQuery, [email])
    
    if (existing.rows.length > 0) {
      const subscription = existing.rows[0]
      
      // If already subscribed and active, return success
      if (subscription.is_active) {
        return res.json({
          success: true,
          message: "You are already subscribed to our newsletter",
          already_subscribed: true
        })
      }
      
      // If unsubscribed, reactivate
      const reactivateQuery = `
        UPDATE newsletter_subscription 
        SET is_active = TRUE,
            subscribed_at = NOW(),
            unsubscribed_at = NULL,
            updated_at = NOW()
        WHERE email = $1
        RETURNING id
      `
      await dbClient.query(reactivateQuery, [email])
      
      return res.json({
        success: true,
        message: "Thank you for resubscribing to our newsletter!",
        reactivated: true
      })
    }
    
    // Insert new subscription
    const insertQuery = `
      INSERT INTO newsletter_subscription (email, is_active, subscribed_at)
      VALUES ($1, TRUE, NOW())
      RETURNING id, email, subscribed_at
    `
    
    const result = await dbClient.query(insertQuery, [email])
    
    res.json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
      subscription: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        subscribed_at: result.rows[0].subscribed_at
      }
    })
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error)
    
    // Handle unique constraint violation (email already exists)
    if (error.code === '23505') {
      return res.json({
        success: true,
        message: "You are already subscribed to our newsletter",
        already_subscribed: true
      })
    }
    
    res.status(500).json({
      error: "Failed to subscribe to newsletter",
      message: error instanceof Error ? error.message : String(error)
    })
  } finally {
    if (dbClient) {
      try {
        await dbClient.end()
      } catch (closeError) {
        console.error("Error closing database connection:", closeError)
      }
    }
  }
}
