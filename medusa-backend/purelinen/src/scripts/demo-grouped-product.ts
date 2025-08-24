import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function demoGroupedProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Creating Grouped Product (Bundle) Demo...")
  
  // Create a luxury bedding bundle
  const beddingBundle = {
    title: "Luxury Bedding Set - Queen",
    handle: "luxury-bedding-set-queen",
    description: "Complete luxury bedding set including duvet cover, pillow shams, and sheets. Perfect for creating a cohesive bedroom look.",
    status: "published",
    weight: 2000,
    options: [
      {
        title: "Color",
        values: ["White", "Natural", "Grey"]
      }
    ],
    variants: [
      {
        title: "White Bundle",
        sku: "BUNDLE-QUEEN-WHITE",
        options: {
          Color: "White"
        },
        prices: [{ amount: 29900, currency_code: "aud" }], // $299 bundle price
        inventory_quantity: 15,
        manage_inventory: true
      },
      {
        title: "Natural Bundle",
        sku: "BUNDLE-QUEEN-NATURAL",
        options: {
          Color: "Natural"
        },
        prices: [{ amount: 29900, currency_code: "aud" }],
        inventory_quantity: 12,
        manage_inventory: true
      },
      {
        title: "Grey Bundle",
        sku: "BUNDLE-QUEEN-GREY",
        options: {
          Color: "Grey"
        },
        prices: [{ amount: 29900, currency_code: "aud" }],
        inventory_quantity: 8,
        manage_inventory: true
      }
    ]
  }
  
  // Create individual products that make up the bundle
  const bundleComponents = [
    {
      title: "Pure Linen Duvet Cover - Queen",
      handle: "pure-linen-duvet-cover-queen",
      description: "100% linen duvet cover in Queen size",
      status: "published",
      weight: 800,
      options: [
        {
          title: "Color",
          values: ["White", "Natural", "Grey"]
        }
      ],
      variants: [
        {
          title: "White",
          sku: "DUVET-QUEEN-WHITE-IND",
          options: { Color: "White" },
          prices: [{ amount: 16000, currency_code: "aud" }], // $160 individual
          inventory_quantity: 45,
          manage_inventory: true
        },
        {
          title: "Natural",
          sku: "DUVET-QUEEN-NATURAL-IND",
          options: { Color: "Natural" },
          prices: [{ amount: 16000, currency_code: "aud" }],
          inventory_quantity: 32,
          manage_inventory: true
        },
        {
          title: "Grey",
          sku: "DUVET-QUEEN-GREY-IND",
          options: { Color: "Grey" },
          prices: [{ amount: 16000, currency_code: "aud" }],
          inventory_quantity: 28,
          manage_inventory: true
        }
      ]
    },
    {
      title: "Linen Pillow Shams - Set of 2",
      handle: "linen-pillow-shams-set-2",
      description: "Set of 2 linen pillow shams",
      status: "published",
      weight: 400,
      options: [
        {
          title: "Color",
          values: ["White", "Natural", "Grey"]
        }
      ],
      variants: [
        {
          title: "White",
          sku: "SHAMS-WHITE-IND",
          options: { Color: "White" },
          prices: [{ amount: 8000, currency_code: "aud" }], // $80 individual
          inventory_quantity: 60,
          manage_inventory: true
        },
        {
          title: "Natural",
          sku: "SHAMS-NATURAL-IND",
          options: { Color: "Natural" },
          prices: [{ amount: 8000, currency_code: "aud" }],
          inventory_quantity: 45,
          manage_inventory: true
        },
        {
          title: "Grey",
          sku: "SHAMS-GREY-IND",
          options: { Color: "Grey" },
          prices: [{ amount: 8000, currency_code: "aud" }],
          inventory_quantity: 38,
          manage_inventory: true
        }
      ]
    },
    {
      title: "Linen Fitted Sheet - Queen",
      handle: "linen-fitted-sheet-queen",
      description: "Linen fitted sheet in Queen size",
      status: "published",
      weight: 600,
      options: [
        {
          title: "Color",
          values: ["White", "Natural", "Grey"]
        }
      ],
      variants: [
        {
          title: "White",
          sku: "SHEET-QUEEN-WHITE-IND",
          options: { Color: "White" },
          prices: [{ amount: 9000, currency_code: "aud" }], // $90 individual
          inventory_quantity: 55,
          manage_inventory: true
        },
        {
          title: "Natural",
          sku: "SHEET-QUEEN-NATURAL-IND",
          options: { Color: "Natural" },
          prices: [{ amount: 9000, currency_code: "aud" }],
          inventory_quantity: 42,
          manage_inventory: true
        },
        {
          title: "Grey",
          sku: "SHEET-QUEEN-GREY-IND",
          options: { Color: "Grey" },
          prices: [{ amount: 9000, currency_code: "aud" }],
          inventory_quantity: 35,
          manage_inventory: true
        }
      ]
    }
  ]
  
  try {
    // Create the bundle and individual products
    await createProductsWorkflow(container).run({
      input: {
        products: [beddingBundle, ...bundleComponents]
      }
    })
    
    logger.info("✅ Grouped Product Demo Created!")
    logger.info("📦 Bundle: Luxury Bedding Set - Queen")
    logger.info("🎯 Bundle Price: $299 (vs $330 individual)")
    logger.info("💰 Savings: $31 (9.4% discount)")
    logger.info("📋 Bundle Includes:")
    logger.info("   • Duvet Cover ($160)")
    logger.info("   • Pillow Shams Set ($80)")
    logger.info("   • Fitted Sheet ($90)")
    logger.info("")
    logger.info("🔧 Next: Creating Custom Admin Interface...")
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      logger.info("⚠️  Demo products already exist")
    } else {
      logger.error("❌ Error creating demo products:", error.message)
    }
  }
} 