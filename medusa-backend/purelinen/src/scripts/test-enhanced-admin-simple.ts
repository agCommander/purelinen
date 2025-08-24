import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ProductTypeService } from "../admin-extensions/product-types/product-type.service"
import { StockManagementService } from "../admin-extensions/stock-management/stock-management.service"
import { DiscountManagementService } from "../admin-extensions/discount-management/discount-management.service"
import { SwatchDatabaseService } from "../admin-extensions/image-management/swatch-database.service"
import { ProductType } from "../admin-extensions/product-types/product-type.entity"

export default async function testEnhancedAdminSimple({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🧪 Testing Enhanced Admin Backend (Updated)...")

  try {
    // Initialize services
    const productTypeService = new ProductTypeService(container)
    const stockService = new StockManagementService(container)
    const discountService = new DiscountManagementService(container)
    const swatchService = new SwatchDatabaseService(container)

    logger.info("✅ Services initialized successfully")

    // Test 1: Product Type System - Simple product creation
    logger.info("📦 Testing Product Type System...")
    
    // Create a simple test product first
    const productService = container.resolve("product")
    const timestamp = Date.now()
    const simpleProduct = await productService.createProducts({
      title: "Test Simple Product",
      handle: `test-simple-product-${timestamp}`,
      description: "A test simple product for backend testing"
    })
    
    logger.info(`✅ Created simple product: ${simpleProduct.id}`)

    // Test setting product type
    await productTypeService.setProductType(simpleProduct.id, ProductType.SIMPLE)
    const productType = await productTypeService.getProductType(simpleProduct.id)
    logger.info(`✅ Product type set: ${productType?.type}`)

    // Test 2: Shared Stock Management
    logger.info("📊 Testing Shared Stock Management...")
    
    // Set shared stock for the product
    await stockService.updateSharedStock(simpleProduct.id, 75)
    
    // Set store settings (enable/disable, min stock levels)
    await stockService.updateStoreSettings(simpleProduct.id, "purelinen", {
      enabled: true,
      min_stock_level: 10,
      allow_backorders: false,
      store_name: "Pure Linen"
    })
    
    await stockService.updateStoreSettings(simpleProduct.id, "linenthings", {
      enabled: true,
      min_stock_level: 5,
      allow_backorders: true,
      store_name: "Linen Things"
    })

    // Get stock information
    const stockInfo = await stockService.getProductStock(simpleProduct.id)
    logger.info(`✅ Stock info retrieved: ${stockInfo.shared_stock} shared units`)
    logger.info(`   - Pure Linen: ${stockInfo.store_stocks.find(s => s.store_id === 'purelinen')?.enabled ? 'Enabled' : 'Disabled'}`)
    logger.info(`   - Linen Things: ${stockInfo.store_stocks.find(s => s.store_id === 'linenthings')?.enabled ? 'Enabled' : 'Disabled'}`)
    logger.info(`   - Stock Status: ${stockInfo.stock_status}`)

    // Test 3: Swatch Database
    logger.info("🎨 Testing Swatch Database...")
    
    // Create a test swatch
    const swatchId = await swatchService.createSwatch({
      name: "Pure White",
      color_code: "#FFFFFF",
      color_name: "White",
      image_url: "/images/swatches/white.jpg",
      thumbnail_url: "/images/swatches/white-thumb.jpg",
      category: "Neutral"
    })
    
    logger.info(`✅ Created swatch: ${swatchId}`)

    // Create another swatch
    const swatchId2 = await swatchService.createSwatch({
      name: "Natural Linen",
      color_code: "#F5F5DC",
      color_name: "Natural",
      image_url: "/images/swatches/natural.jpg",
      thumbnail_url: "/images/swatches/natural-thumb.jpg",
      category: "Neutral"
    })
    
    logger.info(`✅ Created second swatch: ${swatchId2}`)

    // Test swatch search
    const searchResults = await swatchService.searchSwatches("white")
    logger.info(`✅ Found ${searchResults.length} swatches matching "white"`)

    // Test swatch statistics
    const swatchStats = await swatchService.getSwatchStatistics()
    logger.info(`✅ Swatch Statistics:`)
    logger.info(`   - Total Swatches: ${swatchStats.total_swatches}`)
    logger.info(`   - Categories: ${swatchStats.categories.join(', ')}`)

    // Test 4: Discount Management
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
      products: [simpleProduct.id]
    })
    
    logger.info(`✅ Created discount: ${discountId}`)

    // Test discount preview
    const discountPreview = await discountService.calculateDiscountPreview(
      simpleProduct.id,
      "purelinen",
      29.99
    )
    
    if (discountPreview) {
      logger.info(`✅ Discount preview calculated:`)
      logger.info(`   - Original: $${discountPreview.original_price}`)
      logger.info(`   - Discounted: $${discountPreview.discounted_price}`)
      logger.info(`   - Savings: $${discountPreview.savings} (${discountPreview.savings_percentage.toFixed(1)}%)`)
    }

    // Test 5: Get statistics
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

    // Test 6: Get products by type
    logger.info("🔍 Testing Product Type Queries...")
    
    const simpleProducts = await productTypeService.getProductsByType(ProductType.SIMPLE)
    logger.info(`✅ Found ${simpleProducts.length} simple products`)

    logger.info("🎉 All Enhanced Admin Backend Tests Passed!")
    logger.info("🚀 The backend is ready for the enhanced admin interface!")

  } catch (error) {
    logger.error(`❌ Test failed: ${error.message}`)
    throw error
  }
} 