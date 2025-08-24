import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Container,
  Text,
  Heading,
  Input,
  Select
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface Discount {
  id: string
  type: 'percentage' | 'fixed'
  value: number
  start_date: string
  end_date: string
  stores: string[]
  active: boolean
}

const DiscountWidget = ({ product }: { product: any }) => {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDiscount, setNewDiscount] = useState<{
    type: 'percentage' | 'fixed'
    value: number
    start_date: string
    end_date: string
    stores: string[]
  }>({
    type: 'percentage',
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

  const createDiscount = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/enhanced/discounts/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDiscount)
      })
      
      if (response.ok) {
        const data = await response.json()
        setDiscounts([...discounts, data.data])
        setShowCreateModal(false)
        setNewDiscount({
          type: 'percentage',
          value: 0,
          start_date: '',
          end_date: '',
          stores: ['purelinen', 'linenthings']
        })
        // Refresh the product data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error creating discount:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDiscount = async (discountId: string) => {
    try {
      await fetch(`/api/enhanced/discounts/${product.id}/${discountId}`, {
        method: 'DELETE'
      })
      setDiscounts(discounts.filter(d => d.id !== discountId))
      // Refresh the product data
      window.location.reload()
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isActive = (discount: Discount) => {
    const now = new Date()
    const start = new Date(discount.start_date)
    const end = new Date(discount.end_date)
    return now >= start && now <= end && discount.active
  }

  if (!product) return null

  return (
    <Container className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3" className="text-lg font-semibold">
          Discount Management
        </Heading>
        <Button 
          onClick={() => setShowCreateModal(true)}
          size="small"
        >
          Add Discount
        </Button>
      </div>

      <div className="space-y-4">
        {/* Active Discounts */}
        {discounts.filter(isActive).length > 0 && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <Text className="text-sm font-medium text-green-800 mb-2">
              Active Discounts:
            </Text>
            <div className="space-y-2">
              {discounts.filter(isActive).map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <Text className="font-medium">
                      {discount.type === 'percentage' ? `${discount.value}% off` : `$${discount.value} off`}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
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
          </div>
        )}

        {/* All Discounts */}
        {discounts.length > 0 && (
          <div>
            <Text className="font-medium mb-2">All Discounts:</Text>
            <div className="space-y-2">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div>
                    <div className="flex items-center gap-2">
                      <Text className="font-medium">
                        {discount.type === 'percentage' ? `${discount.value}% off` : `$${discount.value} off`}
                      </Text>
                      {isActive(discount) && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <Text className="text-sm text-gray-600">
                      {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
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
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {discounts.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <Text>No discounts configured for this product</Text>
          </div>
        )}
      </div>

      {/* Create Discount Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <Heading level="h3" className="mb-4">Create New Discount</Heading>
            
            <div className="space-y-4">
              <div>
                <Text className="text-sm font-medium mb-1">Discount Type:</Text>
                <Select
                  value={newDiscount.type}
                  onValueChange={(value) => 
                    setNewDiscount({...newDiscount, type: value as 'percentage' | 'fixed'})
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </Select>
              </div>

              <div>
                <Text className="text-sm font-medium mb-1">
                  {newDiscount.type === 'percentage' ? 'Percentage:' : 'Amount:'}
                </Text>
                <Input
                  type="number"
                  value={newDiscount.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewDiscount({...newDiscount, value: parseFloat(e.target.value) || 0})
                  }
                  min="0"
                  max={newDiscount.type === 'percentage' ? 100 : undefined}
                />
              </div>

              <div>
                <Text className="text-sm font-medium mb-1">Start Date:</Text>
                <Input
                  type="date"
                  value={newDiscount.start_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewDiscount({...newDiscount, start_date: e.target.value})
                  }
                />
              </div>

              <div>
                <Text className="text-sm font-medium mb-1">End Date:</Text>
                <Input
                  type="date"
                  value={newDiscount.end_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewDiscount({...newDiscount, end_date: e.target.value})
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={createDiscount}
                  disabled={loading || !newDiscount.start_date || !newDiscount.end_date}
                  className="flex-1"
                >
                  Create Discount
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
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
  zone: "product.details.after",
})

export default DiscountWidget 