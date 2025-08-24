import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Badge, 
  Select, 
  Container,
  Text,
  Heading
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface ProductTypeData {
  type: 'simple' | 'configurable' | 'grouped' | 'bundle'
  attributes?: string[]
  variantMatrix?: any[]
}

const ProductTypesWidget = ({ product }: { product: any }) => {
  const [productType, setProductType] = useState<ProductTypeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)

  useEffect(() => {
    if (product?.metadata?.product_type) {
      setProductType(product.metadata.product_type)
    }
  }, [product])

  const updateProductType = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/enhanced/product-types/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })
      
      if (response.ok) {
        const data = await response.json()
        setProductType(data.data)
        // Refresh the product data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating product type:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      simple: 'green',
      configurable: 'blue',
      grouped: 'orange',
      bundle: 'purple'
    } as const
    
    return <Badge color={colors[type as keyof typeof colors] || 'grey'}>{type}</Badge>
  }

  if (!product) return null

  return (
    <Container className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3" className="text-lg font-semibold">
          Product Type Management
        </Heading>
        {productType?.type === 'configurable' && (
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => setShowConfigModal(true)}
          >
            Configure Variants
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-medium">Current Type:</Text>
          {productType ? getTypeBadge(productType.type) : <Badge color="grey">Not Set</Badge>}
        </div>

        <div className="flex items-center gap-3">
          <Text className="font-medium">Change Type:</Text>
          <Select
            value={productType?.type || 'simple'}
            onValueChange={updateProductType}
            disabled={loading}
          >
            <option value="simple">Simple</option>
            <option value="configurable">Configurable</option>
            <option value="grouped">Grouped</option>
            <option value="bundle">Bundle</option>
          </Select>
        </div>

        {productType?.type === 'configurable' && productType.attributes && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              Configurable Product Attributes:
            </Text>
            <div className="space-y-1">
              {productType.attributes.map((attr, index) => (
                <Text key={index} className="text-sm text-blue-700">
                  • {attr}
                </Text>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductTypesWidget 