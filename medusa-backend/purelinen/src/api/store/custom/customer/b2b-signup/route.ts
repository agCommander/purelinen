import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Store API route to handle B2B customer signup and assign to B2B group
 * POST /store/custom/customer/b2b-signup
 * Called after customer is created to assign them to B2B group
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Handle body parsing - it might be a string or already parsed
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
    
    const customer_id = body?.customer_id

    if (!customer_id) {
      return res.status(400).json({
        error: "Missing customer_id"
      })
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any

    // Get B2B customer group - list all groups and filter by handle/name/metadata
    const groupsResult = await customerModule.listCustomerGroups({})
    
    // Handle different return formats
    let allGroups: any[] = []
    if (Array.isArray(groupsResult)) {
      allGroups = Array.isArray(groupsResult[0]) ? groupsResult[0] : groupsResult
    } else if (groupsResult?.data) {
      allGroups = groupsResult.data
    } else if (groupsResult?.customer_groups) {
      allGroups = groupsResult.customer_groups
    }

    // Filter by handle or name (handle might not be returned, so fallback to name)
    let b2bGroup = allGroups.find((g: any) => g.handle === "b2b-clients")
    
    // Fallback: try by name if handle not found
    if (!b2bGroup) {
      b2bGroup = allGroups.find((g: any) => g.name === "B2B Clients" || g.name?.toLowerCase().includes("b2b"))
    }
    
    // Fallback: try by metadata if still not found
    if (!b2bGroup) {
      b2bGroup = allGroups.find((g: any) => g.metadata?.type === "b2b")
    }

    if (!b2bGroup) {
      console.error("B2B customer group not found")
      return res.status(404).json({
        error: "B2B customer group not found",
        message: "Please run the setup script to create customer groups"
      })
    }

    // Get current customer with groups relation loaded
    const customer = await customerModule.retrieveCustomer(customer_id, {
      relations: ["groups"]
    })
    
    const currentGroups = customer.groups || []
    const groupIds = currentGroups.map((g: any) => g.id)

    // Add B2B group if not already assigned
    if (!groupIds.includes(b2bGroup.id)) {
      // Use direct database insert into junction table
      const { Client } = require('pg')
      const connectionString = process.env.DATABASE_URL
      
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set')
      }
      
      const dbClient = new Client({ connectionString })
      await dbClient.connect()
      
      try {
        // Check if relationship already exists
        const checkResult = await dbClient.query(
          `SELECT 1 FROM customer_group_customer 
           WHERE customer_id = $1 AND customer_group_id = $2 
           LIMIT 1`,
          [customer_id, b2bGroup.id]
        )
        
        if (checkResult.rows.length === 0) {
          // Insert into customer_group_customer junction table
          const { v4: uuidv4 } = require('uuid')
          const junctionId = uuidv4()
          
          await dbClient.query(
            `INSERT INTO customer_group_customer (id, customer_id, customer_group_id) 
             VALUES ($1, $2, $3)`,
            [junctionId, customer_id, b2bGroup.id]
          )
        }
      } catch (dbError: any) {
        // If it's a unique constraint error, the relationship might already exist
        if (dbError.code !== '23505' && !dbError.message?.includes('duplicate') && !dbError.message?.includes('unique')) {
          throw dbError
        }
      } finally {
        await dbClient.end()
      }
    }

    res.json({
      success: true,
      message: "Customer assigned to B2B group",
      customer_id,
      group_id: b2bGroup.id
    })
  } catch (error) {
    console.error("Error assigning customer to B2B group:", error)
    res.status(500).json({
      error: "Failed to assign customer to B2B group",
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
