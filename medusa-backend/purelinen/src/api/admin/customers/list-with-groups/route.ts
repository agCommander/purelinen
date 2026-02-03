import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { Client } from "pg"

/**
 * Admin API route to list all customers with their groups and approval status
 * GET /admin/customers/list-with-groups
 * Returns all customers with group information and approval status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let dbClient: Client | null = null
  
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    
    dbClient = new Client({
      connectionString: connectionString,
      connectionTimeoutMillis: 5000,
      query_timeout: 15000,
    })
    
    await dbClient.connect()
    
    // Query all customers with their groups and metadata
    // Left join to include customers without groups
    const query = `
      SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.company_name,
        c.created_at,
        c.metadata,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cg.id,
              'name', cg.name,
              'metadata', cg.metadata
            )
          ) FILTER (WHERE cg.id IS NOT NULL),
          '[]'::json
        ) as groups
      FROM customer c
      LEFT JOIN customer_group_customer cgc ON c.id = cgc.customer_id
      LEFT JOIN customer_group cg ON cgc.customer_group_id = cg.id
      GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone, c.company_name, c.created_at, c.metadata
      ORDER BY c.created_at DESC
    `
    
    const result = await dbClient.query(query)
    
    // Format customer data for the UI
    const formattedCustomers = result.rows.map((row: any) => {
      const metadata = row.metadata || {}
      const groups = Array.isArray(row.groups) ? row.groups.filter((g: any) => g.id) : []
      
      // Determine group type
      let groupType: string | null = null
      if (groups.length > 0) {
        const b2bGroup = groups.find(
          (g: any) => {
            const nameMatch = g.name === "B2B Clients"
            const metadataType = g.metadata?.type
            const metadataMatch = metadataType === "b2b" || metadataType === '"b2b"' || metadataType === true
            return nameMatch || metadataMatch
          }
        )
        const retailGroup = groups.find(
          (g: any) => {
            const nameMatch = g.name === "Retail Customers"
            const metadataType = g.metadata?.type
            const metadataMatch = metadataType === "retail" || metadataType === '"retail"' || metadataType === true
            return nameMatch || metadataMatch
          }
        )
        
        if (b2bGroup) {
          groupType = "B2B"
        } else if (retailGroup) {
          groupType = "Retail"
        } else {
          groupType = groups[0]?.name || "Unknown"
        }
      }
      
      return {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        company_name: row.company_name,
        created_at: row.created_at,
        group_type: groupType,
        groups: groups,
        approved: metadata.approved === true || metadata.approved === "true",
        abn_acn: metadata.abn_acn || null,
        business_description: metadata.business_description || null,
        website: metadata.website || null,
      }
    })
    
    res.json({
      customers: formattedCustomers,
      count: formattedCustomers.length
    })
  } catch (error) {
    console.error("Error fetching customers with groups:", error)
    res.status(500).json({
      error: "Failed to fetch customers",
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
