import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Admin API route to approve/reject B2B customers
 * PUT /admin/customers/[id]/approve
 * Body: { approved: true/false }
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const customerId = req.params.id
    const { approved } = req.body

    if (typeof approved !== "boolean") {
      return res.status(400).json({
        error: "Invalid request",
        message: "approved must be a boolean"
      })
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any

    // Get current customer metadata
    const customer = await customerModule.retrieveCustomer(customerId)
    const currentMetadata = customer.metadata || {}

    // Update customer approval status
    await customerModule.updateCustomers(customerId, {
      metadata: {
        ...currentMetadata,
        approved: approved,
        approved_at: approved ? new Date().toISOString() : null,
      }
    })

    res.json({
      success: true,
      message: `Customer ${approved ? "approved" : "rejected"} successfully`
    })
  } catch (error) {
    console.error("Error updating customer approval:", error)
    res.status(500).json({
      error: "Failed to update customer approval",
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
