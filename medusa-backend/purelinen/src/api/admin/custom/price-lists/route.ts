import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/custom/price-lists
 * Returns Price Lists (Purelinen and Linenthings)
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { Client } = require('pg')
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL not set" })
    }

    const client = new Client({ connectionString })
    await client.connect()

    try {
      // Fetch Purelinen and Linenthings Price Lists
      const result = await client.query(`
        SELECT id, title, status
        FROM price_list
        WHERE title IN ('PURELINEN', 'LINENTHINGS')
          AND deleted_at IS NULL
        ORDER BY title ASC
      `)

      res.json({
        price_lists: result.rows,
      })
    } finally {
      await client.end()
    }
  } catch (error: any) {
    console.error("Error fetching price lists:", error)
    res.status(500).json({
      error: "Failed to fetch price lists",
      message: error.message,
    })
  }
}
