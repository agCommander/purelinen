import { ProductType } from "../product-types/product-type.entity"

export interface StoreStockData {
  store_id: string
  store_name: string
  enabled: boolean
  min_stock_level: number
  allow_backorders: boolean
  last_updated: Date
}

export interface ProductStockInfo {
  product_id: string
  product_title: string
  sku: string
  shared_stock: number
  store_stocks: StoreStockData[]
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  last_updated: Date
}

export class StockManagementService {
  constructor(
    private readonly container: any
  ) {}

  /**
   * Get stock information for a product across all stores
   */
  async getProductStock(productId: string): Promise<ProductStockInfo> {
    const productService = this.container.resolve("product")
    const product = await productService.retrieveProduct(productId)

    const storeStocks: StoreStockData[] = []

    // Get store-specific settings from metadata
    const storeStockData = product.metadata?.store_stocks || {}
    
    for (const [storeId, stockData] of Object.entries(storeStockData)) {
      const storeStock = stockData as any
      storeStocks.push({
        store_id: storeId,
        store_name: storeStock.store_name || storeId,
        enabled: storeStock.enabled !== false,
        min_stock_level: storeStock.min_stock_level || 10,
        allow_backorders: storeStock.allow_backorders || false,
        last_updated: new Date(storeStock.last_updated || Date.now())
      })
    }

    // Get shared stock from product metadata
    const sharedStock = product.metadata?.shared_stock || 0

    // Determine overall stock status based on the lowest min_stock_level
    const minStockLevel = Math.min(...storeStocks.map(s => s.min_stock_level), 10)
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
    
    if (sharedStock === 0) {
      stockStatus = 'out_of_stock'
    } else if (sharedStock <= minStockLevel) {
      stockStatus = 'low_stock'
    }

    return {
      product_id: productId,
      product_title: product.title,
      sku: product.variants?.[0]?.sku || '',
      shared_stock: sharedStock,
      store_stocks: storeStocks,
      stock_status: stockStatus,
      last_updated: new Date()
    }
  }

  /**
   * Update shared stock for a product
   */
  async updateSharedStock(
    productId: string,
    stockQuantity: number
  ): Promise<void> {
    const productService = this.container.resolve("product")
    const product = await productService.retrieveProduct(productId)
    
    let metadata = product.metadata || {}

    await productService.updateProducts(productId, {
      metadata: {
        ...metadata,
        shared_stock: stockQuantity
      }
    })
  }

  /**
   * Update store settings (enable/disable, min stock level, etc.)
   */
  async updateStoreSettings(
    productId: string,
    storeId: string,
    settings: Partial<StoreStockData>
  ): Promise<void> {
    const productService = this.container.resolve("product")
    const product = await productService.retrieveProduct(productId)
    
    let metadata = product.metadata || {}
    let storeStocks = metadata.store_stocks || {}
    
    // Update or create store settings
    storeStocks[storeId] = {
      ...storeStocks[storeId],
      ...settings,
      last_updated: new Date().toISOString()
    }

    await productService.updateProducts(productId, {
      metadata: {
        ...metadata,
        store_stocks: storeStocks
      }
    })
  }

  /**
   * Bulk update stock for multiple products
   */
  async bulkUpdateStock(
    updates: Array<{
      product_id: string
      stock_quantity: number
    }>
  ): Promise<void> {
    const productService = this.container.resolve("product")
    
    for (const update of updates) {
      await this.updateSharedStock(
        update.product_id,
        update.stock_quantity
      )
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(limit: number = 50): Promise<ProductStockInfo[]> {
    const productService = this.container.resolve("product")
    const products = await productService.listProducts({}, { take: 1000 })
    
    const lowStockProducts: ProductStockInfo[] = []
    
    for (const product of products) {
      const stockInfo = await this.getProductStock(product.id)
      if (stockInfo.stock_status === 'low_stock' || stockInfo.stock_status === 'out_of_stock') {
        lowStockProducts.push(stockInfo)
        if (lowStockProducts.length >= limit) break
      }
    }
    
    return lowStockProducts
  }

  /**
   * Get stock summary statistics
   */
  async getStockSummary(): Promise<{
    total_products: number
    in_stock: number
    low_stock: number
    out_of_stock: number
    total_stock_value: number
  }> {
    const productService = this.container.resolve("product")
    const products = await productService.listProducts({}, { take: 1000 })
    
    let inStock = 0
    let lowStock = 0
    let outOfStock = 0
    let totalValue = 0
    
    for (const product of products) {
      const stockInfo = await this.getProductStock(product.id)
      
      switch (stockInfo.stock_status) {
        case 'in_stock':
          inStock++
          break
        case 'low_stock':
          lowStock++
          break
        case 'out_of_stock':
          outOfStock++
          break
      }
      
      // Calculate stock value (simplified)
      const avgPrice = product.variants?.[0]?.prices?.[0]?.amount || 0
      totalValue += (stockInfo.shared_stock * avgPrice) / 100 // Convert from cents
    }
    
    return {
      total_products: products.length,
      in_stock: inStock,
      low_stock: lowStock,
      out_of_stock: outOfStock,
      total_stock_value: totalValue
    }
  }

  /**
   * Set store status (enabled/disabled)
   */
  async setStoreStatus(
    productId: string,
    storeId: string,
    enabled: boolean
  ): Promise<void> {
    await this.updateStoreSettings(productId, storeId, { enabled })
  }

  /**
   * Get products by store status
   */
  async getProductsByStoreStatus(
    storeId: string,
    enabled: boolean
  ): Promise<any[]> {
    const productService = this.container.resolve("product")
    const products = await productService.listProducts({}, { take: 1000 })
    
    const filteredProducts: any[] = []
    
    for (const product of products) {
      const storeStocks = product.metadata?.store_stocks || {}
      const storeStock = storeStocks[storeId]
      
      if (storeStock && storeStock.enabled === enabled) {
        filteredProducts.push(product)
      }
    }
    
    return filteredProducts
  }

  /**
   * Export stock report
   */
  async exportStockReport(): Promise<{
    headers: string[]
    data: any[][]
  }> {
    const productService = this.container.resolve("product")
    const products = await productService.listProducts({}, { take: 1000 })
    
    const headers = [
      'Product ID',
      'Product Title',
      'SKU',
      'Shared Stock',
      'Pure Linen Status',
      'Linen Things Status',
      'Stock Status',
      'Last Updated'
    ]
    
    const data: any[][] = []
    
    for (const product of products) {
      const stockInfo = await this.getProductStock(product.id)
      const pureLinenStock = stockInfo.store_stocks.find(s => s.store_id === 'purelinen') || { enabled: false }
      const linenThingsStock = stockInfo.store_stocks.find(s => s.store_id === 'linenthings') || { enabled: false }
      
      data.push([
        product.id,
        product.title,
        stockInfo.sku,
        stockInfo.shared_stock,
        pureLinenStock.enabled ? 'Enabled' : 'Disabled',
        linenThingsStock.enabled ? 'Enabled' : 'Disabled',
        stockInfo.stock_status,
        stockInfo.last_updated.toISOString()
      ])
    }
    
    return { headers, data }
  }
} 