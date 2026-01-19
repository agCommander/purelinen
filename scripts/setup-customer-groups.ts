export default async function setupCustomerGroups() {
  const container = global.__MEDUSA_CONTAINER__
  const customerGroupService = container.resolve("customerGroupService")

  try {
    // Create B2B Customer Group
    const b2bGroup = await customerGroupService.create({
      name: "B2B - Pure Linen",
      metadata: {
        type: "b2b",
        description: "Wholesale customers for Pure Linen",
        pricing_tier: "wholesale"
      }
    })
    console.log("✅ Created B2B Customer Group:", b2bGroup.name)

    // Create Retail Customer Group
    const retailGroup = await customerGroupService.create({
      name: "Retail - Linen Things", 
      metadata: {
        type: "retail",
        description: "Retail customers for Linen Things",
        pricing_tier: "retail"
      }
    })
    console.log("✅ Created Retail Customer Group:", retailGroup.name)

    console.log("\n🎉 Customer Groups setup complete!")
    console.log("B2B Group ID:", b2bGroup.id)
    console.log("Retail Group ID:", retailGroup.id)

  } catch (error) {
    console.error("❌ Error creating customer groups:", error)
  }
}
