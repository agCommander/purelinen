const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 9000

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from public directory
app.use(express.static('public'))

// In-memory storage for our enhanced services
const productTypes = new Map()
const productStock = new Map()
const productDiscounts = new Map()
const swatchDatabase = new Map()

// Swatch Database Service
class SwatchDatabaseService {
  constructor() {
    this.categories = ['color', 'material', 'pattern', 'finish']
    this.defaultSwatches = {
      color: [
        { id: 'white', name: 'White', hex: '#FFFFFF', rgb: '255,255,255' },
        { id: 'cream', name: 'Cream', hex: '#F5F5DC', rgb: '245,245,220' },
        { id: 'beige', name: 'Beige', hex: '#F5F5DC', rgb: '245,245,220' },
        { id: 'natural', name: 'Natural', hex: '#F5E6D3', rgb: '245,230,211' },
        { id: 'ecru', name: 'Ecru', hex: '#C2B280', rgb: '194,178,128' }
      ],
      material: [
        { id: 'linen', name: 'Linen', description: 'Natural linen fabric' },
        { id: 'cotton', name: 'Cotton', description: 'Pure cotton fabric' },
        { id: 'bamboo', name: 'Bamboo', description: 'Bamboo viscose fabric' },
        { id: 'silk', name: 'Silk', description: 'Natural silk fabric' }
      ],
      pattern: [
        { id: 'solid', name: 'Solid', description: 'No pattern' },
        { id: 'striped', name: 'Striped', description: 'Vertical stripes' },
        { id: 'geometric', name: 'Geometric', description: 'Geometric patterns' },
        { id: 'floral', name: 'Floral', description: 'Floral patterns' }
      ],
      finish: [
        { id: 'matte', name: 'Matte', description: 'Non-shiny finish' },
        { id: 'satin', name: 'Satin', description: 'Smooth, shiny finish' },
        { id: 'textured', name: 'Textured', description: 'Textured surface' }
      ]
    }
    
    // Initialize with default swatches
    this.initializeDefaultSwatches()
  }

  initializeDefaultSwatches() {
    this.categories.forEach(category => {
      if (!swatchDatabase.has(category)) {
        swatchDatabase.set(category, this.defaultSwatches[category])
      }
    })
  }

  getSwatchesByCategory(category) {
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid swatch category: ${category}`)
    }
    return swatchDatabase.get(category) || []
  }

  getAllSwatches() {
    const allSwatches = {}
    this.categories.forEach(category => {
      allSwatches[category] = this.getSwatchesByCategory(category)
    })
    return allSwatches
  }

  addSwatch(category, swatchData) {
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid swatch category: ${category}`)
    }
    
    const { id, name, ...otherProps } = swatchData
    if (!id || !name) {
      throw new Error('Swatch must have id and name')
    }
    
    const existingSwatches = this.getSwatchesByCategory(category)
    const existingIndex = existingSwatches.findIndex(s => s.id === id)
    
    if (existingIndex !== -1) {
      throw new Error(`Swatch with id '${id}' already exists in category '${category}'`)
    }
    
    const newSwatch = {
      id,
      name,
      ...otherProps,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    existingSwatches.push(newSwatch)
    swatchDatabase.set(category, existingSwatches)
    
    return newSwatch
  }

  updateSwatch(category, swatchId, updates) {
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid swatch category: ${category}`)
    }
    
    const existingSwatches = this.getSwatchesByCategory(category)
    const swatchIndex = existingSwatches.findIndex(s => s.id === swatchId)
    
    if (swatchIndex === -1) {
      throw new Error(`Swatch '${swatchId}' not found in category '${category}'`)
    }
    
    existingSwatches[swatchIndex] = {
      ...existingSwatches[swatchIndex],
      ...updates,
      updated_at: new Date()
    }
    
    swatchDatabase.set(category, existingSwatches)
    return existingSwatches[swatchIndex]
  }

  deleteSwatch(category, swatchId) {
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid swatch category: ${category}`)
    }
    
    const existingSwatches = this.getSwatchesByCategory(category)
    const filteredSwatches = existingSwatches.filter(s => s.id !== swatchId)
    
    if (filteredSwatches.length === existingSwatches.length) {
      throw new Error(`Swatch '${swatchId}' not found in category '${category}'`)
    }
    
    swatchDatabase.set(category, filteredSwatches)
    return { success: true, message: `Swatch '${swatchId}' deleted from category '${category}'` }
  }

  searchSwatches(query, category = null) {
    const searchResults = {}
    const searchTerm = query.toLowerCase()
    
    const categoriesToSearch = category ? [category] : this.categories
    
    categoriesToSearch.forEach(cat => {
      const swatches = this.getSwatchesByCategory(cat)
      const matches = swatches.filter(swatch => 
        swatch.name.toLowerCase().includes(searchTerm) ||
        swatch.id.toLowerCase().includes(searchTerm) ||
        (swatch.description && swatch.description.toLowerCase().includes(searchTerm))
      )
      
      if (matches.length > 0) {
        searchResults[cat] = matches
      }
    })
    
    return searchResults
  }

  getSwatchSummary() {
    const summary = {
      total_categories: this.categories.length,
      total_swatches: 0,
      category_breakdown: {}
    }
    
    this.categories.forEach(category => {
      const swatches = this.getSwatchesByCategory(category)
      summary.total_swatches += swatches.length
      summary.category_breakdown[category] = {
        count: swatches.length,
        examples: swatches.slice(0, 3).map(s => s.name)
      }
    })
    
    return summary
  }
}

// Product Type Management Service
class ProductTypeService {
  constructor() {
    this.types = ['simple', 'configurable', 'grouped', 'bundle']
  }

  getProductType(productId) {
    return productTypes.get(productId) || { type: 'simple', options: [] }
  }

  setProductType(productId, type, options = []) {
    if (!this.types.includes(type)) {
      throw new Error(`Invalid product type: ${type}`)
    }
    
    const productType = { type, options, updated_at: new Date() }
    productTypes.set(productId, productType)
    return productType
  }

  createConfigurableProduct(productId, baseProduct, variants) {
    const configurableProduct = {
      type: 'configurable',
      base_product: baseProduct,
      variants: variants,
      options: ['Size', 'Color'], // Default options
      updated_at: new Date()
    }
    
    productTypes.set(productId, configurableProduct)
    return configurableProduct
  }

  getAllProductTypes() {
    return Array.from(productTypes.entries()).map(([id, type]) => ({
      product_id: id,
      ...type
    }))
  }
}

// Shared Stock Management Service
class StockManagementService {
  constructor() {
    this.stores = ['purelinen', 'linenthings']
  }

  getProductStock(productId) {
    return productStock.get(productId) || {
      shared_stock: 0,
      store_stocks: {
        purelinen: { enabled: true, min_stock: 10 },
        linenthings: { enabled: true, min_stock: 10 }
      },
      updated_at: new Date()
    }
  }

  updateSharedStock(productId, sharedStock) {
    const currentStock = this.getProductStock(productId)
    currentStock.shared_stock = sharedStock
    currentStock.updated_at = new Date()
    
    productStock.set(productId, currentStock)
    return currentStock
  }

  toggleStoreStatus(productId, storeId, enabled) {
    if (!this.stores.includes(storeId)) {
      throw new Error(`Invalid store: ${storeId}`)
    }
    
    const currentStock = this.getProductStock(productId)
    currentStock.store_stocks[storeId].enabled = enabled
    currentStock.updated_at = new Date()
    
    productStock.set(productId, currentStock)
    return currentStock
  }

  getStockSummary() {
    const summary = {
      total_products: productStock.size,
      low_stock_products: 0,
      out_of_stock_products: 0,
      store_summaries: {}
    }
    
    this.stores.forEach(storeId => {
      summary.store_summaries[storeId] = {
        enabled_products: 0,
        low_stock_products: 0
      }
    })
    
    for (const [productId, stock] of productStock) {
      if (stock.shared_stock === 0) summary.out_of_stock_products++
      if (stock.shared_stock <= 10) summary.low_stock_products++
      
      this.stores.forEach(storeId => {
        const storeStock = stock.store_stocks[storeId]
        if (storeStock.enabled) summary.store_summaries[storeId].enabled_products++
        if (stock.shared_stock <= storeStock.min_stock) {
          summary.store_summaries[storeId].low_stock_products++
        }
      })
    }
    
    return summary
  }
}

// Discount Management Service
class DiscountManagementService {
  constructor() {
    this.stores = ['purelinen', 'linenthings']
  }

  getProductDiscounts(productId) {
    return productDiscounts.get(productId) || []
  }

  createDiscount(productId, discountData) {
    const { type, value, start_date, end_date, stores = this.stores } = discountData
    
    if (!['percentage', 'fixed'].includes(type)) {
      throw new Error('Invalid discount type. Must be "percentage" or "fixed"')
    }
    
    if (value <= 0) {
      throw new Error('Discount value must be greater than 0')
    }
    
    const discount = {
      id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      value,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      stores,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    const currentDiscounts = this.getProductDiscounts(productId)
    currentDiscounts.push(discount)
    productDiscounts.set(productId, currentDiscounts)
    
    return discount
  }

  updateDiscount(productId, discountId, updates) {
    const currentDiscounts = this.getProductDiscounts(productId)
    const discountIndex = currentDiscounts.findIndex(d => d.id === discountId)
    
    if (discountIndex === -1) {
      throw new Error('Discount not found')
    }
    
    currentDiscounts[discountIndex] = {
      ...currentDiscounts[discountIndex],
      ...updates,
      updated_at: new Date()
    }
    
    productDiscounts.set(productId, currentDiscounts)
    return currentDiscounts[discountIndex]
  }

  deleteDiscount(productId, discountId) {
    const currentDiscounts = this.getProductDiscounts(productId)
    const filteredDiscounts = currentDiscounts.filter(d => d.id !== discountId)
    
    if (filteredDiscounts.length === currentDiscounts.length) {
      throw new Error('Discount not found')
    }
    
    productDiscounts.set(productId, filteredDiscounts)
    return { success: true, message: 'Discount deleted successfully' }
  }

  getActiveDiscounts(productId) {
    const now = new Date()
    const allDiscounts = this.getProductDiscounts(productId)
    
    return allDiscounts.filter(discount => {
      return now >= discount.start_date && now <= discount.end_date
    })
  }

  getDiscountSummary() {
    const summary = {
      total_discounts: 0,
      active_discounts: 0,
      expired_discounts: 0,
      upcoming_discounts: 0,
      store_summaries: {}
    }
    
    this.stores.forEach(storeId => {
      summary.store_summaries[storeId] = {
        total_discounts: 0,
        active_discounts: 0
      }
    })
    
    const now = new Date()
    
    for (const [productId, discounts] of productDiscounts.entries()) {
      summary.total_discounts += discounts.length
      
      discounts.forEach(discount => {
        if (now >= discount.start_date && now <= discount.end_date) {
          summary.active_discounts++
          discount.stores.forEach(storeId => {
            if (summary.store_summaries[storeId]) {
              summary.store_summaries[storeId].active_discounts++
            }
          })
        } else if (now > discount.end_date) {
          summary.expired_discounts++
        } else if (now < discount.start_date) {
          summary.upcoming_discounts++
        }
        
        discount.stores.forEach(storeId => {
          if (summary.store_summaries[storeId]) {
            summary.store_summaries[storeId].total_discounts++
          }
        })
      })
    }
    
    return summary
  }
}

// Initialize services
const productTypeService = new ProductTypeService()
const stockService = new StockManagementService()
const discountService = new DiscountManagementService()
const swatchService = new SwatchDatabaseService()

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Enhanced Medusa Backend Running' })
})

// Enhanced services status
app.get('/api/enhanced/status', (req, res) => {
  res.json({
    status: 'OK',
    services: {
      productTypes: 'Ready',
      stockManagement: 'Ready', 
      discountManagement: 'Ready',
      swatchDatabase: 'Ready'
    },
    message: 'Enhanced backend services are available'
  })
})

// Product Type Management API
app.get('/api/enhanced/product-types', (req, res) => {
  try {
    const allTypes = productTypeService.getAllProductTypes()
    res.json({
      success: true,
      data: allTypes,
      count: allTypes.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/product-types/:productId', (req, res) => {
  try {
    const { productId } = req.params
    const productType = productTypeService.getProductType(productId)
    res.json({
      success: true,
      data: productType
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/enhanced/product-types/:productId', (req, res) => {
  try {
    const { productId } = req.params
    const { type, options } = req.body
    
    const productType = productTypeService.setProductType(productId, type, options)
    res.json({
      success: true,
      data: productType,
      message: `Product type updated to ${type}`
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/enhanced/product-types/:productId/configurable', (req, res) => {
  try {
    const { productId } = req.params
    const { baseProduct, variants } = req.body
    
    const configurableProduct = productTypeService.createConfigurableProduct(
      productId, 
      baseProduct, 
      variants
    )
    
    res.json({
      success: true,
      data: configurableProduct,
      message: 'Configurable product created successfully'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Stock Management API
app.get('/api/enhanced/stock/:productId', (req, res) => {
  try {
    const { productId } = req.params
    const stock = stockService.getProductStock(productId)
    res.json({
      success: true,
      data: stock
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/enhanced/stock/:productId/shared', (req, res) => {
  try {
    const { productId } = req.params
    const { shared_stock } = req.body
    
    const stock = stockService.updateSharedStock(productId, shared_stock)
    res.json({
      success: true,
      data: stock,
      message: `Shared stock updated to ${shared_stock}`
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/enhanced/stock/:productId/store/:storeId/toggle', (req, res) => {
  try {
    const { productId, storeId } = req.params
    const { enabled } = req.body
    
    const stock = stockService.toggleStoreStatus(productId, storeId, enabled)
    res.json({
      success: true,
      data: stock,
      message: `Store ${storeId} ${enabled ? 'enabled' : 'disabled'}`
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/stock/summary', (req, res) => {
  try {
    const summary = stockService.getStockSummary()
    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Discount Management API
app.get('/api/enhanced/discounts/:productId', (req, res) => {
  try {
    const { productId } = req.params
    const discounts = discountService.getProductDiscounts(productId)
    res.json({
      success: true,
      data: discounts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/discounts/:productId/active', (req, res) => {
  try {
    const { productId } = req.params
    const activeDiscounts = discountService.getActiveDiscounts(productId)
    res.json({
      success: true,
      data: activeDiscounts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/enhanced/discounts/:productId', (req, res) => {
  try {
    const { productId } = req.params
    const discountData = req.body
    
    const discount = discountService.createDiscount(productId, discountData)
    res.json({
      success: true,
      data: discount,
      message: 'Discount created successfully'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.put('/api/enhanced/discounts/:productId/:discountId', (req, res) => {
  try {
    const { productId, discountId } = req.params
    const updates = req.body
    
    const discount = discountService.updateDiscount(productId, discountId, updates)
    res.json({
      success: true,
      data: discount,
      message: 'Discount updated successfully'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.delete('/api/enhanced/discounts/:productId/:discountId', (req, res) => {
  try {
    const { productId, discountId } = req.params
    
    const result = discountService.deleteDiscount(productId, discountId)
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/discounts/summary', (req, res) => {
  try {
    const summary = discountService.getDiscountSummary()
    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Swatch Database API
app.get('/api/enhanced/swatches/summary', (req, res) => {
  try {
    const summary = swatchService.getSwatchSummary()
    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/swatches/search', (req, res) => {
  try {
    const { query, category } = req.query
    const searchResults = swatchService.searchSwatches(query, category)
    res.json({
      success: true,
      data: searchResults
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/swatches', (req, res) => {
  try {
    const allSwatches = swatchService.getAllSwatches()
    res.json({
      success: true,
      data: allSwatches
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/api/enhanced/swatches/:category', (req, res) => {
  try {
    const { category } = req.params
    const swatches = swatchService.getSwatchesByCategory(category)
    res.json({
      success: true,
      data: swatches
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.post('/api/enhanced/swatches/:category', (req, res) => {
  try {
    const { category } = req.params
    const swatchData = req.body
    
    const swatch = swatchService.addSwatch(category, swatchData)
    res.json({
      success: true,
      data: swatch,
      message: `Swatch added to category '${category}'`
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.put('/api/enhanced/swatches/:category/:swatchId', (req, res) => {
  try {
    const { category, swatchId } = req.params
    const updates = req.body
    
    const swatch = swatchService.updateSwatch(category, swatchId, updates)
    res.json({
      success: true,
      data: swatch,
      message: `Swatch updated in category '${category}'`
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.delete('/api/enhanced/swatches/:category/:swatchId', (req, res) => {
  try {
    const { category, swatchId } = req.params
    
    const result = swatchService.deleteSwatch(category, swatchId)
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Medusa Backend running on http://localhost:${PORT}`)
  console.log(`✅ Health check: http://localhost:${PORT}/health`)
  console.log(`✅ Enhanced services: http://localhost:${PORT}/api/enhanced/status`)
  console.log(`✅ Product Types API: http://localhost:${PORT}/api/enhanced/product-types`)
  console.log(`✅ Stock Management API: http://localhost:${PORT}/api/enhanced/stock`)
  console.log(`✅ Discount Management API: http://localhost:${PORT}/api/enhanced/discounts`)
  console.log(`✅ Swatch Database API: http://localhost:${PORT}/api/enhanced/swatches`)
})
