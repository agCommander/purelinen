export default async function setupCustomerGroupsV2() {
  try {
    console.log("🚀 Setting up Customer Groups and Sales Channels for Medusa v2...")

    // Get services from the container
    const customerGroupService = global.__MEDUSA_CONTAINER__.resolve("customerGroupService")
    const salesChannelService = global.__MEDUSA_CONTAINER__.resolve("salesChannelService")
    const priceListService = global.__MEDUSA_CONTAINER__.resolve("priceListService")

    // 1. Create Customer Groups
    console.log("📋 Creating Customer Groups...")
    
    const b2bGroup = await customerGroupService.create({
      name: "B2B Clients",
      handle: "b2b-clients",
      metadata: {
        type: "b2b",
        requires_login: true,
        hide_prices: true,
        hide_cart: true
      }
    })
    console.log("✅ Created B2B Customer Group:", b2bGroup.name)

    const retailGroup = await customerGroupService.create({
      name: "Retail Customers", 
      handle: "retail-customers",
      metadata: {
        type: "retail",
        requires_login: false,
        hide_prices: false,
        hide_cart: false
      }
    })
    console.log("✅ Created Retail Customer Group:", retailGroup.name)

    // 2. Create Sales Channels
    console.log("🏪 Creating Sales Channels...")
    
    const pureLinenChannel = await salesChannelService.create({
      name: "Pure Linen B2B",
      handle: "purelinen-b2b",
      description: "B2B wholesale channel for Pure Linen",
      is_disabled: false,
      metadata: {
        customer_group: "b2b-clients",
        hide_prices: true,
        hide_cart: true,
        requires_login: true
      }
    })
    console.log("✅ Created Pure Linen B2B Channel:", pureLinenChannel.name)

    const linenThingsChannel = await salesChannelService.create({
      name: "Linen Things Retail",
      handle: "linenthings-retail", 
      description: "Retail channel for Linen Things",
      is_disabled: false,
      metadata: {
        customer_group: "retail-customers",
        hide_prices: false,
        hide_cart: false,
        requires_login: false
      }
    })
    console.log("✅ Created Linen Things Retail Channel:", linenThingsChannel.name)

    // 3. Create Price Lists for different customer groups
    console.log("💰 Creating Price Lists...")
    
    const b2bPriceList = await priceListService.create({
      name: "B2B Wholesale Pricing",
      description: "Wholesale pricing for B2B clients",
      type: "sale",
      status: "active",
      customer_groups: [b2bGroup.id],
      metadata: {
        customer_group: "b2b-clients",
        pricing_type: "wholesale"
      }
    })
    console.log("✅ Created B2B Price List:", b2bPriceList.name)

    const retailPriceList = await priceListService.create({
      name: "Retail Pricing",
      description: "Standard retail pricing",
      type: "sale", 
      status: "active",
      customer_groups: [retailGroup.id],
      metadata: {
        customer_group: "retail-customers",
        pricing_type: "retail"
      }
    })
    console.log("✅ Created Retail Price List:", retailPriceList.name)

    console.log("\n🎉 Setup Complete!")
    console.log("\n📊 Summary:")
    console.log(`   • B2B Customer Group: ${b2bGroup.name} (${b2bGroup.id})`)
    console.log(`   • Retail Customer Group: ${retailGroup.name} (${retailGroup.id})`)
    console.log(`   • Pure Linen B2B Channel: ${pureLinenChannel.name} (${pureLinenChannel.id})`)
    console.log(`   • Linen Things Retail Channel: ${linenThingsChannel.name} (${linenThingsChannel.id})`)
    console.log(`   • B2B Price List: ${b2bPriceList.name} (${b2bPriceList.id})`)
    console.log(`   • Retail Price List: ${retailPriceList.name} (${retailPriceList.id})`)
    
    console.log("\n🔧 Next Steps:")
    console.log("   1. Assign products to appropriate sales channels")
    console.log("   2. Set up pricing rules in each price list")
    console.log("   3. Configure your storefronts to check customer groups")
    console.log("   4. Use metadata to control UI elements (hide prices/cart)")

  } catch (error) {
    console.error("❌ Error setting up customer groups:", error)
    throw error
  }
}
