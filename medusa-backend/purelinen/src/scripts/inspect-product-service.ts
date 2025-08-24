import { ExecArgs } from "@medusajs/framework/types"

export default async function inspectProductService({ container }: ExecArgs) {
  const productService = container.resolve("product")
  
  console.log("Product service methods:")
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(productService)))
  
  console.log("\nProduct service properties:")
  console.log(Object.keys(productService))
  
  // Try to see if it has a create method
  if (typeof productService.create === 'function') {
    console.log("\n✅ create method exists")
  } else {
    console.log("\n❌ create method does not exist")
  }
  
  // Try to see if it has a list method
  if (typeof productService.list === 'function') {
    console.log("✅ list method exists")
  } else {
    console.log("❌ list method does not exist")
  }
  
  // Try to see if it has a retrieve method
  if (typeof productService.retrieve === 'function') {
    console.log("✅ retrieve method exists")
  } else {
    console.log("❌ retrieve method does not exist")
  }
} 