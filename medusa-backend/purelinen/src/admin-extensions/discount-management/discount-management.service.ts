export interface DiscountData {
  id: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  start_date: Date
  end_date: Date
  stores: string[]
  products: string[]
  categories?: string[]
  active: boolean
  created_at: Date
  updated_at: Date
}

export interface DiscountPreview {
  original_price: number
  discounted_price: number
  savings: number
  savings_percentage: number
}

export class DiscountManagementService {
  constructor(
    private readonly container: any
  ) {}

  /**
   * Create a new discount
   */
  async createDiscount(discountData: Omit<DiscountData, 'id' | 'active' | 'created_at' | 'updated_at'>): Promise<string> {
    const productService = this.container.resolve("product")
    
    // Generate unique ID
    const discountId = `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store discount in a special product's metadata (we'll use a system product)
    const systemProductId = await this.getOrCreateSystemProduct('discounts')
    
    const existingDiscounts = await this.getAllDiscounts()
    existingDiscounts.push({
      ...discountData,
      id: discountId,
      active: this.isDiscountActive(discountData.start_date, discountData.end_date),
      created_at: new Date(),
      updated_at: new Date()
    })

    await productService.updateProducts(systemProductId, {
      metadata: {
        discounts: existingDiscounts
      }
    })

    return discountId
  }

  /**
   * Get all discounts
   */
  async getAllDiscounts(): Promise<DiscountData[]> {
    const productService = this.container.resolve("product")
    const systemProductId = await this.getOrCreateSystemProduct('discounts')
    
    try {
      const systemProduct = await productService.retrieveProduct(systemProductId)
      return systemProduct.metadata?.discounts || []
    } catch (error) {
      return []
    }
  }

  /**
   * Get active discounts for a specific product and store
   */
  async getActiveDiscounts(productId: string, storeId: string): Promise<DiscountData[]> {
    const allDiscounts = await this.getAllDiscounts()
    const now = new Date()
    
    return allDiscounts.filter(discount => {
      // Check if discount is active
      if (!discount.active) return false
      
      // Check date range
      if (now < discount.start_date || now > discount.end_date) return false
      
      // Check if applies to this product
      if (!discount.products.includes(productId)) return false
      
      // Check if applies to this store
      if (!discount.stores.includes(storeId)) return false
      
      return true
    })
  }

  /**
   * Calculate discount preview for a product
   */
  async calculateDiscountPreview(
    productId: string,
    storeId: string,
    originalPrice: number
  ): Promise<DiscountPreview | null> {
    const activeDiscounts = await this.getActiveDiscounts(productId, storeId)
    
    if (activeDiscounts.length === 0) {
      return null
    }

    // For now, apply the first active discount (could be enhanced to stack discounts)
    const discount = activeDiscounts[0]
    
    let discountedPrice = originalPrice
    let savings = 0

    if (discount.discount_type === 'percentage') {
      savings = originalPrice * (discount.discount_value / 100)
      discountedPrice = originalPrice - savings
    } else {
      savings = Math.min(discount.discount_value, originalPrice)
      discountedPrice = originalPrice - savings
    }

    return {
      original_price: originalPrice,
      discounted_price: Math.max(0, discountedPrice),
      savings: savings,
      savings_percentage: (savings / originalPrice) * 100
    }
  }

  /**
   * Update discount
   */
  async updateDiscount(discountId: string, updates: Partial<DiscountData>): Promise<void> {
    const productService = this.container.resolve("product")
    const systemProductId = await this.getOrCreateSystemProduct('discounts')
    
    const allDiscounts = await this.getAllDiscounts()
    const discountIndex = allDiscounts.findIndex(d => d.id === discountId)
    
    if (discountIndex === -1) {
      throw new Error(`Discount with ID ${discountId} not found`)
    }

    allDiscounts[discountIndex] = {
      ...allDiscounts[discountIndex],
      ...updates,
      updated_at: new Date()
    }

    // Recalculate active status
    if (updates.start_date || updates.end_date) {
      allDiscounts[discountIndex].active = this.isDiscountActive(
        allDiscounts[discountIndex].start_date,
        allDiscounts[discountIndex].end_date
      )
    }

    await productService.updateProducts(systemProductId, {
      metadata: {
        discounts: allDiscounts
      }
    })
  }

  /**
   * Delete discount
   */
  async deleteDiscount(discountId: string): Promise<void> {
    const productService = this.container.resolve("product")
    const systemProductId = await this.getOrCreateSystemProduct('discounts')
    
    const allDiscounts = await this.getAllDiscounts()
    const filteredDiscounts = allDiscounts.filter(d => d.id !== discountId)

    await productService.updateProducts(systemProductId, {
      metadata: {
        discounts: filteredDiscounts
      }
    })
  }

  /**
   * Bulk create discounts
   */
  async bulkCreateDiscounts(
    discountTemplate: Omit<DiscountData, 'id' | 'active' | 'created_at' | 'updated_at'>,
    productIds: string[]
  ): Promise<string[]> {
    const createdIds: string[] = []
    
    for (const productId of productIds) {
      const discountId = await this.createDiscount({
        ...discountTemplate,
        products: [productId]
      })
      createdIds.push(discountId)
    }
    
    return createdIds
  }

  /**
   * Get discounts by status
   */
  async getDiscountsByStatus(status: 'active' | 'expired' | 'scheduled'): Promise<DiscountData[]> {
    const allDiscounts = await this.getAllDiscounts()
    const now = new Date()
    
    return allDiscounts.filter(discount => {
      switch (status) {
        case 'active':
          return discount.active && now >= discount.start_date && now <= discount.end_date
        case 'expired':
          return now > discount.end_date
        case 'scheduled':
          return now < discount.start_date
        default:
          return false
      }
    })
  }

  /**
   * Get discount statistics
   */
  async getDiscountStatistics(): Promise<{
    total_discounts: number
    active_discounts: number
    expired_discounts: number
    scheduled_discounts: number
    total_products_with_discounts: number
  }> {
    const allDiscounts = await this.getAllDiscounts()
    const now = new Date()
    
    let active = 0
    let expired = 0
    let scheduled = 0
    const productsWithDiscounts = new Set<string>()
    
    for (const discount of allDiscounts) {
      if (now >= discount.start_date && now <= discount.end_date) {
        active++
      } else if (now > discount.end_date) {
        expired++
      } else if (now < discount.start_date) {
        scheduled++
      }
      
      discount.products.forEach(productId => productsWithDiscounts.add(productId))
    }
    
    return {
      total_discounts: allDiscounts.length,
      active_discounts: active,
      expired_discounts: expired,
      scheduled_discounts: scheduled,
      total_products_with_discounts: productsWithDiscounts.size
    }
  }

  /**
   * Export discount report
   */
  async exportDiscountReport(): Promise<{
    headers: string[]
    data: any[][]
  }> {
    const allDiscounts = await this.getAllDiscounts()
    
    const headers = [
      'Discount ID',
      'Name',
      'Type',
      'Value',
      'Start Date',
      'End Date',
      'Stores',
      'Products Count',
      'Status',
      'Created At'
    ]
    
    const data: any[][] = allDiscounts.map(discount => [
      discount.id,
      discount.name,
      discount.discount_type,
      discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `$${discount.discount_value}`,
      discount.start_date.toISOString().split('T')[0],
      discount.end_date.toISOString().split('T')[0],
      discount.stores.join(', '),
      discount.products.length,
      discount.active ? 'Active' : 'Inactive',
      discount.created_at.toISOString().split('T')[0]
    ])
    
    return { headers, data }
  }

  /**
   * Helper: Check if discount is active based on dates
   */
  private isDiscountActive(startDate: Date, endDate: Date): boolean {
    const now = new Date()
    return now >= startDate && now <= endDate
  }

  /**
   * Helper: Get or create system product for storing discounts
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