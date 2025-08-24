export enum ProductType {
  SIMPLE = "simple",
  CONFIGURABLE = "configurable", 
  GROUPED = "grouped",
  BUNDLE = "bundle"
}

// For Medusa v2, we'll use a simpler approach with custom fields
// This will be implemented as product metadata instead of a separate entity
export interface ProductTypeData {
  type: ProductType
  configurable_options?: {
    attributes: string[]
    variant_matrix?: any[]
  }
  grouped_products?: {
    product_ids: string[]
    bundle_price?: number
  }
  bundle_options?: {
    components: Array<{
      product_id: string
      required: boolean
      default_quantity: number
    }>
    pricing_rule?: string
  }
}

// Helper function to get product type from metadata
export function getProductType(product: any): ProductType {
  const typeData = product.metadata?.product_type as ProductTypeData
  return typeData?.type || ProductType.SIMPLE
}

// Helper function to set product type in metadata
export function setProductType(product: any, type: ProductType, options?: any): void {
  if (!product.metadata) {
    product.metadata = {}
  }
  
  product.metadata.product_type = {
    type,
    ...options
  }
} 