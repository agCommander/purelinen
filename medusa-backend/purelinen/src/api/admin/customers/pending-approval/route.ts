import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { Client } from "pg"

/**
 * Admin API route to list B2B customers pending approval
 * GET /admin/customers/pending-approval
 * Returns customers in B2B group with approved: false or undefined
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let dbClient: Client | null = null
  
  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any
    
    // First, get the B2B customer group
    const groupsResult = await customerModule.listCustomerGroups({})
    
    let customerGroups: any[] = []
    if (Array.isArray(groupsResult)) {
      if (groupsResult.length === 2 && Array.isArray(groupsResult[0])) {
        customerGroups = groupsResult[0]
      } else if (Array.isArray(groupsResult[0])) {
        customerGroups = groupsResult[0]
      } else {
        customerGroups = groupsResult
      }
    } else if (groupsResult && typeof groupsResult === 'object') {
      customerGroups = groupsResult.data || groupsResult.customer_groups || groupsResult.items || []
    }
    
    // Find B2B group by handle or name
    const b2bGroup = customerGroups.find(
      (g: any) => g.handle === "b2b-clients" || 
                  g.name === "B2B Clients" ||
                  (g.metadata && g.metadata.type === "b2b")
    )
    
    if (!b2bGroup) {
      return res.json({
        customers: [],
        count: 0
      })
    }
    
    // Use direct database query to find customers in B2B group
    // This avoids the relations issue with listCustomers
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
    
    // Query customers in B2B group with metadata
    // Join customer_group_customer junction table to find customers in B2B group
    // Filter by metadata.approved = false or null
    const query = `
      SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.company_name,
        c.created_at,
        c.metadata
      FROM customer c
      INNER JOIN customer_group_customer cgc ON c.id = cgc.customer_id
      WHERE cgc.customer_group_id = $1
        AND (c.metadata->>'approved' = 'false' OR c.metadata->>'approved' IS NULL)
      ORDER BY c.created_at DESC
    `
    
    const result = await dbClient.query(query, [b2bGroup.id])
    
    // Format customer data for the UI
    const formattedCustomers = result.rows.map((row: any) => {
      const metadata = row.metadata || {}
      return {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        company_name: row.company_name,
        created_at: row.created_at,
        abn_acn: metadata.abn_acn || null,
        business_description: metadata.business_description || null,
        website: metadata.website || null,
        approved: metadata.approved || false,
        registration_step: metadata.registration_step || null,
      }
    })
    
    res.json({
      customers: formattedCustomers,
      count: formattedCustomers.length
    })
  } catch (error) {
    console.error("Error fetching pending approval customers:", error)
    res.status(500).json({
      error: "Failed to fetch pending approval customers",
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
