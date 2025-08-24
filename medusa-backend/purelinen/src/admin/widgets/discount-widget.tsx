import React, { useState, useEffect } from 'react'
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Badge, 
  TextInput,
  Heading,
  Text,
  Container,
  Select
} from '@medusajs/ui'

interface DiscountWidgetProps {
  product: any
}

interface Discount {
  id: string
  type: 'percentage' | 'fixed'
  value: number
  start_date: string
  end_date: string
  stores: string[]
}

const DiscountWidget = ({ product }: DiscountWidgetProps) => {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDiscount, setNewDiscount] = useState({
    type: 'percentage' as const,
    value: 0,
    start_date: '',
    end_date: '',
    stores: ['purelinen', 'linenthings']
  })

  useEffect(() => {
    if (product?.metadata?.discounts) {
      setDiscounts(product.metadata.discounts)
    }
  }, [product])

  const createDiscount = async (discountData: Omit<Discount, 'id'>) => {
    const discount: Discount = {
      ...discountData,
      id: Date.now().toString()
    }
    
    const updatedDiscounts = [...discounts, discount]
    
    try {
      await fetch(`/admin/products/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            ...product.metadata,
            discounts: updatedDiscounts
          }
        })
      })
      
      setDiscounts(updatedDiscounts)
      setShowAddModal(false)
      setNewDiscount({
        type: 'percentage',
        value: 0,
        start_date: '',
        end_date: '',
        stores: ['purelinen', 'linenthings']
      })
    } catch (error) {
      console.error('Error creating discount:', error)
    }
  }

  const deleteDiscount = async (discountId: string) => {
    const updatedDiscounts = discounts.filter(d => d.id !== discountId)
    
    try {
      await fetch(`/admin/products/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            ...product.metadata,
            discounts: updatedDiscounts
          }
        })
      })
      
      setDiscounts(updatedDiscounts)
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }

  const isDiscountActive = (discount: Discount) => {
    const now = new Date()
    const start = new Date(discount.start_date)
    const end = new Date(discount.end_date)
    return now >= start && now <= end
  }

  const activeDiscounts = discounts.filter(isDiscountActive)

  return (
    <Container className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3">Product Discounts</Heading>
        <Button onClick={() => setShowAddModal(true)}>
          Add Discount
        </Button>
      </div>
      
      <div className="space-y-4">
        {activeDiscounts.length > 0 ? (
          <div className="space-y-2">
            {activeDiscounts.map((discount) => (
              <div key={discount.id} className="flex items-center justify-between p-3 border rounded bg-green-50">
                <div>
                  <Badge color="green">
                    {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                  </Badge>
                  <Text className="text-sm text-gray-600 mt-1">
                    {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.end_date).toLocaleDateString()}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Stores: {discount.stores.join(', ')}
                  </Text>
                </div>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => deleteDiscount(discount.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Text className="text-gray-500">No active discounts</Text>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <Heading level="h4" className="mb-4">Add New Discount</Heading>
            
            <div className="space-y-4">
              <div>
                <Text className="text-sm text-gray-600 mb-2">Discount Type</Text>
                <Select
                  value={newDiscount.type}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setNewDiscount(prev => ({ ...prev, type: value }))
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="percentage">Percentage</Select.Item>
                    <Select.Item value="fixed">Fixed Amount</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div>
                <Text className="text-sm text-gray-600 mb-2">
                  {newDiscount.type === 'percentage' ? 'Percentage' : 'Amount'}
                </Text>
                <TextInput
                  type="number"
                  value={newDiscount.value}
                  onChange={(e) => setNewDiscount(prev => ({ 
                    ...prev, 
                    value: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder={newDiscount.type === 'percentage' ? '10' : '5.00'}
                />
              </div>

              <div>
                <Text className="text-sm text-gray-600 mb-2">Start Date</Text>
                <TextInput
                  type="date"
                  value={newDiscount.start_date}
                  onChange={(e) => setNewDiscount(prev => ({ 
                    ...prev, 
                    start_date: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Text className="text-sm text-gray-600 mb-2">End Date</Text>
                <TextInput
                  type="date"
                  value={newDiscount.end_date}
                  onChange={(e) => setNewDiscount(prev => ({ 
                    ...prev, 
                    end_date: e.target.value 
                  }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => createDiscount(newDiscount)}
                  disabled={!newDiscount.start_date || !newDiscount.end_date || newDiscount.value <= 0}
                >
                  Create Discount
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({ 
  zone: "product.details.after" 
}) 