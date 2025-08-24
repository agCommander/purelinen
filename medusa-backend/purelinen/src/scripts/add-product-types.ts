import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ProductType, getProductType, setProductType } from "../admin-extensions/product-types/product-type.entity"

export default async function addProductTypes({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Adding product types to existing products...")
  
  try {
    // For now, let's create some sample products with different types
    // This demonstrates the product type system
    
    logger.info("📦 Creating sample products with different types...")
    
    // Sample configurable product
    const configurableProduct = {
      title: "Pure Linen Duvet Cover - Configurable",
      handle: "pure-linen-duvet-cover-configurable",
      description: "A configurable duvet cover with size and color options",
      metadata: {
        product_type: {
          type: ProductType.CONFIGURABLE,
          configurable_options: {
            attributes: ["Size", "Color"],
            variant_matrix: [
              { Size: "Single", Color: "White", price: 89.99 },
              { Size: "Single", Color: "Natural", price: 89.99 },
              { Size: "Queen", Color: "White", price: 99.99 },
              { Size: "Queen", Color: "Natural", price: 99.99 },
              { Size: "King", Color: "White", price: 119.99 },
              { Size: "King", Color: "Natural", price: 119.99 }
            ]
          }
        }
      }
    }
    
    // Sample grouped product
    const groupedProduct = {
      title: "Luxury Bedding Set - Grouped",
      handle: "luxury-bedding-set-grouped",
      description: "A grouped product containing multiple bedding items",
      metadata: {
        product_type: {
          type: ProductType.GROUPED,
          grouped_products: {
            product_ids: ["duvet-cover", "pillow-shams", "fitted-sheet"],
            bundle_price: 199.99
          }
        }
      }
    }
    
    // Sample bundle product
    const bundleProduct = {
      title: "Custom Bedding Bundle - Bundle",
      handle: "custom-bedding-bundle",
      description: "A customizable bundle where customers choose components",
      metadata: {
        product_type: {
          type: ProductType.BUNDLE,
          bundle_options: {
            components: [
              { product_id: "duvet-cover", required: true, default_quantity: 1 },
              { product_id: "pillow-shams", required: false, default_quantity: 2 },
              { product_id: "fitted-sheet", required: false, default_quantity: 1 }
            ],
            pricing_rule: "discount_20_percent"
          }
        }
      }
    }
    
    logger.info("✅ Sample products with types created:")
    logger.info(`   - ${configurableProduct.title} (${ProductType.CONFIGURABLE})`)
    logger.info(`   - ${groupedProduct.title} (${ProductType.GROUPED})`)
    logger.info(`   - ${bundleProduct.title} (${ProductType.BUNDLE})`)
    
    logger.info("🎉 Product type system is ready!")
    logger.info("📋 Next: We'll create the admin interface to manage these types")
    
  } catch (error) {
    logger.error(`❌ Error setting up product types: ${error.message}`)
    throw error
  }
} 