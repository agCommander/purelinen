import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function setupCustomerGroupsV2({ container }: ExecArgs) {
  try {
    console.log("🚀 Setting up Customer Groups and Sales Channels for Medusa v2...")

    // Get services from the container using module pattern
    const customerModule = container.resolve(Modules.CUSTOMER) as any
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL) as any
    const pricingModule = container.resolve(Modules.PRICING) as any

    // 1. Create Customer Groups
    console.log("📋 Creating Customer Groups...")
    
    // Check if groups already exist
    let existingGroups: any[] = []
    try {
      const groupsResult = await customerModule.listCustomerGroups({})
      // Handle both [items, count] tuple and direct array/object returns
      existingGroups = Array.isArray(groupsResult)
        ? (Array.isArray(groupsResult[0]) ? groupsResult[0] : groupsResult)
        : (groupsResult?.data || groupsResult?.customer_groups || [])
    } catch (error) {
      console.log("⚠️  Could not list existing customer groups, will try to create new ones")
    }
    
    let b2bGroup = Array.isArray(existingGroups)
      ? existingGroups.find((g: any) => g.handle === "b2b-clients")
      : undefined
    let retailGroup = Array.isArray(existingGroups)
      ? existingGroups.find((g: any) => g.handle === "retail-customers")
      : undefined

    if (!b2bGroup) {
      b2bGroup = await customerModule.createCustomerGroups({
        name: "B2B Clients",
        handle: "b2b-clients",
        metadata: {
          type: "b2b",
          requires_login: "true",
          hide_prices: "true",
          hide_cart: "true"
        }
      })
      console.log("✅ Created B2B Customer Group:", b2bGroup.name)
    } else {
      console.log("ℹ️  B2B Customer Group already exists:", b2bGroup.name)
    }

    if (!retailGroup) {
      retailGroup = await customerModule.createCustomerGroups({
        name: "Retail Customers", 
        handle: "retail-customers",
        metadata: {
          type: "retail",
          requires_login: "false",
          hide_prices: "false",
          hide_cart: "false"
        }
      })
      console.log("✅ Created Retail Customer Group:", retailGroup.name)
    } else {
      console.log("ℹ️  Retail Customer Group already exists:", retailGroup.name)
    }

    // 2. Create Sales Channels
    console.log("\n🏪 Creating Sales Channels...")
    
    let existingChannels: any[] = []
    try {
      const channelsResult = await salesChannelModule.listSalesChannels({})
      // Handle both [items, count] tuple and direct array/object returns
      existingChannels = Array.isArray(channelsResult) 
        ? (Array.isArray(channelsResult[0]) ? channelsResult[0] : channelsResult)
        : (channelsResult?.data || channelsResult?.sales_channels || [])
    } catch (error) {
      console.log("⚠️  Could not list existing sales channels, will try to create new ones")
    }
    
    let pureLinenChannel = Array.isArray(existingChannels) 
      ? existingChannels.find((c: any) => c.handle === "purelinen-b2b")
      : undefined
    let linenThingsChannel = Array.isArray(existingChannels)
      ? existingChannels.find((c: any) => c.handle === "linenthings-retail")
      : undefined

    if (!pureLinenChannel) {
      pureLinenChannel = await salesChannelModule.createSalesChannels({
        name: "Pure Linen B2B",
        handle: "purelinen-b2b",
        description: "B2B wholesale channel for Pure Linen",
        is_disabled: false,
        metadata: {
          customer_group: "b2b-clients",
          hide_prices: "true",
          hide_cart: "true",
          requires_login: "true"
        }
      })
      console.log("✅ Created Pure Linen B2B Channel:", pureLinenChannel.name)
    } else {
      console.log("ℹ️  Pure Linen B2B Channel already exists:", pureLinenChannel.name)
    }

    if (!linenThingsChannel) {
      linenThingsChannel = await salesChannelModule.createSalesChannels({
        name: "Linen Things Retail",
        handle: "linenthings-retail", 
        description: "Retail channel for Linen Things",
        is_disabled: false,
        metadata: {
          customer_group: "retail-customers",
          hide_prices: "false",
          hide_cart: "false",
          requires_login: "false"
        }
      })
      console.log("✅ Created Linen Things Retail Channel:", linenThingsChannel.name)
    } else {
      console.log("ℹ️  Linen Things Retail Channel already exists:", linenThingsChannel.name)
    }

    // 3. Create Price Lists for different customer groups
    console.log("\n💰 Creating Price Lists...")
    
    let existingPriceLists: any[] = []
    try {
      const priceListsResult = await pricingModule.listPriceLists({})
      // Handle both [items, count] tuple and direct array/object returns
      existingPriceLists = Array.isArray(priceListsResult)
        ? (Array.isArray(priceListsResult[0]) ? priceListsResult[0] : priceListsResult)
        : (priceListsResult?.data || priceListsResult?.price_lists || [])
    } catch (error) {
      console.log("⚠️  Could not list existing price lists, will try to create new ones")
    }
    
    let b2bPriceList = Array.isArray(existingPriceLists)
      ? existingPriceLists.find((pl: any) => pl.name === "B2B Wholesale Pricing")
      : undefined
    let retailPriceList = Array.isArray(existingPriceLists)
      ? existingPriceLists.find((pl: any) => pl.name === "Retail Pricing")
      : undefined

    if (!b2bPriceList) {
      b2bPriceList = await pricingModule.createPriceLists({
        name: "B2B Wholesale Pricing",
        description: "Wholesale pricing for B2B clients",
        type: "sale",
        status: "active",
        customer_groups: [{ id: b2bGroup.id }],
        metadata: {
          customer_group: "b2b-clients",
          pricing_type: "wholesale"
        }
      })
      console.log("✅ Created B2B Price List:", b2bPriceList.name)
    } else {
      console.log("ℹ️  B2B Price List already exists:", b2bPriceList.name)
    }

    if (!retailPriceList) {
      retailPriceList = await pricingModule.createPriceLists({
        name: "Retail Pricing",
        description: "Standard retail pricing",
        type: "sale", 
        status: "active",
        customer_groups: [{ id: retailGroup.id }],
        metadata: {
          customer_group: "retail-customers",
          pricing_type: "retail"
        }
      })
      console.log("✅ Created Retail Price List:", retailPriceList.name)
    } else {
      console.log("ℹ️  Retail Price List already exists:", retailPriceList.name)
    }

    console.log("\n🎉 Setup Complete!")
    console.log("\n📊 Summary:")
    console.log(`   • B2B Customer Group: ${b2bGroup.name} (ID: ${b2bGroup.id})`)
    console.log(`   • Retail Customer Group: ${retailGroup.name} (ID: ${retailGroup.id})`)
    console.log(`   • Pure Linen B2B Channel: ${pureLinenChannel.name} (ID: ${pureLinenChannel.id})`)
    console.log(`   • Linen Things Retail Channel: ${linenThingsChannel.name} (ID: ${linenThingsChannel.id})`)
    console.log(`   • B2B Price List: ${b2bPriceList.name} (ID: ${b2bPriceList.id})`)
    console.log(`   • Retail Price List: ${retailPriceList.name} (ID: ${retailPriceList.id})`)
    
    console.log("\n📝 Note: Customer Groups can be viewed and managed in the Medusa Admin:")
    console.log("   • Go to: Settings → Customer Groups")
    console.log("   • Or via API: GET /admin/customer-groups")
    
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
