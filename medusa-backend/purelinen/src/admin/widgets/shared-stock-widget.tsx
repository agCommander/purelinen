import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Container,
  Text,
  Heading,
  Input,
  Switch
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface StoreStock {
  enabled: boolean
  min_stock: number
}

interface ProductStock {
  shared_stock: number
  store_stocks: {
    purelinen: StoreStock
    linenthings: StoreStock
  }
  updated_at: string
}

const SharedStockWidget = ({ product }: { product: any }) => {
  const [stockData, setStockData] = useState<ProductStock | null>(null)
  const [loading, setLoading] = useState(false)
  const [sharedStock, setSharedStock] = useState(0)
  const [storeSettings, setStoreSettings] = useState({
    purelinen: { enabled: true, min_stock: 10 },
    linenthings: { enabled: true, min_stock: 10 }
  })

  useEffect(() => {
    if (product?.metadata?.stock_management) {
      setStockData(product.metadata.stock_management)
      setSharedStock(product.metadata.stock_management.shared_stock || 0)
      setStoreSettings(product.metadata.stock_management.store_stocks || {
        purelinen: { enabled: true, min_stock: 10 },
        linenthings: { enabled: true, min_stock: 10 }
      })
    }
  }, [product])

  const updateSharedStock = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/enhanced/stock/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shared_stock: sharedStock,
          store_stocks: storeSettings
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setStockData(data.data)
        // Refresh the product data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStoreStatus = async (store: string) => {
    const newSettings = {
      ...storeSettings,
      [store]: {
        ...storeSettings[store as keyof typeof storeSettings],
        enabled: !storeSettings[store as keyof typeof storeSettings].enabled
      }
    }
    
    setStoreSettings(newSettings)
    
    try {
      await fetch(`/api/enhanced/stock/${product.id}/toggle-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          store,
          enabled: newSettings[store as keyof typeof storeSettings].enabled
        })
      })
    } catch (error) {
      console.error('Error toggling store status:', error)
    }
  }

  if (!product) return null

  return (
    <Container className="p-4 border border-gray-200 rounded-lg">
      <Heading level="h3" className="text-lg font-semibold mb-4">
        Shared Stock Management
      </Heading>

      <div className="space-y-4">
        {/* Shared Stock Input */}
        <div className="flex items-center gap-3">
          <Text className="font-medium w-24">Shared Stock:</Text>
          <Input
            type="number"
            value={sharedStock}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSharedStock(parseInt(e.target.value) || 0)}
            className="w-32"
            min="0"
          />
          <Button 
            onClick={updateSharedStock}
            disabled={loading}
            size="small"
          >
            Update
          </Button>
        </div>

        {/* Store Status */}
        <div className="space-y-3">
          <Text className="font-medium">Store Status:</Text>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
            <div>
              <Text className="font-medium">Pure Linen (B2B)</Text>
              <Text className="text-sm text-gray-600">
                Min Stock: {storeSettings.purelinen.min_stock}
              </Text>
            </div>
            <Switch
              checked={storeSettings.purelinen.enabled}
              onCheckedChange={() => toggleStoreStatus('purelinen')}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
            <div>
              <Text className="font-medium">Linen Things (B2C)</Text>
              <Text className="text-sm text-gray-600">
                Min Stock: {storeSettings.linenthings.min_stock}
              </Text>
            </div>
            <Switch
              checked={storeSettings.linenthings.enabled}
              onCheckedChange={() => toggleStoreStatus('linenthings')}
            />
          </div>
        </div>

        {/* Current Stock Display */}
        {stockData && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              Current Stock Status:
            </Text>
            <div className="space-y-1">
              <Text className="text-sm text-blue-700">
                • Shared Stock: {stockData.shared_stock} units
              </Text>
              <Text className="text-sm text-blue-700">
                • Pure Linen: {stockData.store_stocks.purelinen.enabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Text className="text-sm text-blue-700">
                • Linen Things: {stockData.store_stocks.linenthings.enabled ? 'Enabled' : 'Disabled'}
              </Text>
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

export default SharedStockWidget 