import React, { useState, useEffect } from 'react'
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Badge, 
  Select, 
  TextInput,
  Heading,
  Text,
  Container
} from '@medusajs/ui'

interface ProductTypeWidgetProps {
  product: any
}

const ProductTypeWidget = ({ product }: ProductTypeWidgetProps) => {
  const [productType, setProductType] = useState('simple')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product?.metadata?.product_type?.type) {
      setProductType(product.metadata.product_type.type)
    }
  }, [product])

  const updateProductType = async (type: string) => {
    setLoading(true)
    try {
      await fetch(`/admin/products/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            ...product.metadata,
            product_type: { type }
          }
        })
      })
      setProductType(type)
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

  return (
    <Container className="p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Heading level="h3">Product Type</Heading>
      </div>
      
      <div className="space-y-4">
        <div>
          <Text className="text-sm text-gray-600 mb-2">Current Type</Text>
          {getTypeBadge(productType)}
        </div>
        
        <div>
          <Text className="text-sm text-gray-600 mb-2">Change Type</Text>
          <Select
            value={productType}
            onValueChange={updateProductType}
            disabled={loading}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="simple">Simple Product</Select.Item>
              <Select.Item value="configurable">Configurable Product</Select.Item>
              <Select.Item value="grouped">Grouped Product</Select.Item>
              <Select.Item value="bundle">Bundle Product</Select.Item>
            </Select.Content>
          </Select>
        </div>

        {productType === 'configurable' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm text-blue-800">
              This product can have multiple variants with different attributes (size, color, etc.)
            </Text>
          </div>
        )}

        {productType === 'grouped' && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <Text className="text-sm text-orange-800">
              This product is a bundle of multiple simple products
            </Text>
          </div>
        )}

        {productType === 'bundle' && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <Text className="text-sm text-purple-800">
              This product allows customers to choose from multiple options
            </Text>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({ 
  zone: "product.details.after" 
}) 