import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Script to assign a customer to a customer group
 * Usage: npx medusa exec ./src/scripts/assign-customer-to-group.ts <customer-email> <group-handle>
 * Example: npx medusa exec ./src/scripts/assign-customer-to-group.ts user@example.com b2b-clients
 */
export default async function assignCustomerToGroup({ container, args }: ExecArgs) {
  try {
    const [customerEmail, groupHandle] = args || []

    if (!customerEmail || !groupHandle) {
      console.error("❌ Usage: npx medusa exec ./src/scripts/assign-customer-to-group.ts <customer-email> <group-handle>")
      console.error("   Example: npx medusa exec ./src/scripts/assign-customer-to-group.ts user@example.com b2b-clients")
      return
    }

    const customerModule = container.resolve(Modules.CUSTOMER) as any

    // Find customer by email
    const [customers] = await customerModule.listCustomers({
      email: customerEmail
    })

    if (!customers || customers.length === 0) {
      console.error(`❌ Customer not found with email: ${customerEmail}`)
      return
    }

    const customer = customers[0]
    console.log(`✅ Found customer: ${customer.email} (${customer.id})`)

    // Find customer group by handle
    const [groups] = await customerModule.listCustomerGroups({
      handle: groupHandle
    })

    if (!groups || groups.length === 0) {
      console.error(`❌ Customer group not found with handle: ${groupHandle}`)
      return
    }

    const group = groups[0]
    console.log(`✅ Found customer group: ${group.name} (${group.id})`)

    // Get current groups
    const currentGroups = customer.groups || []
    const groupIds = currentGroups.map((g: any) => g.id)
    
    // Add new group if not already assigned
    if (!groupIds.includes(group.id)) {
      groupIds.push(group.id)
      
      // Update customer with groups
      await customerModule.updateCustomers(customer.id, {
        groups: groupIds.map((id: string) => ({ id }))
      })
      
      console.log(`✅ Assigned customer ${customer.email} to group ${group.name}`)
    } else {
      console.log(`ℹ️  Customer ${customer.email} is already in group ${group.name}`)
    }

  } catch (error) {
    console.error("❌ Error assigning customer to group:", error)
    throw error
  }
}
