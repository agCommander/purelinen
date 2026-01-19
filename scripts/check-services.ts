import { ExecArgs } from "@medusajs/framework/types"

export default async function checkServices({ container }: ExecArgs) {
  console.log("Available services in container:")
  console.log(Object.keys(container.cradle))
  
  // Try to find product-related services
  const services = Object.keys(container.cradle).filter(key => 
    key.toLowerCase().includes('product') || 
    key.toLowerCase().includes('variant') ||
    key.toLowerCase().includes('option')
  )
  
  console.log("\nProduct-related services:")
  console.log(services)
} 