import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Store API route to complete B2B registration (step 2)
 * POST /store/custom/customer/complete-b2b-registration
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Get customer ID from auth context or body
    let customerId = (req.auth_context as any)?.actor_id as string | undefined
    
    // If not in auth context, try to get from body (for cases where token might not be set yet)
    const body = req.body as { customer_id?: string; abn_acn?: string; business_description?: string }
    if (!customerId && body.customer_id) {
      customerId = body.customer_id
    }
    
    if (!customerId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "You must be logged in to complete B2B registration"
      })
    }

    const { abn_acn, business_description } = body

    if (!abn_acn || !business_description) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "ABN/ACN and business description are required"
      })
    }

    const customerModule = req.scope.resolve(Modules.CUSTOMER) as any

    // Get current customer metadata
    const currentCustomer = await customerModule.retrieveCustomer(customerId)
    const currentMetadata = currentCustomer.metadata || {}

    // Update customer with B2B details
    await customerModule.updateCustomers(customerId, {
      metadata: {
        ...currentMetadata,
        abn_acn,
        business_description,
        registration_step: 2, // Step 2 complete
        approved: false, // Still pending approval
      }
    })

    res.json({
      success: true,
      message: "B2B registration completed. Your account is pending approval."
    })
  } catch (error) {
    console.error("Error completing B2B registration:", error)
    res.status(500).json({
      error: "Failed to complete B2B registration",
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
