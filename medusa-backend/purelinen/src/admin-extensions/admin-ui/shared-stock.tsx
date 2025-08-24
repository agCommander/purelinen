import React, { useState, useEffect } from 'react'
import { 
  Button, 
  Card, 
  Badge, 
  TextInput, 
  Modal, 
  Table,
  Select,
  Switch
} from '@medusajs/ui'
import { 
  Plus, 
  Edit, 
  Package,
  Store,
  TrendingUp,
  AlertTriangle
} from '@medusajs/icons'

interface StockData {
  productId: string
  sharedStock: number
  purelinenEnabled: boolean
  linenthingsEnabled: boolean
  lowStockThreshold: number
}

const SharedStockPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [stockData, setStockData] = useState<StockData[]>([])
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/admin/products')
      const data = await response.json()
      setProducts(data.products || [])
      
      // Initialize stock data
      const stock = data.products.map((product: any) => ({
        productId: product.id,
        sharedStock: product.metadata?.shared_stock || 0,
        purelinenEnabled: product.metadata?.store_stocks?.purelinen?.enabled !== false,
        linenthingsEnabled: product.metadata?.store_stocks?.linenthings?.enabled !== false,
        lowStockThreshold: 10
      }))
      setStockData(stock)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, stock: number) => {
    try {
      await fetch(`/admin/products/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            shared_stock: stock
          }
        })
      })
      fetchProducts()
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const updateStoreStatus = async (productId: string, store: string, enabled: boolean) => {
    try {
      const currentData = stockData.find(s => s.productId === productId)
      const storeStocks = {
        ...currentData?.purelinenEnabled !== undefined && { purelinen: { enabled: currentData.purelinenEnabled } },
        ...currentData?.linenthingsEnabled !== undefined && { linenthings: { enabled: currentData.linenthingsEnabled } },
        [store]: { enabled }
      }

      await fetch(`/admin/products/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            store_stocks: storeStocks
          }
        })
      })
      fetchProducts()
    } catch (error) {
      console.error('Error updating store status:', error)
    }
  }

  const getStockStatus = (stock: number, threshold: number = 10) => {
    if (stock === 0) return { status: 'out', text: 'Out of Stock', color: 'red' }
    if (stock <= threshold) return { status: 'low', text: 'Low Stock', color: 'orange' }
    return { status: 'in', text: 'In Stock', color: 'green' }
  }

  const getLowStockProducts = () => {
    return stockData.filter(item => item.sharedStock <= item.lowStockThreshold)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const lowStockCount = getLowStockProducts().length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shared Stock Management</h1>
          <p className="text-gray-600">Manage stock levels across both stores</p>
        </div>
        <Button onClick={() => setShowStockModal(true)}>
          <Plus />
          Bulk Stock Update
        </Button>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {products.length}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stockData.filter(item => item.sharedStock > 0).length}
            </div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {lowStockCount}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stockData.filter(item => item.sharedStock === 0).length}
            </div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <div className="p-4 flex items-center">
            <AlertTriangle className="text-orange-600 mr-2" />
            <div>
              <div className="font-semibold text-orange-800">
                Low Stock Alert: {lowStockCount} products need attention
              </div>
              <div className="text-sm text-orange-600">
                Products with stock levels below threshold
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stock Management Table */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Stock Levels</h2>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Shared Stock</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Pure Linen</Table.HeaderCell>
                <Table.HeaderCell>Linen Things</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map((product) => {
                const stock = stockData.find(s => s.productId === product.id)
                const stockStatus = getStockStatus(stock?.sharedStock || 0)
                
                return (
                  <Table.Row key={product.id}>
                    <Table.Cell>
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.handle}</div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <TextInput
                        type="number"
                        value={stock?.sharedStock || 0}
                        onChange={(e) => {
                          const newStock = parseInt(e.target.value) || 0
                          updateStock(product.id, newStock)
                        }}
                        className="w-20"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={stockStatus.color}>
                        {stockStatus.text}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Switch
                        checked={stock?.purelinenEnabled || false}
                        onCheckedChange={(checked) => 
                          updateStoreStatus(product.id, 'purelinen', checked)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Switch
                        checked={stock?.linenthingsEnabled || false}
                        onCheckedChange={(checked) => 
                          updateStoreStatus(product.id, 'linenthings', checked)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowStockModal(true)
                        }}
                      >
                        <Edit />
                        Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Stock Update Modal */}
      <Modal open={showStockModal} onOpenChange={setShowStockModal}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {selectedProduct ? 'Update Stock' : 'Bulk Stock Update'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="font-medium">{selectedProduct.title}</div>
                  <TextInput
                    label="Shared Stock Level"
                    type="number"
                    placeholder="Enter stock level"
                  />
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="purelinen" />
                      <label htmlFor="purelinen">Enable for Pure Linen</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="linenthings" />
                      <label htmlFor="linenthings">Enable for Linen Things</label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Select label="Update Type">
                    <Select.Trigger>
                      <Select.Value placeholder="Select update type" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="set">Set to specific value</Select.Item>
                      <Select.Item value="add">Add to current stock</Select.Item>
                      <Select.Item value="subtract">Subtract from current stock</Select.Item>
                    </Select.Content>
                  </Select>
                  <TextInput
                    label="Stock Value"
                    type="number"
                    placeholder="Enter stock value"
                  />
                  <Select label="Apply to Products">
                    <Select.Trigger>
                      <Select.Value placeholder="Select products" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="all">All products</Select.Item>
                      <Select.Item value="low">Low stock products</Select.Item>
                      <Select.Item value="out">Out of stock products</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStockModal(false)}>
              Cancel
            </Button>
            <Button>Update Stock</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  )
}

export default SharedStockPage 