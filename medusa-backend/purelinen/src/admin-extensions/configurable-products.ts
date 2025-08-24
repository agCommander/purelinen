import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

// Enhanced Product Interface for Configurable Products
interface ConfigurableProduct {
  id: string
  title: string
  handle: string
  description: string
  status: string
  options: ProductOption[]
  variants: ProductVariant[]
  variantMatrix: VariantMatrix
}

interface ProductOption {
  id: string
  title: string
  values: string[]
}

interface ProductVariant {
  id: string
  title: string
  sku: string
  options: Record<string, string>
  prices: Price[]
  inventory_quantity: number
  manage_inventory: boolean
}

interface VariantMatrix {
  [key: string]: {
    [key: string]: {
      sku: string
      price: number
      inventory: number
      enabled: boolean
    }
  }
}

interface Price {
  amount: number
  currency_code: string
}

export default async function createConfigurableProductDemo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Creating Configurable Product Demo...")
  
  // Create a sample configurable product (Pure Linen Duvet Cover)
  const configurableProduct = {
    title: "Pure Linen Duvet Cover",
    handle: "pure-linen-duvet-cover",
    description: "Luxurious 100% linen duvet cover for ultimate comfort and breathability",
    status: "published",
    weight: 800,
    options: [
      {
        title: "Size",
        values: ["Single", "Double", "Queen", "King"]
      },
      {
        title: "Color", 
        values: ["White", "Natural", "Grey", "Blue"]
      }
    ],
    variants: [
      {
        title: "Single / White",
        sku: "DUVET-SINGLE-WHITE",
        options: {
          Size: "Single",
          Color: "White"
        },
        prices: [{ amount: 12000, currency_code: "aud" }],
        inventory_quantity: 25,
        manage_inventory: true
      },
      {
        title: "Single / Natural",
        sku: "DUVET-SINGLE-NATURAL", 
        options: {
          Size: "Single",
          Color: "Natural"
        },
        prices: [{ amount: 12000, currency_code: "aud" }],
        inventory_quantity: 18,
        manage_inventory: true
      },
      {
        title: "Double / White",
        sku: "DUVET-DOUBLE-WHITE",
        options: {
          Size: "Double", 
          Color: "White"
        },
        prices: [{ amount: 14000, currency_code: "aud" }],
        inventory_quantity: 30,
        manage_inventory: true
      },
      {
        title: "Queen / White",
        sku: "DUVET-QUEEN-WHITE",
        options: {
          Size: "Queen",
          Color: "White" 
        },
        prices: [{ amount: 16000, currency_code: "aud" }],
        inventory_quantity: 45,
        manage_inventory: true
      },
      {
        title: "King / White",
        sku: "DUVET-KING-WHITE",
        options: {
          Size: "King",
          Color: "White"
        },
        prices: [{ amount: 18000, currency_code: "aud" }],
        inventory_quantity: 22,
        manage_inventory: true
      }
    ]
  }
  
  try {
    await createProductsWorkflow(container).run({
      input: {
        products: [configurableProduct]
      }
    })
    
    logger.info("✅ Configurable Product Demo Created!")
    logger.info("📦 Product: Pure Linen Duvet Cover")
    logger.info("🎯 Variants: 5 size/color combinations")
    logger.info("💰 Price Range: $120-$180 AUD")
    logger.info("")
    logger.info("🔧 Next: Creating Variant Matrix Interface...")
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      logger.info("⚠️  Demo product already exists")
    } else {
      logger.error("❌ Error creating demo product:", error.message)
    }
  }
} 