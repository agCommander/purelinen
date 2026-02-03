import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Admin API route to list and manage customer groups
 * GET /admin/customer-groups - List all customer groups
 * POST /admin/customer-groups - Create a new customer group
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any
    
    let customerGroups: any[] = []
    let count = 0
    
    try {
      const groupsResult = await customerModule.listCustomerGroups({})
      
      // Handle different return formats
      if (Array.isArray(groupsResult)) {
        // Could be [items, count] tuple or direct array
        if (groupsResult.length === 2 && Array.isArray(groupsResult[0])) {
          // Tuple format [items, count]
          customerGroups = groupsResult[0]
          count = groupsResult[1] || groupsResult[0].length
        } else if (Array.isArray(groupsResult[0])) {
          // Nested array
          customerGroups = groupsResult[0]
          count = groupsResult[0].length
        } else {
          // Direct array
          customerGroups = groupsResult
          count = groupsResult.length
        }
      } else if (groupsResult && typeof groupsResult === 'object') {
        // Object format with data/customer_groups property
        customerGroups = groupsResult.data || groupsResult.customer_groups || groupsResult.items || []
        count = groupsResult.count || customerGroups.length
      }
    } catch (error) {
      console.error("Error listing customer groups:", error)
      // Return empty array if listing fails
      customerGroups = []
      count = 0
    }
    
    // Ensure we always return an array
    if (!Array.isArray(customerGroups)) {
      customerGroups = []
    }
    
    res.json({
      customer_groups: customerGroups,
      count: count
    })
  } catch (error) {
    console.error("Error fetching customer groups:", error)
    res.status(500).json({
      error: "Failed to fetch customer groups",
      message: error instanceof Error ? error.message : String(error),
      customer_groups: [], // Always return empty array on error
      count: 0
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any
    const { name, handle, metadata } = req.body as { name?: string; handle?: string; metadata?: Record<string, any> }
    
    if (!name || !handle) {
      return res.status(400).json({
        error: "Name and handle are required"
      })
    }
    
    const customerGroup = await customerModule.createCustomerGroups({
      name,
      handle,
      metadata: metadata || {}
    })
    
    res.json({
      customer_group: customerGroup
    })
  } catch (error) {
    console.error("Error creating customer group:", error)
    res.status(500).json({
      error: "Failed to create customer group",
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
