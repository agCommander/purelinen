import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Admin API route to manage customer group assignments
 * PUT /admin/customers/[id]/groups - Assign customer to groups
 * GET /admin/customers/[id]/groups - Get customer's groups
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const customerId = req.params.id
    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any
    
    const customer = await customerModule.retrieveCustomer(customerId, {
      relations: ["groups"]
    })
    
    res.json({
      customer_groups: customer.groups || [],
      count: customer.groups?.length || 0
    })
  } catch (error) {
    console.error("Error fetching customer groups:", error)
    res.status(500).json({
      error: "Failed to fetch customer groups",
      message: error instanceof Error ? error.message : String(error)
    })
  }
}

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const customerId = req.params.id
    const { group_ids } = req.body as { group_ids?: string[] } // Array of customer group IDs
    
    if (!Array.isArray(group_ids)) {
      return res.status(400).json({
        error: "group_ids must be an array"
      })
    }
    
    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any
    
    // Update customer with groups
    const customer = await customerModule.updateCustomers(customerId, {
      groups: group_ids.map((id: string) => ({ id }))
    })
    
    res.json({
      customer: customer
    })
  } catch (error) {
    console.error("Error updating customer groups:", error)
    res.status(500).json({
      error: "Failed to update customer groups",
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
