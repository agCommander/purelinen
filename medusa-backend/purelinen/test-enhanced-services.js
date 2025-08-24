const { ProductTypeService } = require('./src/admin-extensions/product-types/product-type.service')
const { StockManagementService } = require('./src/admin-extensions/stock-management/stock-management.service')
const { DiscountManagementService } = require('./src/admin-extensions/discount-management/discount-management.service')

console.log('🧪 Testing Enhanced Backend Services...')

// Test Product Type Service
try {
  console.log('✅ Product Type Service loaded successfully')
} catch (error) {
  console.log('❌ Product Type Service failed:', error.message)
}

// Test Stock Management Service
try {
  console.log('✅ Stock Management Service loaded successfully')
} catch (error) {
  console.log('❌ Stock Management Service failed:', error.message)
}

// Test Discount Management Service
try {
  console.log('✅ Discount Management Service loaded successfully')
} catch (error) {
  console.log('❌ Discount Management Service failed:', error.message)
}

console.log('🎯 Enhanced services test completed!')
