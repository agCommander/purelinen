import React, { useState, useEffect } from 'react'
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Badge, 
  TextInput,
  Heading,
  Text,
  Container,
  Switch
} from '@medusajs/ui'

interface SharedStockWidgetProps {
  product: any
}

interface StockData {
  store_id: string
  stock_quantity: number
  enabled: boolean
  min_stock: number
}

const SharedStockWidget = ({ product }: SharedStockWidgetProps) => {
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product?.metadata?.shared_stock) {
      const sharedStock = product.metadata.shared_stock
      const stores = [
        { store_id: 'purelinen', name: 'Pure Linen' },
        { store_id: 'linenthings', name: 'Linen Things' }
      ]
      
      const initialStockData = stores.map(store => ({
        store_id: store.store_id,
        stock_quantity: sharedStock.total_stock || 0,
        enabled: sharedStock.store_stocks?.[store.store_id]?.enabled !== false,
        min_stock: sharedStock.store_stocks?.[store.store_id]?.min_stock || 10
      }))
      
      setStockData(initialStockData)
    }
  }, [product])

  const updateSharedStock = async (stock: number) => {
    setLoading(true)
    try {
      const updatedMetadata = {
        ...product.metadata,
        shared_stock: {
          ...product.metadata?.shared_stock,
          total_stock: stock
        }
      }
      
      await fetch(`/admin/products/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: updatedMetadata
        })
      })
      
      setStockData(prev => prev.map(item => ({ ...item, stock_quantity: stock })))
    } catch (error) {
      console.error('Error updating shared stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStoreStatus = async (storeId: string, enabled: boolean) => {
    setLoading(true)
    try {
      const updatedMetadata = {
        ...product.metadata,
        shared_stock: {
          ...product.metadata?.shared_stock,
          store_stocks: {
            ...product.metadata?.shared_stock?.store_stocks,
            [storeId]: {
              ...product.metadata?.shared_stock?.store_stocks?.[storeId],
              enabled
            }
          }
        }
      }
      
      await fetch(`/admin/products/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: updatedMetadata
        })
      })
      
      setStockData(prev => prev.map(item => 
        item.store_id === storeId ? { ...item, enabled } : item
      ))
    } catch (error) {
      console.error('Error updating store status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'red' as const }
    if (stock <= 10) return { status: 'Low Stock', color: 'orange' as const }
    return { status: 'In Stock', color: 'green' as const }
  }

  const totalStock = stockData.reduce((sum, item) => sum + item.stock_quantity, 0)
  const stockStatus = getStockStatus(totalStock)

  return (
    <Container className="p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Heading level="h3">Shared Stock Management</Heading>
      </div>
      
      <div className="space-y-4">
        <div>
          <Text className="text-sm text-gray-600 mb-2">Total Shared Stock</Text>
          <div className="flex items-center gap-3">
            <TextInput
              type="number"
              value={totalStock}
              onChange={(e) => updateSharedStock(parseInt(e.target.value) || 0)}
              disabled={loading}
              className="w-24"
            />
            <Badge color={stockStatus.color}>{stockStatus.status}</Badge>
          </div>
        </div>

        <div>
          <Text className="text-sm text-gray-600 mb-2">Store Availability</Text>
          <div className="space-y-2">
            {stockData.map((store) => (
              <div key={store.store_id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <Text className="font-medium capitalize">{store.store_id}</Text>
                  <Text className="text-sm text-gray-500">
                    Stock: {store.stock_quantity} | Min: {store.min_stock}
                  </Text>
                </div>
                <Switch
                  checked={store.enabled}
                  onCheckedChange={(checked) => updateStoreStatus(store.store_id, checked)}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        </div>

        {stockStatus.color === 'red' && (
          <div className="p-3 bg-red-50 rounded-lg">
            <Text className="text-sm text-red-800">
              ⚠️ This product is out of stock across all stores
            </Text>
          </div>
        )}

        {stockStatus.color === 'orange' && (
          <div className="p-3 bg-orange-50 rounded-lg">
            <Text className="text-sm text-orange-800">
              ⚠️ Low stock alert - consider restocking soon
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