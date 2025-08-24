import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ProductTypeService } from "../admin-extensions/product-types/product-type.service"
import { StockManagementService } from "../admin-extensions/stock-management/stock-management.service"
import { DiscountManagementService } from "../admin-extensions/discount-management/discount-management.service"
import { ProductType } from "../admin-extensions/product-types/product-type.entity"

export default async function testEnhancedAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🧪 Testing Enhanced Admin Backend Functionality...")

  try {
    // Initialize services
    const productTypeService = new ProductTypeService(container)
    const stockService = new StockManagementService(container)
    const discountService = new DiscountManagementService(container)

    logger.info("✅ Services initialized successfully")

    // Test 1: Product Type System
    logger.info("📦 Testing Product Type System...")
    
    // Create a test configurable product
    const configurableProductId = await productTypeService.createConfigurableProduct(
      {
        title: "Test Configurable Product",
        handle: "test-configurable-product",
        description: "A test configurable product for backend testing"
      },
      {
        attributes: ["Size", "Color"],
        variantMatrix: [
          { Size: "Small", Color: "Red", price: 29.99, sku: "test-small-red" },
          { Size: "Small", Color: "Blue", price: 29.99, sku: "test-small-blue" },
          { Size: "Large", Color: "Red", price: 39.99, sku: "test-large-red" },
          { Size: "Large", Color: "Blue", price: 39.99, sku: "test-large-blue" }
        ]
      }
    )
    
    logger.info(`✅ Created configurable product: ${configurableProductId}`)

    // Test getting product type
    const productType = await productTypeService.getProductType(configurableProductId)
    logger.info(`✅ Product type retrieved: ${productType?.type}`)

    // Test 2: Stock Management
    logger.info("📊 Testing Stock Management...")
    
    // Set stock for different stores
    await stockService.updateStoreStock(configurableProductId, "purelinen", {
      stock_quantity: 50,
      min_stock_level: 10,
      enabled: true,
      store_name: "Pure Linen"
    })
    
    await stockService.updateStoreStock(configurableProductId, "linenthings", {
      stock_quantity: 25,
      min_stock_level: 5,
      enabled: true,
      store_name: "Linen Things"
    })

    // Get stock information
    const stockInfo = await stockService.getProductStock(configurableProductId)
    logger.info(`✅ Stock info retrieved: ${stockInfo.total_stock} total units`)
    logger.info(`   - Pure Linen: ${stockInfo.store_stocks.find(s => s.store_id === 'purelinen')?.stock_quantity} units`)
    logger.info(`   - Linen Things: ${stockInfo.store_stocks.find(s => s.store_id === 'linenthings')?.stock_quantity} units`)

    // Test 3: Discount Management
    logger.info("💰 Testing Discount Management...")
    
    // Create a test discount
    const discountId = await discountService.createDiscount({
      name: "Test Summer Sale",
      description: "20% off for summer",
      discount_type: "percentage",
      discount_value: 20,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      stores: ["purelinen", "linenthings"],
      products: [configurableProductId]
    })
    
    logger.info(`✅ Created discount: ${discountId}`)

    // Test discount preview
    const discountPreview = await discountService.calculateDiscountPreview(
      configurableProductId,
      "purelinen",
      29.99
    )
    
    if (discountPreview) {
      logger.info(`✅ Discount preview calculated:`)
      logger.info(`   - Original: $${discountPreview.original_price}`)
      logger.info(`   - Discounted: $${discountPreview.discounted_price}`)
      logger.info(`   - Savings: $${discountPreview.savings} (${discountPreview.savings_percentage.toFixed(1)}%)`)
    }

    // Test 4: Get statistics
    logger.info("📈 Testing Statistics...")
    
    const stockSummary = await stockService.getStockSummary()
    logger.info(`✅ Stock Summary:`)
    logger.info(`   - Total Products: ${stockSummary.total_products}`)
    logger.info(`   - In Stock: ${stockSummary.in_stock}`)
    logger.info(`   - Low Stock: ${stockSummary.low_stock}`)
    logger.info(`   - Out of Stock: ${stockSummary.out_of_stock}`)

    const discountStats = await discountService.getDiscountStatistics()
    logger.info(`✅ Discount Statistics:`)
    logger.info(`   - Total Discounts: ${discountStats.total_discounts}`)
    logger.info(`   - Active: ${discountStats.active_discounts}`)
    logger.info(`   - Expired: ${discountStats.expired_discounts}`)
    logger.info(`   - Scheduled: ${discountStats.scheduled_discounts}`)

    // Test 5: Get products by type
    logger.info("🔍 Testing Product Type Queries...")
    
    const configurableProducts = await productTypeService.getProductsByType(ProductType.CONFIGURABLE)
    logger.info(`✅ Found ${configurableProducts.length} configurable products`)

    logger.info("🎉 All Enhanced Admin Backend Tests Passed!")
    logger.info("🚀 The backend is ready for the enhanced admin interface!")

  } catch (error) {
    logger.error(`❌ Test failed: ${error.message}`)
    throw error
  }
} 