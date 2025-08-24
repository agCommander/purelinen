import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function importData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting data import...")
  
  // Import categories first
  logger.info("📂 Importing categories...")
  
  const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        {
          name: "Bathroom",
          handle: "bathroom",
          description: "Bathroom linens and accessories",
          is_active: true
        },
        {
          name: "Bedroom",
          handle: "bedroom", 
          description: "Bed linens and bedroom accessories",
          is_active: true
        },
        {
          name: "Kitchen",
          handle: "kitchen",
          description: "Kitchen linens and accessories", 
          is_active: true
        },
        {
          name: "Table",
          handle: "table",
          description: "Table linens and accessories",
          is_active: true
        },
        {
          name: "Home Decor",
          handle: "home-decor",
          description: "Home decoration items",
          is_active: true
        },
        {
          name: "Fabrics",
          handle: "fabrics",
          description: "Fabric collections",
          is_active: true
        }
      ]
    }
  })
  
  logger.info(`✅ Created ${categoryResult.length} categories`)
  
  // Import some sample products
  logger.info("📦 Importing sample products...")
  
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Pure Linen Bath Towel",
          handle: "pure-linen-bath-towel",
          description: "Luxurious pure linen bath towel for ultimate comfort",
          status: "published",
          weight: 500,
          options: [
            {
              title: "Size",
              values: ["Standard", "Large"]
            },
            {
              title: "Color", 
              values: ["White", "Natural", "Grey"]
            }
          ],
          variants: [
            {
              title: "Standard / White",
              sku: "BATH-TOWEL-STD-WHITE",
              options: {
                Size: "Standard",
                Color: "White"
              },
              prices: [
                {
                  amount: 4500,
                  currency_code: "aud"
                }
              ]
            },
            {
              title: "Large / Natural", 
              sku: "BATH-TOWEL-LG-NATURAL",
              options: {
                Size: "Large",
                Color: "Natural"
              },
              prices: [
                {
                  amount: 5500,
                  currency_code: "aud"
                }
              ]
            }
          ]
        },
        {
          title: "Linen Bed Sheet Set",
          handle: "linen-bed-sheet-set",
          description: "Breathable linen bed sheets for a perfect night's sleep",
          status: "published", 
          weight: 800,
          options: [
            {
              title: "Size",
              values: ["Single", "Double", "Queen", "King"]
            }
          ],
          variants: [
            {
              title: "Queen",
              sku: "BED-SHEET-QUEEN",
              options: {
                Size: "Queen"
              },
              prices: [
                {
                  amount: 12000,
                  currency_code: "aud"
                }
              ]
            }
          ]
        }
      ]
    }
  })
  
  logger.info("✅ Sample products imported successfully!")
  logger.info("🎉 Data import completed!")
} 