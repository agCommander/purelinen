export default async function setupSalesChannels() {
  const container = global.__MEDUSA_CONTAINER__
  const salesChannelService = container.resolve("salesChannelService")

  try {
    console.log("🚀 Setting up Sales Channels...")

    // Create Pure Linen B2B Sales Channel
    const pureLinenChannel = await salesChannelService.create({
      name: "Pure Linen B2B",
      description: "B2B wholesale channel for Pure Linen customers",
      is_disabled: false
    })
    console.log("✅ Created Pure Linen B2B Channel:", pureLinenChannel.name)

    // Create Linen Things Retail Sales Channel  
    const linenThingsChannel = await salesChannelService.create({
      name: "Linen Things Retail",
      description: "Retail e-commerce channel for Linen Things customers",
      is_disabled: false
    })
    console.log("✅ Created Linen Things Retail Channel:", linenThingsChannel.name)

    console.log("\n🎉 Sales Channels setup complete!")
    console.log("Pure Linen B2B Channel ID:", pureLinenChannel.id)
    console.log("Linen Things Retail Channel ID:", linenThingsChannel.id)

    console.log("\n📋 Next Steps:")
    console.log("1. Assign products to appropriate sales channels")
    console.log("2. Configure your storefronts to use the correct channel")
    console.log("3. Pure Linen storefront: Hide prices/cart, require login")
    console.log("4. Linen Things storefront: Show prices/cart, allow payments")

  } catch (error) {
    console.error("❌ Error creating sales channels:", error)
  }
} 