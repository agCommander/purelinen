import { SwatchData } from "./image-standards"

export class SwatchDatabaseService {
  constructor(
    private readonly container: any
  ) {}

  /**
   * Create a new swatch
   */
  async createSwatch(swatchData: Omit<SwatchData, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<string> {
    const productService = this.container.resolve("product")
    
    // Generate unique ID
    const swatchId = `swatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store swatch in system product
    const systemProductId = await this.getOrCreateSystemProduct('swatches')
    
    const existingSwatches = await this.getAllSwatches()
    existingSwatches.push({
      ...swatchData,
      id: swatchId,
      created_at: new Date(),
      updated_at: new Date(),
      usage_count: 0
    })

    await productService.updateProducts(systemProductId, {
      metadata: {
        swatches: existingSwatches
      }
    })

    return swatchId
  }

  /**
   * Get all swatches
   */
  async getAllSwatches(): Promise<SwatchData[]> {
    const productService = this.container.resolve("product")
    const systemProductId = await this.getOrCreateSystemProduct('swatches')
    
    try {
      const systemProduct = await productService.retrieveProduct(systemProductId)
      return systemProduct.metadata?.swatches || []
    } catch (error) {
      return []
    }
  }

  /**
   * Get swatch by ID
   */
  async getSwatch(swatchId: string): Promise<SwatchData | null> {
    const allSwatches = await this.getAllSwatches()
    return allSwatches.find(swatch => swatch.id === swatchId) || null
  }

  /**
   * Update swatch
   */
  async updateSwatch(swatchId: string, updates: Partial<SwatchData>): Promise<void> {
    const productService = this.container.resolve("product")
    const systemProductId = await this.getOrCreateSystemProduct('swatches')
    
    const allSwatches = await this.getAllSwatches()
    const swatchIndex = allSwatches.findIndex(s => s.id === swatchId)
    
    if (swatchIndex === -1) {
      throw new Error(`Swatch with ID ${swatchId} not found`)
    }

    allSwatches[swatchIndex] = {
      ...allSwatches[swatchIndex],
      ...updates,
      updated_at: new Date()
    }

    await productService.updateProducts(systemProductId, {
      metadata: {
        swatches: allSwatches
      }
    })
  }

  /**
   * Delete swatch
   */
  async deleteSwatch(swatchId: string): Promise<void> {
    const productService = this.container.resolve("product")
    const systemProductId = await this.getOrCreateSystemProduct('swatches')
    
    const allSwatches = await this.getAllSwatches()
    const filteredSwatches = allSwatches.filter(s => s.id !== swatchId)

    await productService.updateProducts(systemProductId, {
      metadata: {
        swatches: filteredSwatches
      }
    })
  }

  /**
   * Search swatches by name or color
   */
  async searchSwatches(query: string): Promise<SwatchData[]> {
    const allSwatches = await this.getAllSwatches()
    const lowerQuery = query.toLowerCase()
    
    return allSwatches.filter(swatch => 
      swatch.name.toLowerCase().includes(lowerQuery) ||
      swatch.color_name.toLowerCase().includes(lowerQuery) ||
      swatch.color_code.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get swatches by category
   */
  async getSwatchesByCategory(category: string): Promise<SwatchData[]> {
    const allSwatches = await this.getAllSwatches()
    return allSwatches.filter(swatch => swatch.category === category)
  }

  /**
   * Get popular swatches (most used)
   */
  async getPopularSwatches(limit: number = 10): Promise<SwatchData[]> {
    const allSwatches = await this.getAllSwatches()
    return allSwatches
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit)
  }

  /**
   * Increment usage count for a swatch
   */
  async incrementUsageCount(swatchId: string): Promise<void> {
    const swatch = await this.getSwatch(swatchId)
    if (swatch) {
      await this.updateSwatch(swatchId, {
        usage_count: swatch.usage_count + 1
      })
    }
  }

  /**
   * Decrement usage count for a swatch
   */
  async decrementUsageCount(swatchId: string): Promise<void> {
    const swatch = await this.getSwatch(swatchId)
    if (swatch && swatch.usage_count > 0) {
      await this.updateSwatch(swatchId, {
        usage_count: swatch.usage_count - 1
      })
    }
  }

  /**
   * Get swatch statistics
   */
  async getSwatchStatistics(): Promise<{
    total_swatches: number
    total_usage: number
    categories: string[]
    most_used_swatch?: SwatchData
  }> {
    const allSwatches = await this.getAllSwatches()
    const categories = [...new Set(allSwatches.map(s => s.category))]
    const totalUsage = allSwatches.reduce((sum, swatch) => sum + swatch.usage_count, 0)
    const mostUsed = allSwatches.length > 0 ? 
      allSwatches.reduce((max, swatch) => swatch.usage_count > max.usage_count ? swatch : max) : 
      undefined

    return {
      total_swatches: allSwatches.length,
      total_usage: totalUsage,
      categories,
      most_used_swatch: mostUsed
    }
  }

  /**
   * Export swatch report
   */
  async exportSwatchReport(): Promise<{
    headers: string[]
    data: any[][]
  }> {
    const allSwatches = await this.getAllSwatches()
    
    const headers = [
      'Swatch ID',
      'Name',
      'Color Code',
      'Color Name',
      'Category',
      'Usage Count',
      'Created At',
      'Updated At'
    ]
    
    const data: any[][] = allSwatches.map(swatch => [
      swatch.id,
      swatch.name,
      swatch.color_code,
      swatch.color_name,
      swatch.category,
      swatch.usage_count,
      swatch.created_at.toISOString().split('T')[0],
      swatch.updated_at.toISOString().split('T')[0]
    ])
    
    return { headers, data }
  }

  /**
   * Helper: Get or create system product for storing swatches
   */
  private async getOrCreateSystemProduct(type: string): Promise<string> {
    const productService = this.container.resolve("product")
    const handle = `system-${type}`
    
    try {
      const existingProduct = await productService.listProducts({ handle })
      if (existingProduct.length > 0) {
        return existingProduct[0].id
      }
    } catch (error) {
      // Product doesn't exist, create it
    }
    
    const systemProduct = await productService.createProducts({
      title: `System Product - ${type}`,
      handle: handle,
      description: `System product for storing ${type} data`,
      metadata: {
        system_product: true,
        system_type: type
      }
    })
    
    // Create a variant for the system product
    await productService.createProductVariants({
      product_id: systemProduct.id,
      title: `System Variant - ${type}`,
      sku: `system-${type}-variant`,
      inventory_quantity: 0,
      prices: [{
        amount: 0,
        currency_code: "usd"
      }]
    })
    
    return systemProduct.id
  }
} 