import { ProductType, ProductTypeData } from "./product-type.entity"

export class ProductTypeService {
  constructor(
    private readonly container: any
  ) {}

  /**
   * Get product type data from product metadata
   */
  async getProductType(productId: string): Promise<ProductTypeData | null> {
    const productService = this.container.resolve("product")
    const product = await productService.retrieveProduct(productId)
    
    if (!product?.metadata?.product_type) {
      return null
    }

    return product.metadata.product_type as ProductTypeData
  }

  /**
   * Set product type and related data
   */
  async setProductType(
    productId: string, 
    type: ProductType, 
    options?: any
  ): Promise<void> {
    const productService = this.container.resolve("product")
    const product = await productService.retrieveProduct(productId)
    
    let metadata = product?.metadata || {}
    
    metadata.product_type = {
      type,
      ...options
    }

    await productService.updateProducts(productId, { metadata })
  }

  /**
   * Create configurable product with variants
   */
  async createConfigurableProduct(
    productData: any,
    configurableOptions: {
      attributes: string[]
      variantMatrix: any[]
    }
  ): Promise<string> {
    const productService = this.container.resolve("product")
    
    // Create the main product
    const product = await productService.createProducts({
      title: productData.title,
      handle: productData.handle,
      description: productData.description,
      metadata: {
        product_type: {
          type: ProductType.CONFIGURABLE,
          configurable_options: configurableOptions
        }
      }
    })

    // Create product options
    for (const attribute of configurableOptions.attributes) {
      await productService.createProductOptions({
        product_id: product.id,
        title: attribute
      })
    }

    // Create variants based on the matrix
    for (const variantData of configurableOptions.variantMatrix) {
      const variant = await productService.createProductVariants({
        product_id: product.id,
        title: `${productData.title} - ${Object.values(variantData).join(' ')}`,
        sku: variantData.sku || `${productData.handle}-${Object.values(variantData).join('-')}`,
        inventory_quantity: variantData.inventory || 0,
        prices: [{
          amount: Math.round(variantData.price * 100), // Convert to cents
          currency_code: "usd"
        }]
      })

      // Create variant options
      for (const [attribute, value] of Object.entries(variantData)) {
        if (attribute !== 'price' && attribute !== 'sku' && attribute !== 'inventory') {
          await productService.updateProductOptionValues({
            variant_id: variant.id,
            value: value as string
          })
        }
      }
    }

    return product.id
  }

  /**
   * Create grouped product (bundle)
   */
  async createGroupedProduct(
    productData: any,
    groupedOptions: {
      product_ids: string[]
      bundle_price?: number
    }
  ): Promise<string> {
    const productService = this.container.resolve("product")
    
    const product = await productService.createProducts({
      title: productData.title,
      handle: productData.handle,
      description: productData.description,
      metadata: {
        product_type: {
          type: ProductType.GROUPED,
          grouped_products: groupedOptions
        }
      }
    })

    // Create a single variant for the bundle
    await productService.createProductVariants({
      product_id: product.id,
      title: productData.title,
      sku: `${productData.handle}-bundle`,
      inventory_quantity: 999, // High inventory for bundles
      prices: [{
        amount: Math.round((groupedOptions.bundle_price || 0) * 100),
        currency_code: "usd"
      }]
    })

    return product.id
  }

  /**
   * Get all products by type
   */
  async getProductsByType(type: ProductType): Promise<any[]> {
    const productService = this.container.resolve("product")
    const products = await productService.listProducts({
      metadata: {
        product_type: {
          type: type
        }
      }
    })

    return products
  }

  /**
   * Update configurable product variant matrix
   */
  async updateVariantMatrix(
    productId: string, 
    variantMatrix: any[]
  ): Promise<void> {
    const productType = await this.getProductType(productId)
    
    if (!productType || productType.type !== ProductType.CONFIGURABLE) {
      throw new Error("Product is not configurable")
    }

    const updatedOptions = {
      ...productType.configurable_options,
      variant_matrix: variantMatrix
    }

    await this.setProductType(productId, ProductType.CONFIGURABLE, {
      configurable_options: updatedOptions
    })
  }

  /**
   * Get variant matrix for configurable product
   */
  async getVariantMatrix(productId: string): Promise<any[]> {
    const productType = await this.getProductType(productId)
    
    if (!productType || productType.type !== ProductType.CONFIGURABLE) {
      return []
    }

    return productType.configurable_options?.variant_matrix || []
  }
} 